import crypto from 'crypto';
import { Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../supabase';
import { isFreemium, requestAccess } from './premium-access.service';

const embeddedFields = new Set(['content', 'contents', 'description']);
export const resourceUrls = (text: string) =>
  text.match(/(?:https?:\/\/|supabase:\/\/)[^\s"'<>]+/g) || [];
const fields = new Set([
  'business_note',
  'quick_bite',
  'exit_rationale',
  'pdf_url',
  'stock_recommendation_url',
  'video',
]);
const tables: Record<string, string> = {
  recommendations: 'recommendations',
  tactical: 'tactical_ideas',
  scratchpad: 'scratch_pad_newsletters',
  webinars: 'webinars',
};
export function storageLocation(value: string): { bucket: string; path: string } | null {
  if (value.startsWith('supabase://')) {
    const u = new URL(value);
    return { bucket: u.hostname, path: decodeURIComponent(u.pathname.slice(1)) };
  }
  try {
    const u = new URL(value),
      own = new URL(process.env.SUPABASE_URL || 'https://ftuuyfhfrhvlllfwfbjx.supabase.co');
    if (u.origin !== own.origin) return null;
    const match = u.pathname.match(
      /^\/storage\/v1\/object\/(?:public|authenticated|sign)\/([^/]+)\/(.+)$/,
    );
    return match
      ? { bucket: decodeURIComponent(match[1]), path: decodeURIComponent(match[2]) }
      : null;
  } catch {
    return null;
  }
}
export function protectResearchLinks(
  value: any,
  kind: string,
  id: string,
  path: string[] = [],
): any {
  if (Array.isArray(value))
    return value.map((v, i) => protectResearchLinks(v, kind, id, [...path, String(i)]));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        protectResearchLinks(v, kind, id, [...path, key]),
      ]),
    );
  if (
    typeof value === 'string' &&
    fields.has(path[path.length - 1]) &&
    /^(https?:\/\/|supabase:\/\/)/.test(value)
  ) {
    const base = (process.env.PUBLIC_API_URL || 'https://dev-api.bastionresearch.in').replace(
      /\/$/,
      '',
    );
    return `${base}/api/research-assets/${kind}/${encodeURIComponent(id)}?field=${encodeURIComponent(path.join('.'))}`;
  }
  if (typeof value === 'string' && embeddedFields.has(path[path.length - 1])) {
    let output = value;
    for (const url of resourceUrls(value))
      if (storageLocation(url)?.path.toLowerCase().endsWith('.pdf')) {
        const base = (process.env.PUBLIC_API_URL || 'https://dev-api.bastionresearch.in').replace(
          /\/$/,
          '',
        );
        const asset = crypto.createHash('sha256').update(url).digest('hex');
        output = output
          .split(url)
          .join(
            `${base}/api/research-assets/${kind}/${encodeURIComponent(id)}?field=${encodeURIComponent(path.join('.'))}&asset=${asset}`,
          );
      }
    return output;
  }
  return value;
}
export async function getResearchAsset(req: Request, res: Response) {
  try {
    const table = tables[req.params.kind];
    if (!table) return res.status(404).end();
    const field = String(req.query.field || '');
    const parts = field.split('.');
    if (
      parts.length > 8 ||
      !parts.every(
        (p) =>
          /^(?:[a-z_]+|\d{1,3})$/.test(p) && !['__proto__', 'prototype', 'constructor'].includes(p),
      ) ||
      !(
        fields.has(parts[parts.length - 1]) ||
        (embeddedFields.has(parts[parts.length - 1]) &&
          /^[a-f0-9]{64}$/.test(String(req.query.asset || '')))
      )
    )
      return res.status(400).json({ message: 'Invalid resource' });
    const { data: row, error } = await supabase
      .from(table)
      .select('*')
      .eq(
        table === 'recommendations' || table === 'tactical_ideas' ? 'company_symbol' : 'id',
        req.params.id,
      )
      .maybeSingle();
    if (error) throw error;
    if (!row) return res.status(404).end();
    const { premium } = await requestAccess(req);
    const free =
      table === 'webinars'
        ? row.is_premium === false
        : table === 'recommendations' || table === 'tactical_ideas'
          ? isFreemium(row.tags)
          : false;
    const user = (req as any).user;
    if (!premium && !(free && user && ['active', 'free'].includes(user.status)))
      return res.status(user ? 403 : 401).json({ message: 'This resource requires access.' });
    let value: any = row;
    for (const part of parts) value = value?.[part];
    if (typeof value !== 'string') return res.status(404).end();
    if (embeddedFields.has(parts[parts.length - 1])) {
      value = resourceUrls(value).find(
        (url) => crypto.createHash('sha256').update(url).digest('hex') === req.query.asset,
      );
      if (!value) return res.status(404).end();
    }
    res.set('Cache-Control', 'private, no-store');
    const storage = storageLocation(value);
    if (storage) {
      const { data, error } = await supabase.storage.from(storage.bucket).download(storage.path);
      if (error || !data) return res.status(404).end();
      res.set('Content-Type', data.type || 'application/pdf');
      res.set('X-Content-Type-Options', 'nosniff');
      return res.send(Buffer.from(await data.arrayBuffer()));
    }
    if (parts[parts.length - 1] === 'stock_recommendation_url') {
      const u = new URL(value);
      const id = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (u.hostname !== 'docs.google.com' || !id) return res.status(400).end();
      const gid =
        u.searchParams.get('gid') || new URLSearchParams(u.hash.slice(1)).get('gid') || '0';
      const csv = await axios.get(`https://docs.google.com/spreadsheets/d/${id}/export`, {
        params: { format: 'csv', gid },
        responseType: 'text',
        timeout: 15000,
      });
      return res.type('text/csv').send(csv.data);
    }
    if (
      parts[parts.length - 1] === 'video' &&
      /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|loom\.com)\//.test(value)
    )
      return res.redirect(302, value);
    return res.status(400).json({ message: 'Unsupported resource location' });
  } catch {
    return res.status(503).json({ message: 'Unable to load resource' });
  }
}

// Staff editors may preview a newly uploaded private PDF before saving its record.
export async function previewResearchAsset(req: Request, res: Response) {
  try {
    const location = storageLocation(String(req.query.uri || ''));
    if (
      !location ||
      location.bucket !== 'premium-research' ||
      !location.path.toLowerCase().endsWith('.pdf')
    )
      return res.status(400).json({ message: 'Invalid research PDF' });
    const { data, error } = await supabase.storage.from(location.bucket).download(location.path);
    if (error || !data) return res.status(404).end();
    return res
      .set('Cache-Control', 'private, no-store')
      .set('Content-Type', 'application/pdf')
      .set('X-Content-Type-Options', 'nosniff')
      .send(Buffer.from(await data.arrayBuffer()));
  } catch {
    return res.status(503).json({ message: 'Unable to load PDF' });
  }
}
