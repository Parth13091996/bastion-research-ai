import {
  fetchSheetObjects,
  normalizeKey,
  toNumber,
  toPercent,
  RowObject,
} from "./googleSheet";

export interface RecommendationRecord {
  companyName: string;
  nseSymbol: string;
  dateRecommended: string;
  priceAtRecommendation: number;
  dateExit?: string;
  holdingPeriod?: string;
  cmpOrExitPrice: number;
  percentReturn: number;
  action: string;
  targetPrice: number;
  upsidePotential: number;
  latestMcapCr: number;
}

import {
  getAdminRecommendationsSheetUrl,
  getLiveRecommendationsSheetUrl,
} from "@/api/recommendations-apis";
import { formatDate } from "./utils";

/**
 * Gets the Google Sheet URL for recommendations or live recommendations.
 * Always fetches values via recommendations-apis, not from environment.
 */
export const getSheetUrl = async (
  type: "recommendations" | "live" = "recommendations"
): Promise<string> => {
  try {
    if (type === "live") {
      return await getLiveRecommendationsSheetUrl();
    }
    return await getAdminRecommendationsSheetUrl();
  } catch (error) {
    console.error("Failed to fetch settings from recommendations-apis", error);
    // Optionally fallback to hardcoded values if APIs fail
    if (type === "live") {
      return "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=1899227714#gid=1899227714";
    } else {
      return "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0";
    }
  }
};

export const mapRow = (row: RowObject): RecommendationRecord => {
  const dict: Record<string, any> = {};
  Object.keys(row).forEach((k) => {
    dict[normalizeKey(k)] = row[k];
  });

  const rawDateRecommended = (
    dict["daterecommended"] ??
    dict["recommendationdate"] ??
    ""
  ).toString();
  const dateRecommended = formatDate(rawDateRecommended);

  const companyName = (dict["companyname"] ?? dict["company"] ?? "").toString();
  const nseSymbol = (dict["nsesymbol"] ?? dict["symbol"] ?? "").toString();
  const priceAtRecommendation = toNumber(
    dict["priceatrecommendation"] ?? dict["entryprice"]
  );
  const dateExit = (dict["dateexit"] ?? dict["exitdate"] ?? "").toString();
  const holdingPeriod = (dict["holdingperiod"] ?? "").toString();
  const cmpOrExitPrice = toNumber(
    dict["cmpexitprice"] ??
      dict["cmp/exitprice"] ??
      dict["cmp"] ??
      dict["exitprice"]
  );
  const percentReturn = toPercent(
    dict["return"] ?? dict["percentreturn"] ?? dict["percentreturns"]
  );
  const actionRaw = (dict["action"] ?? dict["status"] ?? "").toString();
  const targetPrice = toNumber(dict["targetprice"] ?? dict["target"]);
  const upsidePotential = toPercent(
    dict["upsidepotential"] ??
      dict["upsidepotentialpercent"] ??
      dict["expectedupside"]
  );
  const latestMcapCr = toNumber(
    dict["latestmcaprscr"] ?? dict["latestmcap"] ?? dict["mcap"]
  );

  return {
    companyName,
    nseSymbol,
    dateRecommended,
    priceAtRecommendation,
    dateExit: dateExit || undefined,
    holdingPeriod: holdingPeriod || undefined,
    cmpOrExitPrice,
    percentReturn,
    action: actionRaw.toUpperCase(),
    targetPrice,
    upsidePotential,
    latestMcapCr,
  } as RecommendationRecord;
};

// Function to map a row from the "live" summary sheet (key-value grid) to a friendlier object
export const liveRecMapRow = (row: RowObject) => {
  // Card value in key 1, card label in key 0
  // All keys, including numbers, are stringified in row
  const label = typeof row["0"] !== "undefined" ? String(row["0"]).trim() : "";
  // If label is empty, skip/return null
  if (!label) return null;

  // Numeric value is always in column "1"
  let value: any = row["1"];
  // Try to parse to number if numeric
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    value = Number(value);
  }

  // Sometimes value is a percent in decimal (0.10 = 10%)
  // These fields by default: "Average Live Returns %", "Top Gainer", "Top Loser", etc.
  // We'll preserve the raw for the consumer to parse as needed.

  // All info in "live" summary comes as { label, value, notes?, extra? }
  return {
    label,
    value,
    notes: row["2"] || "",
    extra: row["3"] || "",
  };
};

export const fetchRecommendationsFromSheet = async (
  url: string,
  type: "recommendations" | "live"
): Promise<RecommendationRecord[] | Record<any, any>> => {
  const rows = await fetchSheetObjects(url);
  if (type === "recommendations") {
    return rows.map(mapRow).filter((r) => r.companyName);
  }
  if (type === "live") {
    // Flatten to key-value summary for dashboard use
    return rows.map(liveRecMapRow).filter(Boolean);
  }
};

export const computeMetrics = (
  recs: RecommendationRecord[]
): DashboardMetrics => {
  const isExit = (r: RecommendationRecord) => {
    const a = r.action?.toLowerCase();
    if (r.dateExit && r.dateExit.trim().length > 0) return true;
    return a.includes("exit");
  };

  const live = recs.filter((r) => !isExit(r));
  const exits = recs.filter(isExit);

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;

  const liveReturns = live.map((r) => r.percentReturn);
  const avgLiveReturn = avg(liveReturns);
  const high = live.filter((r) => r.percentReturn > 15);
  const med = live.filter(
    (r) => r.percentReturn >= -15 && r.percentReturn <= 15
  );
  const low = live.filter((r) => r.percentReturn < -15);

  const topGainer = live.reduce<RecommendationRecord | undefined>(
    (best, r) => (!best || r.percentReturn > best.percentReturn ? r : best),
    undefined
  );
  const topLoser = live.reduce<RecommendationRecord | undefined>(
    (worst, r) => (!worst || r.percentReturn < worst.percentReturn ? r : worst),
    undefined
  );

  const exitReturns = exits.map((r) => r.percentReturn);
  const avgExitReturn = avg(exitReturns);
  const profitExits = exits.filter((r) => r.percentReturn > 0).length;
  const lossExits = exits.filter((r) => r.percentReturn < 0).length;
  const successRate = exits.length ? (profitExits / exits.length) * 100 : 0;
  const bestExit = exits.reduce<RecommendationRecord | undefined>(
    (best, r) => (!best || r.percentReturn > best.percentReturn ? r : best),
    undefined
  );
  const worstExit = exits.reduce<RecommendationRecord | undefined>(
    (worst, r) => (!worst || r.percentReturn < worst.percentReturn ? r : worst),
    undefined
  );

  return {
    liveCount: live.length,
    avgLiveReturn,
    highCount: high.length,
    mediumCount: med.length,
    lowCount: low.length,
    topGainer,
    topLoser,
    exitCount: exits.length,
    avgExitReturn,
    profitExits,
    lossExits,
    successRate,
    bestExit,
    worstExit,
  };
};
