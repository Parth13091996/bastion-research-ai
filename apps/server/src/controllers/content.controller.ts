import { Request, Response } from "express";
import { supabase } from "../supabase";

// Newsletters
export async function createNewsletter(req: Request, res: Response) {
  try {
    const { title, sub_title, headline_image_url, contents, footer_content } =
      req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("newsletters")
      .insert({
        title,
        sub_title: sub_title ?? null,
        headline_image_url: headline_image_url ?? null,
        contents: contents ?? null,
        footer_content: footer_content ?? null,
      })
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listNewsletters(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("newsletters")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Webinars
export async function createWebinar(req: Request, res: Response) {
  try {
    const { title, video_url, is_premium } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("webinars")
      .insert({ title, video_url: video_url ?? null, is_premium })
      .select("*")
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
      .from("webinars")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Podcasts
export async function createPodcast(req: Request, res: Response) {
  try {
    const { title, contents, video_url } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("podcasts")
      .insert({
        title,
        contents: contents ?? null,
        video_url: video_url ?? null,
      })
      .select("*")
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
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Get single newsletter by ID
export async function getNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Newsletter not found" });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Update newsletter
export async function updateNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, sub_title, headline_image_url, contents, footer_content } =
      req.body;

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("newsletters")
      .update({
        title,
        sub_title: sub_title ?? null,
        headline_image_url: headline_image_url ?? null,
        contents: contents ?? null,
        footer_content: footer_content ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Delete newsletter
export async function deleteNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("newsletters").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Newsletter deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Get single webinar by ID
export async function getWebinar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from("webinars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Webinar not found" });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Update webinar
export async function updateWebinar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, video_url, is_premium } = req.body;

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("webinars")
      .update({
        title,
        video_url: video_url ?? null,
        is_premium,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Delete webinar
export async function deleteWebinar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("webinars").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Webinar deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Get single podcast by ID
export async function getPodcast(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Podcast not found" });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Update podcast
export async function updatePodcast(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, contents, video_url } = req.body;

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("podcasts")
      .update({
        title,
        contents: contents ?? null,
        video_url: video_url ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Delete podcast
export async function deletePodcast(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("podcasts").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Podcast deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
