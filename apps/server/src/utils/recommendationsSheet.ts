import axios from "axios";

export type RowObject = Record<string, any>;

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

export const parseSheetUrl = (
  urlString: string
): { id: string; gid: string } => {
  const url = new URL(urlString);
  const pathParts = url.pathname.split("/d/");
  const id = pathParts[1]?.split("/")[0] || "";
  const params = new URLSearchParams(url.search);
  let gid = params.get("gid") || "0";
  if (!gid && url.hash) {
    const m = url.hash.match(/gid=(\d+)/);
    if (m) gid = m[1];
  }
  if (!id)
    throw new Error("Invalid Google Sheets URL: spreadsheet ID not found");
  return { id, gid };
};

export const fetchSheetObjects = async (
  sheetUrl: string
): Promise<RowObject[]> => {
  try {
    const { id, gid } = parseSheetUrl(sheetUrl);
    const jsonUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&tq&gid=${gid}`;
    const res = await axios.get<string>(jsonUrl, { responseType: "text" });
    const text = res.data;

    const updatedText = text.slice(text.indexOf("table") + 7, text.length - 3);

    const table = JSON.parse(updatedText) as any;
    if (!table || !Array.isArray(table?.rows)) return [];
    const headers: string[] = (table.cols || []).map((c: any, idx: number) =>
      (c?.label ? c?.label : idx).toString()
    );
    const rows: any[] = table.rows || [];

    return rows.map((r: any) => {
      const obj: RowObject = {};
      headers.forEach((h: string, i: number) => {
        const cell = r.c?.[i] ?? null;
        if (h === "Date Recommended") {
          obj[h] = cell?.f ?? cell?.v ?? "";
        } else {
          obj[h] = cell?.v ?? "";
        }
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet objects:", error);
    return [];
  }
};

// Helpers
export const normalizeKey = (k: string) =>
  k.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const toNumber = (v: any): number => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const s = String(v)
    .replace(/[,?%\s]/g, "")
    .replace(/rs\.?/gi, "")
    .replace(/cr\.?/gi, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export const toPercent = (v: any): number => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const s = String(v).replace(/%/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
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
  const dateRecommended = rawDateRecommended;

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
  const label = typeof row["0"] !== "undefined" ? String(row["0"]).trim() : "";
  if (!label) return null;

  let value: any = row["1"];
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    value = Number(value);
  }

  return {
    label,
    value,
    notes: row["2"] || "",
    extra: row["3"] || "",
  };
};

