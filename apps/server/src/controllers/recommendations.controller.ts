import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getRecommendations = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("recommendations").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

// Controller to get recommendation by ID
export const getRecommendationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return res.status(404).json({ error: "Recommendation not found" });
    }
    return res.status(500).json({ error: error.message });
  }
  try {
    const userId = (req as any)?.user?.id;
    if (userId) {
      await supabase.from("user_activity").insert({
        user_id: userId,
        event_type: "recommendation_view",
        subject_id: id,
        occurred_at: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          null,
        user_agent: (req.headers["user-agent"] as string) || null,
        metadata: null,
      } as any);
    }
  } catch {}

  return res.status(200).json(data);
};

export const getRecommendationByCompanySymbol = async (
  req: Request,
  res: Response
) => {
  const { companySymbol } = req.params;
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("company_symbol", companySymbol)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return res.status(404).json({ error: "Recommendation not found" });
    }
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const createRecommendation = async (req: Request, res: Response) => {
  try {
    const {
      logo,
      company_symbol,
      business_note,
      quick_bite,
      video,
      exit_rationale,
      quarterly_update = [],
      announcements_and_update = [],
      stock_performance_url = "",
      tags = [],
    } = req.body ?? {};
    console.log(tags.join(","), "tags join");

    if (!company_symbol) {
      return res.status(400).json({ error: "Company symbol is required" });
    }

    const { data, error } = await supabase
      .from("recommendations")
      .insert([
        {
          logo,
          company_symbol,
          business_note,
          quick_bite,
          video,
          exit_rationale,
          quarterly_update,
          announcements_and_update,
          stock_performance_url,
          tags: tags.join(","),
        },
      ])
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Recommendation creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateRecommendation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    logo,
    company_symbol,
    business_note,
    quick_bite,
    video,
    exit_rationale,
    quarterly_update,
    announcements_and_update,
    stock_performance_url,
    tags = [],
  } = req.body ?? {};

  const updateData: any = {};
  if (logo !== undefined) updateData.logo = logo;
  if (company_symbol !== undefined) updateData.company_symbol = company_symbol;
  if (business_note !== undefined) updateData.business_note = business_note;
  if (quick_bite !== undefined) updateData.quick_bite = quick_bite;
  if (video !== undefined) updateData.video = video;
  if (exit_rationale !== undefined) updateData.exit_rationale = exit_rationale;
  if (stock_performance_url !== undefined)
    updateData.stock_performance_url = stock_performance_url;

  if (quarterly_update !== undefined)
    updateData.quarterly_update = quarterly_update;
  if (announcements_and_update !== undefined)
    updateData.announcements_and_update = announcements_and_update;
  if (tags !== undefined) updateData.tags = tags.join(",");

  console.log(updateData, "list");

  const { data, error } = await supabase
    .from("recommendations")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const upsertRecommendationByCompany = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      logo,
      company_symbol,
      business_note,
      quick_bite,
      video,
      exit_rationale,
      quarterly_update = [],
      announcements_and_update = [],
      stock_performance_url = "",
      tags = [],
    } = req.body ?? {};

    console.log("upsert", tags);

    if (!company_symbol) {
      return res.status(400).json({ error: "Company symbol is required" });
    }

    const { data, error } = await supabase
      .from("recommendations")
      .upsert(
        {
          logo,
          company_symbol,
          business_note,
          quick_bite,
          video,
          exit_rationale,
          quarterly_update,
          announcements_and_update,
          stock_performance_url,
          tags: tags.join(","),
        },
        { onConflict: "company_symbol" }
      )
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Recommendation upsert error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteRecommendation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("recommendations")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
