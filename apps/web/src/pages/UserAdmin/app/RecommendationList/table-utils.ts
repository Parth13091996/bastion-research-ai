export type TableSortKey =
  | 'name'
  | 'marketCap'
  | 'dateRecommended'
  | 'exitDate'
  | 'action'
  | 'entryPrice'
  | 'cmp'
  | 'targetPrice'
  | 'expectedUpside'
  | 'returnPercent';
export type TableSort = { key: TableSortKey; direction: 'asc' | 'desc' };
export const tableColumns: { key: TableSortKey; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Name', numeric: false },
  { key: 'marketCap', label: 'Mcap (₹ Cr)', numeric: true },
  { key: 'dateRecommended', label: 'Recommended date', numeric: false },
  { key: 'action', label: 'Action', numeric: false },
  { key: 'entryPrice', label: 'Entry Price', numeric: true },
  { key: 'cmp', label: 'CMP', numeric: true },
  { key: 'targetPrice', label: 'Target Price', numeric: true },
  { key: 'expectedUpside', label: 'Expected Upside %', numeric: true },
  { key: 'returnPercent', label: 'Return since recommendation %', numeric: true },
];
export function getTableColumns(exitedOnly: boolean) {
  if (!exitedOnly) return tableColumns;
  const columns = tableColumns
    .filter((column) => column.key !== 'targetPrice' && column.key !== 'expectedUpside')
    .map((column) => (column.key === 'cmp' ? { ...column, label: 'Exit Price' } : column));
  columns.splice(columns.length - 1, 0, { key: 'exitDate', label: 'Exit Date', numeric: false });
  return columns;
}
export function tableExitDate(stock: StockData): string | null {
  if (
    !['EXIT', 'EXITED'].includes(
      String(stock.band || '')
        .trim()
        .toUpperCase(),
    )
  )
    return null;
  const candidates = [
    stock.dateExit,
    ...(Array.isArray(stock.stock_performance_url)
      ? stock.stock_performance_url.map((item) => item.exit_date || item.dateExit)
      : []),
  ];
  return candidates.find((value) => value && Number.isFinite(Date.parse(value))) || null;
}

export const numericValue = (value: unknown): number | null => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};
const positive = (value: unknown) => {
  const result = numericValue(value);
  return result !== null && result > 0 ? result : null;
};
export const canViewStock = (stock: StockData, premium: boolean) =>
  premium ||
  String(stock.tags || '')
    .trim()
    .toLowerCase() === 'freemium';
export function tableMetrics(stock: StockData) {
  const raw = stock.tableValues;
  const action = String(stock.band || '')
    .trim()
    .toUpperCase()
    .replace(/^EXITED$/, 'EXIT');
  const exited = action === 'EXIT';
  const historicalExit =
    exited && Array.isArray(stock.stock_performance_url)
      ? stock.stock_performance_url
          .map((item) => positive(item.exit_price))
          .find((value) => value !== null)
      : null;
  const entryPrice = positive(raw ? raw.entryPrice : stock.entryPrice);
  const cmp = exited
    ? (historicalExit ?? positive(stock.cmpOrExitPrice) ?? positive(raw ? raw.cmp : stock.cmp))
    : positive(raw ? raw.cmp : stock.cmp);
  return {
    action,
    exited,
    entryPrice,
    cmp,
    marketCap: positive(raw ? raw.marketCap : stock.marketCap),
    targetPrice: exited ? null : positive(raw ? raw.targetPrice : stock.target1),
    expectedUpside: exited ? null : numericValue(raw ? raw.expectedUpside : stock.upside),
    returnPercent:
      entryPrice !== null && cmp !== null ? ((cmp - entryPrice) / entryPrice) * 100 : null,
  };
}
export function compareTableStocks(a: StockData, b: StockData, sort: TableSort, premium: boolean) {
  const value = (stock: StockData): string | number | null => {
    if (!canViewStock(stock, premium)) return null;
    if (sort.key === 'name') return stock.name?.trim() || null;
    if (sort.key === 'dateRecommended' || sort.key === 'exitDate') {
      const date = sort.key === 'exitDate' ? tableExitDate(stock) : stock.dateRecommended;
      const timestamp = date ? Date.parse(date) : NaN;
      return Number.isFinite(timestamp) ? timestamp : null;
    }
    const metrics = tableMetrics(stock);
    if (sort.key === 'action')
      return ({ BUY: 0, HOLD: 1, EXIT: 2 } as Record<string, number>)[metrics.action] ?? null;
    return metrics[sort.key];
  };
  const first = value(a),
    second = value(b);
  // Missing/locked values stay at the bottom in either direction.
  if (first === null) return second === null ? 0 : 1;
  if (second === null) return -1;
  const compared =
    typeof first === 'string' && typeof second === 'string'
      ? first.localeCompare(second, 'en', { sensitivity: 'base' })
      : Number(first) - Number(second);
  return sort.direction === 'asc' ? compared : -compared;
}
