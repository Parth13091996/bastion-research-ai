import { ArrowDown, ArrowUp, ArrowUpDown, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  canViewStock,
  numericValue,
  getTableColumns,
  tableExitDate,
  tableMetrics,
  type TableSort,
  type TableSortKey,
} from './table-utils';

type Props = {
  stocks: StockData[];
  loading: boolean;
  error: string | null;
  hasPremiumAccess: boolean;
  exitedOnly: boolean;
  onLockedClick: () => void;
  onResearchClick: (stock: StockData) => void;
  sort: TableSort | null;
  onSort: (key: TableSortKey) => void;
};
const numeric = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const price = (value: unknown) => {
  const n = numericValue(value);
  return n !== null && n > 0 ? `₹${numeric.format(n)}` : '—';
};
const date = (value?: string) => {
  if (!value?.trim()) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function StockTable({
  stocks,
  loading,
  error,
  hasPremiumAccess,
  exitedOnly,
  onLockedClick,
  onResearchClick,
  sort,
  onSort,
}: Props) {
  const columns = getTableColumns(exitedOnly);
  if (loading)
    return (
      <div
        className="mt-5 rounded-xl border bg-white p-12 text-center text-sm text-slate-500"
        role="status"
      >
        Loading recommendations…
      </div>
    );
  if (error)
    return (
      <div className="mt-5 rounded-xl border bg-white p-8 text-sm text-red-700" role="alert">
        Unable to load recommendations. Please try again.
      </div>
    );
  return (
    <section
      className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-label="Table view"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-semibold text-slate-800">
          {stocks.length} {stocks.length === 1 ? 'recommendation' : 'recommendations'}
        </p>
        <p className="text-xs text-slate-500">Select a company name to view research</p>
        <p className="w-full text-[11px] text-slate-400 sm:hidden">
          Scroll horizontally to see all columns →
        </p>
      </div>
      <div
        className="max-h-[70vh] overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        tabIndex={0}
        role="region"
        aria-label="Scrollable recommendations table"
      >
        <table
          className={`w-full ${exitedOnly ? 'min-w-[1080px]' : 'min-w-[1160px]'} table-fixed border-separate border-spacing-0 text-sm`}
        >
          <caption className="sr-only">
            {exitedOnly
              ? 'Exited recommendations with market cap, recommendation date, action, entry price, exit price, exit date and price return.'
              : 'Recommendations with market cap, recommendation date, action, entry price, CMP, target price, expected upside and price return.'}
          </caption>
          <colgroup>
            {(exitedOnly
              ? [210, 100, 140, 80, 110, 110, 140, 165]
              : [210, 100, 140, 80, 110, 105, 115, 135, 165]
            ).map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-xs font-semibold text-slate-600">
              {columns.map((column, index) => {
                const active = sort?.key === column.key;
                const Icon = active
                  ? sort.direction === 'asc'
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                    className={`sticky top-0 border-b border-slate-200 bg-slate-50 ${index === 0 ? 'left-0 z-30 min-w-[210px] px-4' : 'z-20 px-3'} py-3 ${column.numeric ? 'text-right' : 'text-left'}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      aria-label={`Sort by ${column.label}`}
                      className={`inline-flex items-center gap-1.5 rounded py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? 'text-[#1C2852]' : 'text-slate-500 hover:text-slate-900'} ${column.numeric ? 'justify-end' : ''}`}
                    >
                      <span
                        className={
                          ['returnPercent', 'expectedUpside', 'dateRecommended'].includes(
                            column.key,
                          )
                            ? 'whitespace-normal leading-snug'
                            : 'whitespace-nowrap'
                        }
                      >
                        {column.label}
                      </span>
                      <Icon size={13} className="shrink-0" aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!stocks.length && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-500">
                  No recommendations match your search or filter.
                </td>
              </tr>
            )}
            {stocks.map((stock) => {
              const locked = !canViewStock(stock, hasPremiumAccess);
              const metrics = tableMetrics(stock);
              const {
                action,
                exited,
                cmp: current,
                expectedUpside: upside,
                marketCap: mcap,
                returnPercent,
              } = metrics;
              const badge =
                action === 'BUY'
                  ? 'bg-emerald-50 text-emerald-700'
                  : action === 'HOLD'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-red-50 text-red-700';
              const cell =
                'whitespace-nowrap border-b border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700';
              return (
                <tr key={stock.id} className="group hover:bg-slate-50">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-4 text-left font-normal group-hover:bg-slate-50"
                  >
                    {locked ? (
                      <button
                        type="button"
                        onClick={onLockedClick}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"
                      >
                        <LockKeyhole size={14} aria-hidden="true" />
                        Premium recommendation
                      </button>
                    ) : (
                      <>
                        <Link
                          to={`/user/app/view-research/${encodeURIComponent(stock.code || '')}`}
                          onClick={() => onResearchClick(stock)}
                          className="block font-semibold text-[#1C2852] hover:underline focus-visible:underline"
                        >
                          {stock.name}
                        </Link>
                        <span className="mt-1 block text-xs font-normal text-slate-400">
                          {stock.code}
                        </span>
                      </>
                    )}
                  </th>
                  <td className={cell}>
                    {locked || mcap === null || mcap <= 0 ? '—' : numeric.format(mcap)}
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 text-left text-slate-600">
                    {locked ? '—' : date(stock.dateRecommended)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-4 text-left">
                    {locked || !action ? (
                      '—'
                    ) : (
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${badge}`}
                      >
                        {action}
                      </span>
                    )}
                  </td>
                  <td className={cell}>{locked ? '—' : price(metrics.entryPrice)}</td>
                  <td className={cell}>
                    {locked ? (
                      '—'
                    ) : (
                      <>
                        {price(current)}
                        {exited && !exitedOnly && (
                          <span className="mt-1 block text-[10px] font-normal text-slate-400">
                            Exit price
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  {exitedOnly ? (
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-4 text-left text-slate-600">
                      {locked ? '—' : date(tableExitDate(stock) || undefined)}
                    </td>
                  ) : (
                    <>
                      <td className={cell}>
                        {locked || exited ? '—' : price(metrics.targetPrice)}
                      </td>
                      <td className={`${cell} font-semibold`}>
                        <span
                          className={
                            !locked && !exited && upside !== null
                              ? upside > 0
                                ? 'text-emerald-700'
                                : upside < 0
                                  ? 'text-red-700'
                                  : 'text-slate-600'
                              : 'text-slate-400'
                          }
                        >
                          {locked || exited || upside === null
                            ? '—'
                            : `${upside > 0 ? '+' : ''}${numeric.format(upside)}%`}
                        </span>
                      </td>
                    </>
                  )}
                  <td className={`${cell} font-semibold`}>
                    <span
                      className={
                        locked || returnPercent === null
                          ? 'text-slate-400'
                          : returnPercent > 0
                            ? 'text-emerald-700'
                            : returnPercent < 0
                              ? 'text-red-700'
                              : 'text-slate-600'
                      }
                    >
                      {locked || returnPercent === null
                        ? '—'
                        : `${returnPercent > 0 ? '+' : ''}${numeric.format(returnPercent)}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs leading-relaxed text-slate-500">
        {exitedOnly
          ? 'Mcap is in ₹ crore. Prices are in ₹. Return is price change from entry to exit price, excluding dividends, fees and taxes.'
          : 'Mcap is in ₹ crore. Prices are in ₹. Closed recommendations show their exit price under CMP; target and expected upside do not apply. Return is price change from entry to CMP or exit price, excluding dividends, fees and taxes.'}
      </p>
    </section>
  );
}
