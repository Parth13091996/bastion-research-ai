import type { Request, Response } from "express";
import { supabase } from "../supabase";

type Settings = {
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string; // Admin recommendations list
  live_recommendation_sheet_url?: string; // Dashboard live recommendations
  agreement_file_url?: string;
  invoice_file_url?: string;
  /** Portfolio webinar — AiSensy (2nd template var; replaces registrant email in the message). */
  aisensy_webinar_name?: string;
  aisensy_webinar_date?: string;
  aisensy_webinar_time?: string;
  aisensy_joining_link?: string;
  /** Overrides env AISENSY_CAMPAIGN_NAME when set. */
  aisensy_campaign_name?: string;
  /** Stored as yyyy-MM-dd / HH:mm; applied on subscribe when env merge tags are set. */
  mailchimp_webinar_date?: string;
  mailchimp_webinar_time?: string;
};

const TABLE = "settings";

async function getRow() {
  const { data, error } = await supabase.from(TABLE).select("*").maybeSingle();
  if (error) throw error;
  return data || { singleton: true, data: {} };
}

async function upsert(settings: Partial<Settings>) {
  const row = await getRow();
  const merged = { ...(row.data as Settings), ...settings };
  delete (merged as Record<string, unknown>).mailchimp_merge_tag_date;
  delete (merged as Record<string, unknown>).mailchimp_merge_tag_time;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ singleton: true, data: merged }, { onConflict: "singleton" });
  if (error) throw error;
  return merged;
}

export async function getPublicSettings(req: Request, res: Response) {
  try {
    const row = await getRow();
    const data = (row.data || {}) as Settings;

    // Only expose non-sensitive keys publicly
    const pub = {
      site_name: data.site_name || "Admin Dashboard",
      maintenance_mode: !!data.maintenance_mode,
      allow_user_registrations: !!data.allow_user_registrations,
      agreement_file_url: data?.agreement_file_url,
      invoice_file_url: data?.invoice_file_url,
      aisensy_webinar_date: data.aisensy_webinar_date,
      aisensy_webinar_time: data.aisensy_webinar_time,
      mailchimp_webinar_date: data.mailchimp_webinar_date,
      mailchimp_webinar_time: data.mailchimp_webinar_time,
    };
    return res.status(200).json(pub);
  } catch (e: any) {
    return res.status(200).json({
      site_name: "Admin Dashboard",
      maintenance_mode: false,
      allow_user_registrations: true,
    });
  }
}

export async function getAdminSettings(req: Request, res: Response) {
  try {
    const row = await getRow();
    return res.status(200).json((row.data || {}) as Settings);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "Failed to load settings" });
  }
}

/** Merged site settings (for server-side use, e.g. AiSensy template params). */
export async function getSettingsData(): Promise<Settings> {
  const row = await getRow();
  return (row.data || {}) as Settings;
}

export async function updateAdminSettings(req: Request, res: Response) {
  try {
    const body = (req.body || {}) as Partial<Settings>;
    const saved = await upsert(body);
    return res.status(200).json(saved);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "Failed to update settings" });
  }
}

export async function getContactRecipientEmail(req: Request, res: Response) {
  try {
    const row = await getRow();
    const email =
      (row.data as Settings)?.contact_recipient_email ||
      process.env.CONTACT_RECIPIENT_EMAIL ||
      process.env.SMTP_DEFAULT_TO ||
      "connect@bastionresearch.in";
    return res.status(200).json({ email });
  } catch {
    const fallback =
      process.env.CONTACT_RECIPIENT_EMAIL ||
      process.env.SMTP_DEFAULT_TO ||
      "connect@bastionresearch.in";
    return res.status(200).json({ email: fallback });
  }
}

export async function updateContactRecipientEmail(req: Request, res: Response) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }
    const saved = await upsert({ contact_recipient_email: email });
    return res
      .status(200)
      .json({ email: saved.contact_recipient_email || email });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "Failed to update contact email" });
  }
}
