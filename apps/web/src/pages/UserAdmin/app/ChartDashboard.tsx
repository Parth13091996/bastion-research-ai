import { useId } from 'react';
import XirrMethodologyDialog from './XirrMethodologyDialog';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { getPortfolioDashboardData } from '@/api/recommendations-apis';
import { formatPerformanceDate, formatXirr, validMetric, xirrAxis } from './portfolio-chart';

function XirrChart({ portfolio, benchmark }: { portfolio: number | null; benchmark: number | null }) {
  const id = useId();
  const bars = [
    { label: 'Recommended Stocks', value: portfolio, color: '#a78bfa' },
    { label: 'Nifty 500', value: benchmark, color: '#60a5fa' },
  ];
  const axis = xirrAxis([portfolio, benchmark]);
  const top = 35, bottom = 235, left = 70, right = 590;
  const y = (value: number) => bottom - ((value - axis.min) / (axis.max - axis.min)) * (bottom - top);
  const baseline = y(0);
  if (!bars.some(bar => validMetric(bar.value))) {
    return <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-300">XIRR data is not available yet.</div>;
  }
  return <svg viewBox="0 0 640 300" className="w-full" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>Recommended Stocks XIRR compared with Nifty 500</title>
    <desc id={`${id}-description`}>Recommended Stocks: {formatXirr(portfolio)}. Nifty 500: {formatXirr(benchmark)}. Bars share a zero baseline.</desc>
    {axis.ticks.map(tick => <g key={tick}>
      <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke={Math.abs(tick) < 1e-10 ? '#94a3b8' : '#ffffff'} strokeOpacity={Math.abs(tick) < 1e-10 ? 0.6 : 0.1} />
      <text x={left - 12} y={y(tick) + 4} textAnchor="end" fill="#cbd5e1" className="text-[22px] sm:text-[12px]">{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(tick)}%</text>
    </g>)}
    {bars.map((bar, index) => {
      const x = index === 0 ? 150 : 390;
      const available = validMetric(bar.value);
      const valueY = available ? y(bar.value * 100) : baseline;
      const negative = available && bar.value < 0;
      return <g key={bar.label} data-series={bar.label}>
        {available && <rect x={x} y={Math.min(valueY, baseline)} width="100" height={Math.abs(valueY - baseline)} rx="6" fill={negative ? '#fb7185' : bar.color}>
          <title>{bar.label}: {formatXirr(bar.value)}</title>
        </rect>}
        <text x={x + 50} y={available ? negative ? valueY + 20 : valueY - 12 : baseline - 12} textAnchor="middle" fill="#ffffff" className="text-[26px] sm:text-[17px]" fontWeight="700">{available ? formatXirr(bar.value) : '—'}</text>
        <text x={x + 50} y="274" textAnchor="middle" fill="#e2e8f0" className="text-[22px] sm:text-[14px]">{bar.label}</text>
        {!available && <text x={x + 50} y="292" textAnchor="middle" fill="#94a3b8" className="text-[20px] sm:text-[12px]">Not available</text>}
      </g>;
    })}
  </svg>;
}

const ChartDashboard = () => {
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ['portfolio-dashboard-metrics'], queryFn: getPortfolioDashboardData,
    refetchInterval: 60000, staleTime: 30000, retry: 1,
  });
  const endDate = formatPerformanceDate(data?.performanceEndDate);
  const counts = [
    { label: 'Total Recommendations', value: data?.totalRecommendations, detail: 'Till date', color: 'text-violet-300' },
    { label: 'Active Buy', value: data?.activeBuy, detail: 'Stocks', color: 'text-emerald-300' },
    { label: 'Active Hold', value: data?.activeHold, detail: 'Stocks', color: 'text-sky-300' },
    { label: 'Exited / Closed', value: data?.exitedClosed, detail: 'Stocks', color: 'text-amber-300' },
  ];
  return <div id="bastion-performance"><section className="mb-8 rounded-xl bg-gradient-to-br from-[#13013d] to-[#010313] p-4 sm:p-6 lg:p-8 text-white" aria-label="Recommendation overview and portfolio performance">
    <div className="mb-6 text-center lg:mb-8">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Every Hit. Every Miss. <span className="text-blue-300">Shared with Clarity</span></h2>
      <p className="mt-2 text-sm text-slate-300">Confidence is built, not borrowed</p>
    </div>
    {isError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">
      <span>{data ? 'Could not refresh. Showing the last available values.' : 'Dashboard data could not be loaded. Please try again.'}</span>
      <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded border border-white/30 px-3 py-1.5 text-white disabled:opacity-50">Retry</button>
    </div>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {counts.map(item => <div key={item.label} className="min-w-0 rounded-xl border border-white/10 bg-white/10 p-3 sm:p-5">
        <p className="min-h-[40px] text-xs sm:text-sm font-medium text-slate-200">{item.label}</p>
        <p className={`mt-2 text-3xl font-bold tabular-nums sm:text-4xl ${item.color}`} aria-busy={isPending}>{!isPending && validMetric(item.value) ? new Intl.NumberFormat('en-IN').format(item.value) : '—'}</p>
        <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
      </div>)}
    </div>
    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-5 lg:p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-semibold sm:text-xl">Recommended Stocks XIRR vs Nifty 500</h3><p className="mt-1 text-xs text-slate-300">Annualised XIRR (%)</p><p className="mt-2 text-sm text-slate-200">Performance period: 11 Mar 2024 – {endDate ?? (isPending ? 'Loading end date…' : 'End date unavailable')}</p></div>
        <div className="flex flex-wrap items-center gap-2">
        <XirrMethodologyDialog />
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50" aria-label="Refresh portfolio dashboard">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />{isFetching ? 'Refreshing' : 'Refresh'}
        </button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        {isPending ? <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-300" role="status">Loading portfolio performance...</div> : <XirrChart portfolio={data?.recommendedStocksXirr ?? null} benchmark={data?.nifty500Xirr ?? null} />}
      </div>
    </div>
  </section></div>;
};
export default ChartDashboard;
