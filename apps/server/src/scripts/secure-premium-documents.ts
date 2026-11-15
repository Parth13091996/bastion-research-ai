/** Read-only unless --apply is supplied. Run on the backend host, never in public_html.
 * --retire-public removes old public objects ONLY after a verified private copy and
 * DB update, and only when no free/public record references the same object.
 * The private copies and 0600 backup manifest allow restoration of old URLs.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase } from '../supabase';
import { isFreemium } from '../services/premium-access.service';
import { storageLocation, resourceUrls } from '../services/research-assets.service';
const tableNames = [
  'recommendations',
  'tactical_ideas',
  'scratch_pad_newsletters',
  'webinars',
  'manual_newsletters',
  'podcasts',
  'settings',
];
const documentKeys = new Set(['business_note', 'quick_bite', 'exit_rationale', 'pdf_url']);
const bucket = 'premium-research';
const identity = (v: { bucket: string; path: string }) => v.bucket + '/' + v.path;
const premium = (table: string, row: any) =>
  table === 'recommendations' || table === 'tactical_ideas'
    ? !isFreemium(row.tags)
    : table === 'scratch_pad_newsletters' || (table === 'webinars' && row.is_premium !== false);
function documentUrls(value: any, key = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((v) => documentUrls(v, key));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => documentUrls(v, k));
  if (typeof value !== 'string') return [];
  if (documentKeys.has(key) && storageLocation(value)) return [value];
  return ['content', 'contents', 'description'].includes(key)
    ? resourceUrls(value).filter((url) => storageLocation(url)?.path.toLowerCase().endsWith('.pdf'))
    : [];
}
function replace(value: any, links: Map<string, string>): any {
  if (Array.isArray(value)) return value.map((v) => replace(v, links));
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replace(v, links)]));
  if (typeof value !== 'string') return value;
  let output = value;
  for (const [from, to] of links) output = output.split(from).join(to);
  return output;
}
export async function securePremiumDocuments({apply=false,retire=false,backupDirectory}: {apply?:boolean;retire?:boolean;backupDirectory?:string}={}) {
  if (retire && !apply) throw Error('--retire-public requires --apply');
  const snapshots: any[] = [];
  for (const table of tableNames) {
    const { data, error } = await supabase.from(table).select('*');
    // Tactical ideas may not be installed, but all other lookup errors stop the migration.
    if (error) {
      if (table === 'tactical_ideas' && ['42P01', 'PGRST205'].includes(error.code)) continue;
      throw error;
    }
    snapshots.push({ table, rows: data || [] });
  }
  const publicRows = snapshots.flatMap((s) => s.rows.filter((row: any) => !premium(s.table, row)));
  const publicText = JSON.stringify(publicRows);
  const rows = snapshots.flatMap((s) =>
    s.rows.filter((row: any) => premium(s.table, row)).map((row: any) => ({ table: s.table, row })),
  );
  const urls = [...new Set(rows.flatMap(({ row }) => documentUrls(row)))].filter(
    (url) => storageLocation(url)?.bucket !== bucket,
  );
  const shared = urls.filter((url) => publicText.includes(url));
  console.log(
    JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      documentUrls: urls.length,
      sharedPublicReferences: shared.length,
      privateBucket: bucket,
    }),
  );
  if (!apply) return;
  const backupDir = path.resolve(
    backupDirectory || process.env.PREMIUM_BACKUP_DIR || '.private/premium-access-backups',
  );
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const manifestFile = path.join(backupDir, Date.now() + '-documents.json');
  const manifest: any = {
    createdAt: new Date().toISOString(),
    snapshots,
    objects: [],
    updated: [],
    retired: [],
    shared,
  };
  const save = () =>
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), { mode: 0o600 });
  save();
  const { data: existing, error: bucketError } = await supabase.storage.getBucket(bucket);
  if (!existing) {
    if (bucketError && !(bucketError.message || '').toLowerCase().includes('not found'))
      throw bucketError;
    const { error } = await supabase.storage.createBucket(bucket, { public: false });
    if (error) throw error;
  } else if (existing.public) throw Error('The research bucket must be private');
  const links = new Map<string, string>();
  for (const url of urls) {
    const location = storageLocation(url)!;
    const { data, error } = await supabase.storage.from(location.bucket).download(location.path);
    if (error || !data) throw error || Error('Missing source object');
    const bytes = Buffer.from(await data.arrayBuffer()),
      digest = crypto.createHash('sha256').update(bytes).digest('hex');
    const target = `documents/${digest}.pdf`;
    const upload = await supabase.storage
      .from(bucket)
      .upload(target, bytes, { contentType: data.type || 'application/pdf', upsert: true });
    if (upload.error) throw upload.error;
    const copy = await supabase.storage.from(bucket).download(target);
    if (copy.error || !copy.data) throw copy.error || Error('Private copy missing');
    if (
      crypto
        .createHash('sha256')
        .update(Buffer.from(await copy.data.arrayBuffer()))
        .digest('hex') !== digest
    )
      throw Error('Private copy verification failed');
    const marker = `supabase://${bucket}/${target}`;
    links.set(url, marker);
    manifest.objects.push({
      source: location,
      target: { bucket, path: target },
      digest,
      retire: !shared.includes(url),
    });
    save();
  }
  for (const { table, row } of rows) {
    const next = replace(row, links);
    if (JSON.stringify(next) === JSON.stringify(row)) continue;
    // Update only document-bearing fields, preserving concurrent unrelated edits.
    const updates: any = {};
    for (const key of Object.keys(row))
      if (JSON.stringify(next[key]) !== JSON.stringify(row[key])) updates[key] = next[key];
    const id = table === 'recommendations' || table === 'tactical_ideas' ? 'company_symbol' : 'id';
    let query = supabase.from(table).update(updates).eq(id, row[id]);
    if (row.updated_at) query = query.eq('updated_at', row.updated_at);
    const { data, error } = await query.select(id);
    if (error || !data?.length)
      throw error || Error('A source row changed; review and rerun before retiring public files');
    manifest.updated.push({ table, id: row[id] });
    save();
  }
  if (retire) {
    // Re-read every referencing table before removal, so a shared/newly added public
    // reference cannot be broken by an old snapshot.
    for (const object of manifest.objects) {
      if (!object.retire) continue;
      const oldUrl = urls.find(
        (url) => identity(storageLocation(url)!) === identity(object.source),
      )!;
      let stillReferenced = false;
      for (const table of snapshots.map((s) => s.table)) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        if (JSON.stringify(data).includes(oldUrl)) {
          stillReferenced = true;
          break;
        }
      }
      if (stillReferenced) continue;
      const { error } = await supabase.storage
        .from(object.source.bucket)
        .remove([object.source.path]);
      if (error) throw error;
      manifest.retired.push(object.source);
      save();
    }
  }
  console.log(
    JSON.stringify({
      updatedRows: manifest.updated.length,
      privateCopies: manifest.objects.length,
      retiredPublicObjects: manifest.retired.length,
      backupManifest: manifestFile,
    }),
  );
}
if (require.main === module)
  securePremiumDocuments({apply:process.argv.includes('--apply'),retire:process.argv.includes('--retire-public')}).catch((e) => {
    console.error('Document migration stopped:', e?.message || e);
    process.exitCode = 1;
  });
