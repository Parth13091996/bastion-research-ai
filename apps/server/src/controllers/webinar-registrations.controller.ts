import { Request, Response } from "express";
import { supabase } from "../supabase";

// Create a new webinar registration (public endpoint)
export const createWebinarRegistration = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      webinar_slug,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      notes,
    } = req.body ?? {};

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "name and email are required fields" });
    }

    const { data, error } = await supabase
      .from("webinar_registrations")
      .insert({
        name,
        email,
        phone: phone ?? null,
        webinar_slug: webinar_slug ?? null,
        source: source ?? "portfolio-red-flags-landing",
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        notes: notes ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to register" });
  }
};

// List webinar registrations (admin)
export const listWebinarRegistrations = async (
  _req: Request,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from("webinar_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data ?? []);
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "Failed to load registrations" });
  }
};

