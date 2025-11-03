import { Request, Response } from "express";
import mailchimp from "@mailchimp/mailchimp_marketing";
import {
  fetchMailchimpNewsletters,
  getMailchimpNewsletterById,
} from "../services/mailchimp.service";
import { supabase } from "../supabase";

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

async function fetchHiddenMap(): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from("mailchimp_newsletter_prefs")
      .select("newsletter_id, hidden");
    if (error) return {};
    const map: Record<string, boolean> = {};
    for (const r of data || []) {
      map[(r as any).newsletter_id] = Boolean((r as any).hidden);
    }
    return map;
  } catch {
    return {};
  }
}

export async function listMailchimpNewsletters(req: Request, res: Response) {
  try {
    const force = req.query.force === "true";
    const data = await fetchMailchimpNewsletters({
      forceRefresh: force,
    });
    const hiddenMap = await fetchHiddenMap();
    const isAdmin = (req.originalUrl || "").includes("/api/admin/");
    if (isAdmin) {
      // Attach hidden flag for admin view
      const withHidden = (data ?? []).map((n: any) => ({
        ...n,
        hidden: Boolean(hiddenMap[n.id] || false),
      }));
      return res.status(200).json(withHidden);
    }
    // Public: filter out hidden ones
    const filtered = (data ?? []).filter((n: any) => !hiddenMap[n.id]);
    return res.status(200).json(filtered);
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
    // If hidden and public route, block access
    try {
      const isAdmin = (req.originalUrl || "").includes("/api/admin/");
      if (!isAdmin) {
        const { data: pref } = await supabase
          .from("mailchimp_newsletter_prefs")
          .select("hidden")
          .eq("newsletter_id", id)
          .single();
        if (pref && (pref as any).hidden) {
          return res.status(404).json({ error: "Newsletter not found" });
        }
      }
    } catch {}
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function subscribeToNewsLetter(req: Request, res: Response) {
  try {
    const { email, latitude, longitude, timestamp } = req.body;

    // Basic validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }

    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      {
        email_address: email,
        status: "subscribed",
        location: {
          latitude,
          longitude,
        },
        timestamp_signup: timestamp,
      },
      {
        skipMergeValidation: true,
      }
    );
    res.json({ message: "Success! Already subscribed or now added." });
  } catch (error: any) {
    console.error("Mailchimp error:", error);
    let message = "Subscription failed";
    if (error.response?.status === 400) {
      message = "Email already subscribed or invalid.";
    } else if (error.response?.status === 401) {
      message = "API key invalid.";
    }
    res.status(error.response?.status || 500).json({ message });
  }
}

// Admin-only: set hidden flag for a Mailchimp newsletter by id
export async function setMailchimpNewsletterHidden(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { hidden } = (req.body || {}) as { hidden?: boolean };
    if (typeof hidden !== "boolean") {
      return res.status(400).json({ message: "hidden boolean is required" });
    }
    const { error } = await supabase
      .from("mailchimp_newsletter_prefs")
      .upsert({ newsletter_id: id, hidden }, { onConflict: "newsletter_id" });
    if (error) return res.status(500).json({ message: "Failed to save" });
    return res.status(200).json({ ok: true, id, hidden });
  } catch (e) {
    return res.status(500).json({ message: "Failed to save" });
  }
}
