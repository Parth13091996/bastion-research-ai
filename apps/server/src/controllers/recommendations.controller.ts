import { Request, Response } from "express";
import { uploadToSupabase } from "../services/upload.service";
import { supabase } from "../supabase";
import {
  fetchSheetObjects,
  liveRecMapRow,
  mapRow,
  RecommendationRecord,
} from "../utils/recommendationsSheet";

export const getRecommendations = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("recommendations").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

type Settings = {
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
};

const SETTINGS_TABLE = "settings";

async function getSettingsData(): Promise<Settings> {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  const raw = (data?.data || {}) as Settings;
  return raw;
}

export const getRecommendationsFromSheet = async (
  req: Request,
  res: Response
) => {
  try {
    const settings = await getSettingsData();
    const sheetUrl =
      settings.recommendation_sheet_url ||
      "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0";

    const rows = await fetchSheetObjects(sheetUrl);
    const recs: RecommendationRecord[] = rows
      .map(mapRow)
      .filter((r) => r.companyName);

    return res.status(200).json(recs);
  } catch (error: any) {
    console.error("Error fetching recommendations from sheet:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to load sheet data" });
  }
};

export const getLiveRecommendationsSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const settings = await getSettingsData();
    const sheetUrl =
      settings.live_recommendation_sheet_url ||
      "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=1899227714#gid=1899227714";

    const rows = await fetchSheetObjects(sheetUrl);
    const summary = rows.map(liveRecMapRow).filter(Boolean);

    return res.status(200).json(summary);
  } catch (error: any) {
    console.error("Error fetching live recommendations summary:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to load live data" });
  }
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

export const updateUserRecommendationAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const { companySymbol } = req.params;
    const { id } = req.query;
    if (companySymbol && id) {
      await supabase.from("user_activity").insert({
        user_id: id,
        event_type: "recommendation_view",
        subject_id: companySymbol,
        occurred_at: new Date().toISOString(),
        ip:
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          null,
        user_agent: (req.headers["user-agent"] as string) || null,
        metadata: null,
      } as any);
    }
    return res.status(200).json({ data: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
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

export const upsertRecommendationByCompany = async (
  req: Request,
  res: Response
) => {
  try {
    // Support multipart/form-data as well as JSON
    const body = req.body ?? {};

    // company_symbol may come from body or route param in some setups
    const company_symbol: string | undefined =
      body.company_symbol ||
      body.companySymbol ||
      (req as any)?.params?.company_symbol ||
      (req as any)?.params?.companySymbol;

    if (!company_symbol) {
      return res.status(400).json({ error: "Company symbol is required" });
    }

    // Helper to parse possibly stringified JSON arrays
    const parseMaybeJson = (val: any, fallback: any) => {
      if (val === undefined || val === null) return fallback;
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return parsed;
        } catch {
          return val;
        }
      }
      return val;
    };

    // Gather text fields
    let video: string | undefined = body.video;
    let stock_performance_url: string | undefined = body.stock_performance_url;

    // Arrays can arrive as JSON-strings in multipart
    let quarterly_update: any = parseMaybeJson(body.quarterly_update, []);
    let announcements_and_update: any = parseMaybeJson(
      body.announcements_and_update,
      []
    );

    // Tags may arrive as array, comma string, or JSON string
    let tagsRaw: any = parseMaybeJson(body.tags, []);
    let tagsArray: string[] = [];
    if (Array.isArray(tagsRaw)) {
      tagsArray = tagsRaw.map((t) => String(t));
    } else if (typeof tagsRaw === "string") {
      tagsArray = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const filesObj: any = (req as any).files || {};
    const singleFile: any = (req as any).file;

    const pickFirstFile = (key: string): Express.Multer.File | undefined => {
      if (filesObj?.[key]?.[0]) return filesObj[key][0] as Express.Multer.File;
      if (singleFile && (singleFile.fieldname === key || key === "file"))
        return singleFile as Express.Multer.File;
      return undefined;
    };

    const dirBase = `recommendations/${encodeURIComponent(company_symbol)}`;

    let logoUrl: string | undefined = body.logo;
    const logoFile = pickFirstFile("logo");
    if (logoFile) {
      const uploaded = await uploadToSupabase({
        file: logoFile,
        category: "image",
        dir: dirBase,
        filenameBase: "logo",
        upsert: true,
      });
      logoUrl = uploaded.url;
    }

    let business_noteUrl: string | undefined = body.business_note;
    const businessNoteFile = pickFirstFile("business_note");

    if (businessNoteFile) {
      const uploaded = await uploadToSupabase({
        file: businessNoteFile,
        category: "pdf",
        dir: dirBase,
        filenameBase: "business_note",
        upsert: true,
      });
      business_noteUrl = uploaded.url;
    }

    let quick_biteUrl: string | undefined = body.quick_bite;
    const quickBiteFile = pickFirstFile("quick_bite");
    if (quickBiteFile) {
      const uploaded = await uploadToSupabase({
        file: quickBiteFile,
        category: "pdf",
        dir: dirBase,
        filenameBase: "quick_bite",
        upsert: true,
      });
      quick_biteUrl = uploaded.url;
    }

    let exit_rationaleUrl: string | undefined = body.exit_rationale;
    const exitRationaleFile = pickFirstFile("exit_rationale");
    if (exitRationaleFile) {
      const uploaded = await uploadToSupabase({
        file: exitRationaleFile,
        category: "pdf",
        dir: dirBase,
        filenameBase: "exit_rationale",
        upsert: true,
      });
      exit_rationaleUrl = uploaded.url;
    }

    const upsertPayload: any = {
      logo: logoUrl,
      company_symbol,
      business_note: business_noteUrl,
      quick_bite: quick_biteUrl,
      video,
      exit_rationale: exit_rationaleUrl,
      quarterly_update,
      announcements_and_update,
      stock_performance_url,
      tags: tagsArray.join(","),
    };

    const { data, error } = await supabase
      .from("recommendations")
      .upsert(upsertPayload, { onConflict: "company_symbol" })
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
