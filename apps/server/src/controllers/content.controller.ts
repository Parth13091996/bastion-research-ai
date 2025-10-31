import { Request, Response } from "express";
import { supabase } from "../supabase";
import {
  fetchMailchimpNewsletters,
  getMailchimpNewsletterById,
} from "../services/mailchimp.service";



// Webinars
export async function createWebinar(req: Request, res: Response) {
  try {
    const { title, video_url, is_premium, contents } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("webinars")
      .insert({
        title,
        video_url: video_url ?? null,
        is_premium,
        contents: contents ?? null,
      })
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
    const { title, video_url, is_premium, contents } = req.body;

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("webinars")
      .update({
        title,
        video_url: video_url ?? null,
        is_premium,
        contents: contents ?? null,
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

// Testimonials
export async function createTestimonial(req: Request, res: Response) {
  try {
    const { title, text, name, position } = req.body;
    if (!title || !text || !name || !position) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        title,
        review: text,
        name,
        position,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listTestimonials(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Testimonial not found" });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function updateTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, text, name, position } = req.body;

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (!title || !text || !name || !position) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update({
        title,
        review: text,
        name,
        position,
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

export async function deleteTestimonial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res
      .status(200)
      .json({ message: "Testimonial deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
