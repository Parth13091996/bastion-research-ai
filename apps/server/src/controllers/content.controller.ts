import { Request, Response } from 'express';
import { supabase } from '../supabase';

// Newsletters
export async function createNewsletter(req: Request, res: Response) {
  try {
    const { title, sub_title, headline_image_url, html_content, footer_content } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const { data, error } = await supabase.from('newsletters').insert({
      title,
      sub_title: sub_title ?? null,
      headline_image_url: headline_image_url ?? null,
      html_content: html_content ?? null,
      footer_content: footer_content ?? null,
    }).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listNewsletters(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Webinars
export async function createWebinar(req: Request, res: Response) {
  try {
    const { title, video_url } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const { data, error } = await supabase
      .from('webinars')
      .insert({ title, video_url: video_url ?? null })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listWebinars(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Podcasts
export async function createPodcast(req: Request, res: Response) {
  try {
    const { title, html_content, video_url } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const { data, error } = await supabase
      .from('podcasts')
      .insert({ title, html_content: html_content ?? null, video_url: video_url ?? null })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listPodcasts(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

