import { Request, Response } from "express";
import { uploadToSupabase } from "../services/upload.service";
import { supabase } from "../supabase";
import {
  fetchSheetObjects,
  liveRecMapRow,
  mapRow,
  RecommendationRecord,
} from "../utils/recommendationsSheet";

export const getRecommendations = async (_: Request, res: Response) => {
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
  _: Request,
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
  _: Request,
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

    // Gather text inputs (legacy fallback values)
    let business_noteFallback: string | undefined = body.business_note;
    let quick_biteFallback: string | undefined = body.quick_bite;
    let exit_rationaleFallback: string | undefined = body.exit_rationale;

    // Stock performance URLs can now be sent as:
    // - JSON stringified array of { date, title, stock_recommendation_url }
    // - direct JS array (e.g. from JSON body)
    // - legacy single URL string
    let stock_performance_url: any = parseMaybeJson(
      body.stock_performance_url,
      []
    );

    // Normalize legacy single-string inputs into an array of objects
    if (
      typeof stock_performance_url === "string" &&
      stock_performance_url.trim() !== ""
    ) {
      stock_performance_url = [
        {
          date: new Date().toISOString().slice(0, 10),
          title: "Initial recommendation",
          stock_recommendation_url: stock_performance_url,
        },
      ];
    }

    const normalizeUpdateItemsArray = (val: any) => {
      const parsed = parseMaybeJson(val, []);
      return Array.isArray(parsed) ? parsed : [];
    };

    const normalizePerformanceItemsArray = (val: any) => {
      const parsed = parseMaybeJson(val, []);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(Boolean)
        .map((item: any) => {
          if (!item || typeof item !== "object") return item;
          return {
            ...item,
            quarterly_update: normalizeUpdateItemsArray(item.quarterly_update),
            announcements_and_update: normalizeUpdateItemsArray(
              item.announcements_and_update
            ),
          };
        })
        .filter((item: any) => item && typeof item === "object");
    };

    stock_performance_url = normalizePerformanceItemsArray(stock_performance_url);
    const ensurePrimaryIteration = () => {
      if (!Array.isArray(stock_performance_url)) stock_performance_url = [];
      if (!stock_performance_url[0]) {
        stock_performance_url[0] = {
          date: new Date().toISOString().slice(0, 10),
          title: "Initial recommendation",
          stock_recommendation_url: "",
          quarterly_update: [],
          announcements_and_update: [],
        };
      }
      return stock_performance_url[0];
    };
    const primaryIteration = ensurePrimaryIteration();

    // Arrays can arrive as JSON-strings in multipart
    let quarterly_update: any = parseMaybeJson(body.quarterly_update, []);
    let announcements_and_update: any = parseMaybeJson(
      body.announcements_and_update,
      []
    );

    if (!Array.isArray(quarterly_update)) quarterly_update = [];
    if (!Array.isArray(announcements_and_update)) announcements_and_update = [];

    let videoFallback: string | undefined = body.video;
    if (videoFallback && !primaryIteration.video) {
      primaryIteration.video = videoFallback;
    }

    // Ensure primary iteration has update arrays when provided
    if (
      Array.isArray(quarterly_update) &&
      quarterly_update.length > 0 &&
      (!Array.isArray(primaryIteration.quarterly_update) ||
        primaryIteration.quarterly_update.length === 0)
    ) {
      primaryIteration.quarterly_update = quarterly_update;
    }
    if (
      Array.isArray(announcements_and_update) &&
      announcements_and_update.length > 0 &&
      (!Array.isArray(primaryIteration.announcements_and_update) ||
        primaryIteration.announcements_and_update.length === 0)
    ) {
      primaryIteration.announcements_and_update = announcements_and_update;
    }

    if (
      (!Array.isArray(announcements_and_update) ||
        announcements_and_update.length === 0) &&
      Array.isArray(primaryIteration.announcements_and_update)
    ) {
      announcements_and_update = primaryIteration.announcements_and_update;
    }

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

    // Replace all non-word characters with underscore for safe directory name
    const safeCompanySymbol = String(company_symbol).replace(/[^\w]/g, "_");
    const dirBase = `recommendations/${safeCompanySymbol}`;

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

    let business_noteUrl: string | undefined = business_noteFallback;
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
      primaryIteration.business_note = uploaded.url;
    } else if (business_noteUrl && !primaryIteration?.business_note) {
      primaryIteration.business_note = business_noteUrl;
    }

    let quick_biteUrl: string | undefined = quick_biteFallback;
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
      primaryIteration.quick_bite = uploaded.url;
    } else if (quick_biteUrl && !primaryIteration?.quick_bite) {
      primaryIteration.quick_bite = quick_biteUrl;
    }

    let exit_rationaleUrl: string | undefined = exit_rationaleFallback;
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
      primaryIteration.exit_rationale = uploaded.url;
    } else if (exit_rationaleUrl && !primaryIteration?.exit_rationale) {
      primaryIteration.exit_rationale = exit_rationaleUrl;
    }

    const upsertPayload: any = {
      logo: logoUrl,
      company_symbol,
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
