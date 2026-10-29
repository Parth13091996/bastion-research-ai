import axios from 'axios';

export type PortfolioDashboardMetrics = {
  totalRecommendations: number | null;
  activeBuy: number | null;
  activeHold: number | null;
  exitedClosed: number | null;
  recommendedStocksXirr: number | null;
  nifty500Xirr: number | null;
};

type SheetCell = { v?: unknown; f?: string } | null;
type SheetTable = { rows: { c?: SheetCell[] }[] };

function cellNumber(cell: SheetCell | undefined, percent = false): number | null {
  const value = cell?.v;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.trim().replace(/,/g, '');
  const hasPercent = cleaned.endsWith('%');
  const parsed = Number(hasPercent ? cleaned.slice(0, -1) : cleaned);
  if (!Number.isFinite(parsed)) return null;
  return percent && hasPercent ? parsed / 100 : parsed;
}

export function mapPortfolioDashboardCells(table: SheetTable): PortfolioDashboardMetrics {
  // The requested range starts at B35. Each requested cell is placed at its exact offset before mapping.
  const cell = (offset: number) => table.rows[offset]?.c?.[0];
  const count = (offset: number) => {
    const n = cellNumber(cell(offset));
    return n !== null && Number.isInteger(n) && n >= 0 ? n : null;
  };
  return {
    totalRecommendations: count(0), // B35
    activeBuy: count(1), // B36
    activeHold: count(2), // B37
    exitedClosed: count(3), // B38
    recommendedStocksXirr: cellNumber(cell(7), true), // B42: XIRR is a decimal ratio.
    nifty500Xirr: cellNumber(cell(8), true), // B43
  };
}

export function parsePortfolioSheetResponse(text: string): SheetTable {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) throw new Error('Unexpected Google Sheets response');
  const response = JSON.parse(match[1]);
  if (response.status === 'error' || !Array.isArray(response.table?.rows)) {
    throw new Error('The configured dashboard sheet could not be read');
  }
  return response.table;
}

export function portfolioDashboardUrl(sheetUrl: string, range = 'B35'): string {
  const input = new URL(sheetUrl);
  if (input.hostname !== 'docs.google.com') throw new Error('Expected a Google Sheets URL');
  const id = input.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) throw new Error('Invalid spreadsheet ID');
  const gid = input.searchParams.get('gid') || new URLSearchParams(input.hash.slice(1)).get('gid');
  const params = new URLSearchParams({ tqx: 'out:json', headers: '0', range });
  if (gid) params.set('gid', gid);
  else params.set('sheet', 'Dashboard');
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params}`;
}

let cache: { url: string; until: number; data: PortfolioDashboardMetrics } | undefined;
const pending = new Map<string, Promise<PortfolioDashboardMetrics>>();
export async function fetchPortfolioDashboard(sheetUrl: string): Promise<PortfolioDashboardMetrics> {
  const url = portfolioDashboardUrl(sheetUrl);
  if (cache?.url === url && cache.until > Date.now()) return cache.data;
  const current = pending.get(url);
  if (current) return current;
  const request = (async () => {
    // Google gViz omits blank rows from multi-row ranges. Read exact cells so
    // empty neighbouring cells cannot shift B42/B43 into another metric.
    const rows: SheetTable['rows'] = [];
    await Promise.all([0, 1, 2, 3, 7, 8].map(async offset => {
      const cellUrl = portfolioDashboardUrl(sheetUrl, `B${35 + offset}`);
      const response = await axios.get<string>(cellUrl, { responseType: 'text', timeout: 15000 });
      const table = parsePortfolioSheetResponse(response.data);
      rows[offset] = table.rows[0] || { c: [null] };
    }));
    const data = mapPortfolioDashboardCells({ rows });
    cache = { url, until: Date.now() + 30000, data };
    return data;
  })();
  pending.set(url, request);
  try { return await request; } finally { pending.delete(url); }
}
