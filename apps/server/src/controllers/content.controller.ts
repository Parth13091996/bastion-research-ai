import { Request, Response } from "express";
import { supabase } from "../supabase";

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

// ---------------------------------------------------------------------------
// Manual Newsletters (CMS-managed, separate from Mailchimp campaigns)
// ---------------------------------------------------------------------------

// Helpers
function mapManualNewsletter(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    sub_title: row.sub_title ?? undefined,
    headline_image_url: row.headline_image_url ?? undefined,
    created_at: row.created_at,
    category: row.category ?? undefined,
    link: row.link,
    author: row.author ?? undefined,
    plain_text: row.plain_text ?? undefined,
    hidden: Boolean(row.hidden),
    source: "cms" as const,
  };
}

// Public: list visible manual newsletters
export async function listNewsletters(req: Request, res: Response) {
  try {
    const isAdmin = (req.originalUrl || "").includes("/api/admin/");

    let query = supabase
      .from("manual_newsletters")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("hidden", false);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    const mapped = (data || []).map(mapManualNewsletter);
    return res.status(200).json(mapped);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Get single manual newsletter (public/admin)
export async function getNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const isAdmin = (req.originalUrl || "").includes("/api/admin/");

    let query = supabase
      .from("manual_newsletters")
      .select("*")
      .eq("id", id);

    if (!isAdmin) {
      query = query.eq("hidden", false);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: error.message });
    }

    if (!data) return res.status(404).json({ error: "Newsletter not found" });

    return res.status(200).json(mapManualNewsletter(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Admin: create manual newsletter
export async function createNewsletter(req: Request, res: Response) {
  try {
    const { title, category, link, sub_title, headline_image_url, author } =
      req.body;

    if (!title || !link) {
      return res
        .status(400)
        .json({ error: "title and link are required fields" });
    }

    const { data, error } = await supabase
      .from("manual_newsletters")
      .insert({
        title,
        category: category ?? null,
        link,
        sub_title: sub_title ?? null,
        headline_image_url: headline_image_url ?? null,
        author: author ?? null,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json(mapManualNewsletter(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Admin: update manual newsletter
export async function updateNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const {
      title,
      category,
      link,
      sub_title,
      headline_image_url,
      author,
      hidden,
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (link !== undefined) updateData.link = link;
    if (sub_title !== undefined) updateData.sub_title = sub_title;
    if (headline_image_url !== undefined)
      updateData.headline_image_url = headline_image_url;
    if (author !== undefined) updateData.author = author;
    if (hidden !== undefined) updateData.hidden = !!hidden;

    const { data, error } = await supabase
      .from("manual_newsletters")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(mapManualNewsletter(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Admin: delete manual newsletter
export async function deleteNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase
      .from("manual_newsletters")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Newsletter deleted successfully" });
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
