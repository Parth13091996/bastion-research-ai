export const mapToStock = (sheetRow: any, apiRow: any) => {
  return {
    id: sheetRow?.id ?? apiRow?.id,
    name:
      sheetRow?.companyName ??
      sheetRow?.name ??
      apiRow?.company_name ??
      apiRow?.name ??
      "Company Name Ltd.",
    nseSymbol: sheetRow?.nseSymbol || apiRow?.nse_symbol || undefined,
    logo: apiRow?.logo || sheetRow?.logo || undefined,

    // Dates
    dateRecommended:
      sheetRow?.dateRecommended ||
      apiRow?.dateRecommended ||
      apiRow?.created_at,
    lastUpdated: apiRow?.updated_at || sheetRow?.updated_at || undefined,
    dateExit: sheetRow?.dateExit || apiRow?.dateExit || undefined,
    holdingPeriod:
      sheetRow?.holdingPeriod || apiRow?.holdingPeriod || undefined,

    // Stock prices & targets
    entryPrice:
      sheetRow?.priceAtRecommendation ??
      sheetRow?.entryPrice ??
      apiRow?.price_at_recommendation ??
      apiRow?.priceAtRecommendation ??
      undefined,
    cmp:
      sheetRow?.cmpOrExitPrice ??
      sheetRow?.cmp ??
      apiRow?.cmpOrExitPrice ??
      apiRow?.cmp ??
      undefined,
    target1:
      sheetRow?.targetPrice ??
      sheetRow?.target1 ??
      apiRow?.targetPrice ??
      apiRow?.target1 ??
      undefined,
    // returns
    percentReturn:
      typeof sheetRow?.percentReturn !== "undefined"
        ? sheetRow?.percentReturn
        : typeof sheetRow?.percent_return !== "undefined"
          ? sheetRow?.percent_return
          : (apiRow?.percentReturn ?? apiRow?.percent_return ?? undefined),
    upside:
      // upsidePotential as percent integer, e.g. 0.47 = 47%
      typeof sheetRow?.upsidePotential !== "undefined"
        ? Math.round(sheetRow.upsidePotential * 1000) / 10
        : typeof sheetRow?.upside !== "undefined"
          ? sheetRow.upside
          : typeof apiRow?.upsidePotential !== "undefined"
            ? Math.round(apiRow.upsidePotential * 1000) / 10
            : typeof apiRow?.upside !== "undefined"
              ? apiRow.upside
              : undefined,
    band:
      sheetRow?.action ||
      sheetRow?.band ||
      apiRow?.action ||
      apiRow?.band ||
      "BUY",
    latestMcapCr: sheetRow?.latestMcapCr ?? apiRow?.latestMcapCr ?? undefined,

    // Resources, communications, news...
    business_note: apiRow?.business_note ?? undefined,
    stock_performance_url: apiRow?.stock_performance_url || "",
    quick_bite: apiRow?.quick_bite ?? undefined,
    video: apiRow?.video ?? undefined,
    exit_rationale: apiRow?.exit_rationale ?? undefined,
    quarterly_update: apiRow?.quarterly_update ?? [],
    announcements_and_update: apiRow?.announcements_and_update ?? [],
    // fallback: allow performance_series, if any, or static below
    performance_series:
      sheetRow?.performance_series ?? apiRow?.performance_series,
  };
};

export const parseDate = (dateStr: string) => {
  const [month, year] = dateStr.split("-");
  const monthIndex = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(month);
  return new Date(2000 + parseInt(year), monthIndex, 1);
};

export type SeriesPoint = { date: string; stock: number; bse500: number };

export type PBRow = Record<string, string | number | null>;

function splitCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toNumber(val: string | undefined): number | null {
  if (!val) return null;
  const cleaned = val.replace(/[%",]/g, "").trim();
  if (cleaned === "" || cleaned.toLowerCase() === "null") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
// Utility function to extract sheetId and gid from a Google Sheets URL
function extractSheetInfo(
  sheetUrl: string
): { sheetId: string; gid: string } | null {
  // Example URL:
  // https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=304797657
  const regex = /\/d\/([a-zA-Z0-9-_]+)\/.*(?:\?|&)gid=([0-9]+)/;
  const match = sheetUrl.match(regex);
  if (match) {
    return {
      sheetId: match[1],
      gid: match[2],
    };
  }
  return null;
}

export async function fetchSingleRecommendationGraphSheetData(
  sheetUrl: string
): Promise<PBRow[]> {
  const sheetInfo = extractSheetInfo(sheetUrl);
  if (!sheetInfo) {
    throw new Error("Invalid Google Sheets URL");
  }
  const { sheetId, gid } = sheetInfo;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch PB Fintech sheet");
  const csv = await res.text();
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    if (cols[0]?.trim().toLowerCase() === "date") {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex === -1) return [];
  const rawHeaders = splitCsvRow(lines[headerIndex]).map((h) => h.trim());
  const headers: string[] = [];
  const seen = new Map<string, number>();
  for (const h of rawHeaders) {
    const base = h || "";
    const count = seen.get(base) || 0;
    if (count === 0) {
      headers.push(base);
      seen.set(base, 1);
    } else {
      const newName = `${base} (${count + 1})`;
      headers.push(newName);
      seen.set(base, count + 1);
    }
  }

  const rows: PBRow[] = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    if (cols.length === 0 || cols.every((c) => c.trim() === "")) continue;
    const obj: PBRow = {};
    headers.forEach((h, idx) => {
      const raw = (cols[idx] ?? "").trim();
      const n = toNumber(raw);
      obj[h] = n !== null ? n : raw || null;
    });
    // Skip rows with blank Date
    if (obj[headers[0]] !== null) rows.push(obj);
  }
  return rows;
}

export function rowsToSeries(rows: PBRow[]): SeriesPoint[] {
  const stockKey = Object.keys(rows[0] || {}).find((k) =>
    k.toLowerCase().includes("stock nav")
  );
  const indexKey = Object.keys(rows[0] || {}).find((k) =>
    k.toLowerCase().includes("index nav")
  );
  const dateKey = Object.keys(rows[0] || {}).find(
    (k) => k.toLowerCase() === "date"
  );
  if (!stockKey || !indexKey || !dateKey) return [];
  const series: SeriesPoint[] = [];
  for (const r of rows) {
    const date = (r[dateKey] as string) || "";
    const s = Number(r[stockKey]);
    const i = Number(r[indexKey]);
    if (Number.isFinite(s) && Number.isFinite(i)) {
      series.push({ date, stock: s, bse500: i });
    }
  }
  return series;
}


export function actionToNumeric(action: string | null | undefined): number | null {
  if (!action) return null;
  const val = action?.toLowerCase();
  if (val === "buy") return 1;
  if (val === "sell") return -1;
  if (val === "hold") return 0;
  return null;
}

export function formatMonthYear(dateStr: string) {
  if (!dateStr) return "";
  const dailyMatch = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dailyMatch) {
    return `${dailyMatch[2]} ${dailyMatch[3]}`;
  }
  const monthYearMatch = dateStr.match(/^([A-Za-z]{3})-(\d{2})$/);
  if (monthYearMatch) {
    const year = parseInt(monthYearMatch[2], 10);
    return `${monthYearMatch[1]} 20${year < 50 ? ("0" + year).slice(-2) : year}`;
  }
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (isoMatch) {
    const dt = new Date(dateStr);
    const mths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${mths[dt.getMonth()]} ${dt.getFullYear()}`;
  }
  return dateStr || "";
}



export function getGraphData(externalRows: PBRow[]): Array<{
  date: string;
  "Stock NAV": number | null;
  "Index NAV": number | null;
  Action: number | null;
  actualDate: string;
}> | null {
  if (externalRows && Array.isArray(externalRows) && externalRows.length) {
    const first = externalRows[0] || {};
    const dateKey = Object.keys(first).find(
      (k) => k.toLowerCase() === "date"
    );
    const stockNavKey = Object.keys(first).find(
      (k) => k.replace(/\s/g, "").toLowerCase() === "stocknav"
    );
    const indexNavKey = Object.keys(first).find(
      (k) => k.replace(/\s/g, "").toLowerCase() === "indexnav"
    );
    const actionKey = Object.keys(first).find(
      (k) => k.toLowerCase() === "action"
    );
    return externalRows.map(
      (
        row
      ): {
        date: string;
        "Stock NAV": number | null;
        "Index NAV": number | null;
        Action: number | null;
        actualDate: string;
      } => {
        const dateVal = dateKey ? (row[dateKey] as string) : "";
        let stockNavVal =
          stockNavKey && typeof row[stockNavKey] !== "undefined"
            ? Number(row[stockNavKey])
            : null;
        if (Number.isNaN(stockNavVal)) stockNavVal = null;
        let indexNavVal =
          indexNavKey && typeof row[indexNavKey] !== "undefined"
            ? Number(row[indexNavKey])
            : null;
        if (Number.isNaN(indexNavVal)) indexNavVal = null;
        let action = actionKey ? row[actionKey] : null;

        return {
          date: formatMonthYear(dateVal),
          "Stock NAV": stockNavVal,
          "Index NAV": indexNavVal,
          Action: actionToNumeric(action as string),
          actualDate: dateVal,
        };
      }
    );
  }
  // fallback default (if needed)
  return [
    {
      date: "Jan 2024",
      "Stock NAV": 92,
      "Index NAV": 80,
      Action: 1,
      actualDate: String(new Date()),
    },
    {
      date: "Feb 2024",
      "Stock NAV": 96,
      "Index NAV": 95,
      Action: 1,
      actualDate: String(new Date()),
    },
    {
      date: "Mar 2024",
      "Stock NAV": 100,
      "Index NAV": 100,
      Action: 1,
      actualDate: String(new Date()),
    },
  ];
}

export const parseAnyDate = (d: string) => {
  if (!d) return new Date(0);
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(d)) {
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }
  return parseDate(d);
};



export const getFilteredData = (externalRows: PBRow[], timeRange: string) => {
  const allData = getGraphData(externalRows)
  if (!Array.isArray(allData)) return [];
  let cutoff: Date;
  switch (timeRange) {
    case "1M":
      cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    case "3M":
      cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 3);
      break;
    case "1Y":
      cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    default:
      return allData;
  }
  return allData.filter((d: any) =>
    parseAnyDate(d?.actualDate) >= cutoff
  );
};