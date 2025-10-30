import { Request, Response } from "express";
import { supabase } from "../supabase";

// Get all scratch pad newsletters (with optional filtering)
export const getScratchPadNewsletters = async (req: Request, res: Response) => {
  try {
    const { published_only } = req.query;

    let query = supabase
      .from("scratch_pad_newsletters")
      .select("*")
      .order("published_date", { ascending: false });

    // If published_only is true, filter for published newsletters
    if (published_only === "true") {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching scratch pad newsletters:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single scratch pad newsletter by ID
export const getScratchPadNewsletterById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("scratch_pad_newsletters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Newsletter not found" });
      }
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching scratch pad newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single scratch pad newsletter by slug
export const getScratchPadNewsletterBySlug = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from("scratch_pad_newsletters")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Newsletter not found" });
      }
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching scratch pad newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create new scratch pad newsletter (admin only)
export const createScratchPadNewsletter = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      slug,
      description,
      content,
      featured_image,
      author,
      published_date,
      is_published,
      tags,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        error: "Title, slug, and content are required",
      });
    }

    const { data, error } = await supabase
      .from("scratch_pad_newsletters")
      .insert([
        {
          title,
          slug,
          description,
          content,
          featured_image,
          author,
          published_date,
          is_published: is_published || false,
          tags: tags || [],
        },
      ])
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error: any) {
    console.error("Error creating scratch pad newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update scratch pad newsletter (admin only)
export const updateScratchPadNewsletter = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      content,
      featured_image,
      author,
      published_date,
      is_published,
      tags,
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (author !== undefined) updateData.author = author;
    if (published_date !== undefined) updateData.published_date = published_date;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (tags !== undefined) updateData.tags = tags;

    const { data, error } = await supabase
      .from("scratch_pad_newsletters")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    return res.status(200).json(data[0]);
  } catch (error: any) {
    console.error("Error updating scratch pad newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete scratch pad newsletter (admin only)
export const deleteScratchPadNewsletter = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("scratch_pad_newsletters")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    return res.status(200).json({ message: "Newsletter deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting scratch pad newsletter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
