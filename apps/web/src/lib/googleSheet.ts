export type RowObject = Record<string, any>;

export const parseSheetUrl = (
  urlString: string
): { id: string; gid: string } => {
  console.log(urlString, "str");
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
    const res = await fetch(jsonUrl);
    if (!res.ok) throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
    const text = await res.text();
    const updatedText = text.slice(text.indexOf("table") + 7, text.length - 3);

    const table = JSON.parse(updatedText) as any;
    if (!table || !Array.isArray(table?.rows)) return [];
    const headers: string[] = (table.cols || []).map((c: any) =>
      (c?.label ?? "").toString()
    );
    const rows: any[] = table.rows || [];

    // Convert GViz rows to plain array of objects
    return rows.map((r: any) => {
      const obj: RowObject = {};
      headers.forEach((h: string, i: number) => {
        const cell = r.c?.[i] ?? null;
        obj[h] = cell?.v ?? "";
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet objects:", error);
    return [];
  }
};

export function findSecondLastIndex(str, target) {
  // First, find the index of the last occurrence
  const lastIndex = str.lastIndexOf(target);

  if (lastIndex === -1) {
    return -1; // Target not found
  }

  // Then, find the last occurrence before the last one
  const secondLastIndex = str.lastIndexOf(target, lastIndex - 1);

  return secondLastIndex;
}

// Helpers
export const normalizeKey = (k: string) =>
  k.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const toNumber = (v: any): number => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const s = String(v)
    .replace(/[,₹%\s]/g, "")
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
