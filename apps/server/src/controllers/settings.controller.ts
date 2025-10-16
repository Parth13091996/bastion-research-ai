import { Request, Response } from "express";
import { supabase } from "../supabase";
import { randomUUID } from "crypto";

// Keys used in the `settings` table
const CONTACT_EMAIL_KEY = "contact_recipient_email";
const RECO_SHEET_URL_KEY = "recommendations_spreadsheet_url";
const RECO_SHEET_PATH_KEY = "recommendations_spreadsheet_path";
const RECO_GSHEET_ID_KEY = "recommendations_gsheet_id";
const RECO_GSHEET_RANGE_KEY = "recommendations_gsheet_range";

// Utility to upsert a string value for a given key
async function upsertSetting(key: string, value: string) {
  const { data, error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export const getContactRecipientEmail = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", CONTACT_EMAIL_KEY)
      .maybeSingle();

    if (error) throw error;

    const fallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_DEFAULT_TO || "connect@bastionresearch.in";
    return res.status(200).json({ email: data?.value || fallback });
  } catch (e: any) {
    const fallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_DEFAULT_TO || "connect@bastionresearch.in";
    return res.status(200).json({ email: fallback });
  }
};

export const updateContactRecipientEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const { data, error } = await supabase
      .from("settings")
      .upsert({ key: CONTACT_EMAIL_KEY, value: email }, { onConflict: "key" })
      .select()
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ email: data?.value || email });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update contact email" });
  }
};

// Get the recommendations spreadsheet setting (URL and/or uploaded path)
export const getRecommendationsSpreadsheetSetting = async (req: Request, res: Response) => {
  try {
    const [{ data: urlRow, error: urlErr }, { data: pathRow, error: pathErr }] = await Promise.all([
      supabase.from("settings").select("value").eq("key", RECO_SHEET_URL_KEY).maybeSingle(),
      supabase.from("settings").select("value").eq("key", RECO_SHEET_PATH_KEY).maybeSingle(),
    ]);
    if (urlErr) throw urlErr;
    if (pathErr) throw pathErr;
    return res.status(200).json({ url: urlRow?.value || null, path: pathRow?.value || null });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load spreadsheet setting" });
  }
};

// Set/update the recommendations spreadsheet URL (CSV or XLSX link)
export const updateRecommendationsSpreadsheetUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "Valid spreadsheet URL is required" });
    }
    const saved = await upsertSetting(RECO_SHEET_URL_KEY, url);
    return res.status(200).json({ url: saved?.value || url });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update spreadsheet URL" });
  }
};

// Upload a CSV/XLSX file to Supabase Storage and save its path in settings
export const uploadRecommendationsSpreadsheet = async (req: Request, res: Response) => {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
    const file = (req as any)?.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(file.mimetype)) {
      return res.status(400).json({ message: "Only CSV or XLSX files are allowed" });
    }

    const ext = file.originalname.toLowerCase().endsWith(".xlsx") ? "xlsx" : "csv";
    const filename = `spreadsheets/recommendations-${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) {
      return res.status(500).json({ message: uploadError.message });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
    await upsertSetting(RECO_SHEET_PATH_KEY, filename);
    // Optionally clear URL to avoid ambiguity
    // await upsertSetting(RECO_SHEET_URL_KEY, "");

    return res.status(201).json({ path: filename, publicUrl: publicData.publicUrl });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to upload spreadsheet" });
  }
};

// Google Sheets settings (spreadsheet ID + range)
export const getRecommendationsGsheetSetting = async (req: Request, res: Response) => {
  try {
    const [{ data: idRow, error: idErr }, { data: rangeRow, error: rangeErr }] = await Promise.all([
      supabase.from("settings").select("value").eq("key", RECO_GSHEET_ID_KEY).maybeSingle(),
      supabase.from("settings").select("value").eq("key", RECO_GSHEET_RANGE_KEY).maybeSingle(),
    ]);
    if (idErr) throw idErr;
    if (rangeErr) throw rangeErr;
    return res.status(200).json({ spreadsheetId: idRow?.value || null, range: rangeRow?.value || null });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to load Google Sheet settings" });
  }
};

export const updateRecommendationsGsheetSetting = async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, range } = req.body || {};
    if (!spreadsheetId || typeof spreadsheetId !== "string") {
      return res.status(400).json({ message: "Valid spreadsheetId is required" });
    }
    const ops = [upsertSetting(RECO_GSHEET_ID_KEY, spreadsheetId)];
    if (range && typeof range === "string") ops.push(upsertSetting(RECO_GSHEET_RANGE_KEY, range));
    await Promise.all(ops);
    return res.status(200).json({ spreadsheetId, range: range || null });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update Google Sheet settings" });
  }
};

