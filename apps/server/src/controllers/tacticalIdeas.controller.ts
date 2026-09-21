import { Request, Response } from "express";
import { supabase } from "../supabase";
import {
  fetchSheetObjects,
  liveRecMapRow,
  mapRow,
  RecommendationRecord,
} from "../utils/recommendationsSheet";

// Table name for tactical ideas (DB-backed metadata similar to recommendations)
const TACTICAL_TABLE = "tactical_ideas";

export const getTacticalIdeas = async (_: Request, res: Response) => {
  const { data, error } = await supabase.from(TACTICAL_TABLE).select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

type Settings = {
  tactical_ideas_sheet_url?: string;
  live_tactical_ideas_sheet_url?: string;
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

export const getTacticalIdeasFromSheet = async (_: Request, res: Response) => {
  try {
    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=102405138#gid=102405138";

    if (!sheetUrl) {
      return res
        .status(400)
        .json({ error: "Tactical Ideas sheet URL is not configured" });
    }

    const rows = await fetchSheetObjects(sheetUrl);
    const ideas: RecommendationRecord[] = rows
      .map(mapRow)
      .filter((r) => r.companyName);
    return res.status(200).json(ideas);
  } catch (error: any) {
    console.error("Error fetching tactical ideas from sheet:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to load sheet data" });
  }
};

export const getLiveTacticalIdeasSummary = async (
  _: Request,
  res: Response
) => {
  try {
    const settings = await getSettingsData();
    const sheetUrl =
      settings.live_tactical_ideas_sheet_url ||
      settings.live_tactical_ideas_sheet_url ||
      "";

    if (!sheetUrl) {
      return res
        .status(400)
        .json({ error: "Live Tactical Ideas sheet URL is not configured" });
    }

    const rows = await fetchSheetObjects(sheetUrl);
    const summary = rows.map(liveRecMapRow).filter(Boolean);

    return res.status(200).json(summary);
  } catch (error: any) {
    console.error("Error fetching live tactical ideas summary:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to load live data" });
  }
};

export const getTacticalIdeaByCompanySymbol = async (
  req: Request,
  res: Response
) => {
  const { companySymbol } = req.params;
  const { data, error } = await supabase
    .from(TACTICAL_TABLE)
    .select("*")
    .eq("company_symbol", companySymbol)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({ error: "Tactical Idea not found" });
    }
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const upsertTacticalIdeaByCompany = async (
  req: Request,
  res: Response
) => {
  try {
    const body = req.body ?? {};

    const company_symbol: string | undefined =
      body.company_symbol ||
      body.companySymbol ||
      (req as any)?.params?.company_symbol ||
      (req as any)?.params?.companySymbol;

    if (!company_symbol) {
      return res.status(400).json({ error: "Company symbol is required" });
    }

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

    const filesObj: any = (req as any).files || {};
    const singleFile: any = (req as any).file;

    const pickFirstFile = (key: string): Express.Multer.File | undefined => {
      if (filesObj?.[key]?.[0]) return filesObj[key][0] as Express.Multer.File;
      if (singleFile && (singleFile.fieldname === key || key === "file"))
        return singleFile as Express.Multer.File;
      return undefined;
    };

    const safeCompanySymbol = String(company_symbol).replace(/[^\w]/g, "_");
    const dirBase = `tactical_ideas/${safeCompanySymbol}`;

    const entry_price =
      body.entry_price != null ? Number(body.entry_price) : null;
    const cmp = Number(body.cmp) || null;
    const stop_loss = body.stop_loss != null ? Number(body.stop_loss) : null;
    const tags =
      typeof body.tags === "string"
        ? body.tags
        : Array.isArray(body.tags)
          ? body.tags.join(",")
          : null;

    const upsertPayload: any = {
      company_symbol,
      entry_price,
      cmp,
      stop_loss,
      tags,
      // Allow arbitrary JSON metadata for future fields
      metadata: parseMaybeJson(body.metadata, null),
    };

    const { data, error } = await supabase
      .from(TACTICAL_TABLE)
      .upsert(upsertPayload, { onConflict: "company_symbol" })
      .select();

    if (error) {
      console.error("Tactical idea database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Tactical idea upsert error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTacticalIdea = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from(TACTICAL_TABLE)
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
