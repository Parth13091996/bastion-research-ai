import { Request, Response } from "express";
import { supabase } from "../supabase";
import {
  fetchMailchimpNewsletters,
  getMailchimpNewsletterById,
} from "../services/mailchimp.service";

// Research
export async function createResearch(req: Request, res: Response) {
  try {
    const {
      company,
      coverage_initiation_date,
      sector,
      action,
      comments,
      percent_return_since_recommendation,
      percent_irr_potential_from_cmp,
      research_material_url,
    } = req.body;

    if (!company)
      return res.status(400).json({ error: "company is required" });

    const { data, error } = await supabase
      .from("research")
      .insert({
        company,
        coverage_initiation_date: coverage_initiation_date ?? null,
        sector: sector ?? null,
        action: action ?? null,
        comments: comments ?? null,
        percent_return_since_recommendation:
          percent_return_since_recommendation ?? null,
        percent_irr_potential_from_cmp:
          percent_irr_potential_from_cmp ?? null,
        research_material_url: research_material_url ?? null,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listResearch(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("research")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getResearch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from("research")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Research not found" });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function updateResearch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const {
      company,
      coverage_initiation_date,
      sector,
      action,
      comments,
      percent_return_since_recommendation,
      percent_irr_potential_from_cmp,
      research_material_url,
    } = req.body;

    if (!company)
      return res.status(400).json({ error: "company is required" });

    const { data, error } = await supabase
      .from("research")
      .update({
        company,
        coverage_initiation_date: coverage_initiation_date ?? null,
        sector: sector ?? null,
        action: action ?? null,
        comments: comments ?? null,
        percent_return_since_recommendation:
          percent_return_since_recommendation ?? null,
        percent_irr_potential_from_cmp:
          percent_irr_potential_from_cmp ?? null,
        research_material_url: research_material_url ?? null,
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

export async function deleteResearch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from("research").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Research deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Newsletters
export async function createNewsletter(req: Request, res: Response) {
  try {
    const { title, sub_title, headline_image_url, contents, footer_content, category } =
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
        category: category ?? null,
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

export async function listMailchimpNewsletters(req: Request, res: Response) {
  try {
    const force = req.query.force === "true";
    const data = await fetchMailchimpNewsletters({
      forceRefresh: force,
    });
    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getMailchimpNewsletter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = await getMailchimpNewsletterById(id);
    if (!data) {
      return res.status(404).json({ error: "Newsletter not found" });
    }
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// Webinars
export async function createWebinar(req: Request, res: Response) {
  try {
    const { title, video_url, is_premium, contents } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const { data, error } = await supabase
      .from("webinars")
      .insert({ title, video_url: video_url ?? null, is_premium, contents: contents ?? null })
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
    const { title, sub_title, headline_image_url, contents, footer_content, category } =
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
        category: category ?? null,
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
        text,
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
        text,
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
    return res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
