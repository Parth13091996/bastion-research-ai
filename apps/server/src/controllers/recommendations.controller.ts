import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getRecommendations = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("recommendations").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const createRecommendation = async (req: Request, res: Response) => {
  try {
    const {
      business_note,
      quick_bite,
      video,
      exit_rationale,
      quarterly_update = [],
      announcements_and_update = [],
    } = req.body ?? {};

    if (
      !business_note &&
      !quick_bite &&
      !video &&
      !exit_rationale &&
      quarterly_update.length === 0 &&
      announcements_and_update.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one update field is required" });
    }

    const { data, error } = await supabase
      .from("recommendations")
      .insert([
        {
          business_note,
          quick_bite,
          video,
          exit_rationale,
          quarterly_update,
          announcements_and_update,
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
    business_note,
    quick_bite,
    video,
    exit_rationale,
    quarterly_update,
    announcements_and_update,
  } = req.body ?? {};
  const { data, error } = await supabase
    .from("recommendations")
    .update({
      business_note,
      quick_bite,
      video,
      exit_rationale,
      quarterly_update,
      announcements_and_update,
    })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
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
