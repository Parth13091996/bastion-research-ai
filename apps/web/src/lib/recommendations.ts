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
  cmpOrExitPrice: number; // CMP when live, Exit price when exited
  percentReturn: number; // % Return
  action: string; // BUY | HOLD | EXITED (or other)
  targetPrice: number;
  upsidePotential: number; // Upside Potential %
  latestMcapCr: number; // Latest Mcap (Rs. Cr)
}

const SHEET_URL_DEFAULT =
  import.meta.env.VITE_RECO_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0";

export const getSheetUrl = () => SHEET_URL_DEFAULT;

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";

  // Check if the string matches Date(YYYY,MM,DD) format
  const match = dateStr.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
  let parsedDate: Date;

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // This is already zero-based in this format
    const day = parseInt(match[3], 10);
    parsedDate = new Date(year, month, day);
  } else {
    // Fallback: try normal parsing
    parsedDate = new Date(dateStr);
  }

  if (isNaN(parsedDate.getTime())) return dateStr; // If still invalid, return raw input

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

export const fetchRecommendationsFromSheet = async (
  url = getSheetUrl()
): Promise<RecommendationRecord[]> => {
  const rows = await fetchSheetObjects(url);
  return rows.map(mapRow).filter((r) => r.companyName);
};

export interface DashboardMetrics {
  liveCount: number;
  avgLiveReturn: number;
  highCount: number; // > 15%
  mediumCount: number; // -15% to 15%
  lowCount: number; // < -15%
  topGainer?: RecommendationRecord;
  topLoser?: RecommendationRecord;

  exitCount: number;
  avgExitReturn: number;
  profitExits: number;
  lossExits: number;
  successRate: number; // % of profit exits
  bestExit?: RecommendationRecord;
  worstExit?: RecommendationRecord;
}

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
