import Modal from '@/components/core/Modal';
import { useAuth } from '@/contexts/AuthContext';
import useSheetStocks from '@/hooks/use-sheets-stocks';
import { useState } from 'react';
import RecommendationsControls from './Controls';
import StockGrid from './StockGrid';
import StockTable from './StockTable';
import {
  compareTableStocks,
  getTableColumns,
  type TableSort,
  type TableSortKey,
} from './table-utils';
import { LayoutGrid, Table2 } from 'lucide-react';
import { userCompanyAnalytics } from '@/api/recommendations-apis';
import { COLORS } from './utils';
import { User } from '@repo/types';
import { useSubscription } from '@/hooks/use-subscription';

// Dialog informing about upgrade
const PricingDialogContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
    <p className="text-sm text-gray-600">
      Access all recommendations and premium research by subscribing to Bastion Research Core.
    </p>
    <a
      href="/user/app/account/subscription"
      className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#c00000] text-white hover:bg-white border border-blue-900 hover:text-[#c00000] w-full"
    >
      View Plans / Subscribe
    </a>
  </div>
);

// Utility to normalize text (mainly for tag/band)
const normalizeText = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase() ?? '';
  // Normalize both "exit" and "exited" to "exit"
  if (normalized === 'exited') return 'exit';
  if (normalized === 'exit') return 'exit';
  return normalized;
};

// Prioritize freemium for free subscribers, everyone else sees the same order as input
const prioritizeFreemium = <T extends { tags?: string }>(stocks: T[], user: User) => {
  if (user?.role !== 'free_subscriber') return stocks;
  const freemium: T[] = [];
  const others: T[] = [];
  for (const stock of stocks) {
    if (normalizeText(stock.tags) === 'freemium') {
      freemium.push(stock);
    } else {
      others.push(stock);
    }
  }
  return [...freemium, ...others];
};

const RecommendationList = ({
  initialView = 'cards',
}: { initialView?: 'cards' | 'table' } = {}) => {
  const [view, setView] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('bastion:recommendations:view');
      if (saved === 'cards' || saved === 'table') return saved;
    } catch {}
    return initialView;
  });
  const changeView = (next: 'cards' | 'table') => {
    setView(next);
    try {
      localStorage.setItem('bastion:recommendations:view', next);
    } catch {}
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [columnSort, setColumnSort] = useState<TableSort | null>(null);
  const [filterBy, setFilterBy] = useState('All');
  const [visibleCount, setVisibleCount] = useState(9);
  const { stocks, loading, error } = useSheetStocks();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const { data: subscription } = useSubscription();

  // Filter according to filter & search term
  const filteredStocks = (stocks || []).filter((stock) => {
    const matchesFilter =
      filterBy === 'All' || normalizeText(stock.band) === normalizeText(filterBy);
    const matchesSearch =
      (stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.band?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const presetSort: TableSort | null =
    sortBy === 'Newest'
      ? { key: 'dateRecommended', direction: 'desc' }
      : sortBy === 'Oldest'
        ? { key: 'dateRecommended', direction: 'asc' }
        : sortBy === 'MCAP Wise'
          ? { key: 'marketCap', direction: 'desc' }
          : sortBy === 'Upside Wise'
            ? { key: 'expectedUpside', direction: 'desc' }
            : sortBy === 'Return Wise'
              ? { key: 'returnPercent', direction: 'desc' }
              : null;
  const activeSort = columnSort || presetSort;
  const sortedStocks = activeSort
    ? [...filteredStocks].sort((a, b) =>
        compareTableStocks(a, b, activeSort, !!subscription?.is_premium),
      )
    : filteredStocks;
  const handleColumnSort = (key: TableSortKey) => {
    const direction =
      activeSort?.key === key
        ? activeSort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : key === 'name' || key === 'action'
          ? 'asc'
          : 'desc';
    setColumnSort({ key, direction });
    const label =
      getTableColumns(filterBy === 'EXIT').find((column) => column.key === key)?.label || key;
    setSortBy(`Column: ${label} ${direction === 'asc' ? '↑' : '↓'}`);
  };
  const handlePresetSort = (value: string) => {
    setColumnSort(null);
    setSortBy(value);
  };

  const handleFilterChange = (value: string) => {
    const enteringExited = value === 'EXIT';
    const hiddenSort =
      activeSort &&
      (enteringExited
        ? ['targetPrice', 'expectedUpside'].includes(activeSort.key)
        : activeSort.key === 'exitDate');
    if (hiddenSort) {
      setColumnSort(null);
      setSortBy('Newest');
    } else if (columnSort) {
      const label =
        getTableColumns(enteringExited).find((column) => column.key === columnSort.key)?.label ||
        columnSort.key;
      setSortBy(`Column: ${label} ${columnSort.direction === 'asc' ? '↑' : '↓'}`);
    }
    setFilterBy(value);
  };

  // All freemium stocks at top for free users, others unchanged
  const prioritizedStocks = prioritizeFreemium(sortedStocks, user);

  const handleLoadMore = () => {
    // Only allow access to more rows if user has an active premium subscription
    if (!subscription?.is_premium) {
      setShowPricing(true);
      return;
    }
    setVisibleCount((prev) => (prev ?? 0) + 9);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">All Recommendations</h1>
            <p className="text-gray-600">Discover high-potential investment opportunities</p>
          </div>
          <div
            role="group"
            aria-label="Recommendation view"
            className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:self-auto"
          >
            {(
              [
                ['cards', 'Cards', LayoutGrid],
                ['table', 'Table', Table2],
              ] as const
            ).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                aria-label={mode === 'cards' ? 'Card view' : 'Table view'}
                aria-pressed={view === mode}
                onClick={() => changeView(mode)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view === mode ? 'bg-[#1C2852] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <RecommendationsControls
          sortBy={sortBy}
          filterBy={filterBy}
          searchTerm={searchTerm}
          onSortChange={handlePresetSort}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
        />

        {view === 'table' ? (
          <StockTable
            stocks={prioritizedStocks ?? []}
            exitedOnly={filterBy === 'EXIT'}
            sort={activeSort}
            onSort={handleColumnSort}
            loading={loading}
            error={error}
            hasPremiumAccess={!!subscription?.is_premium}
            onLockedClick={() => setShowPricing(true)}
            onResearchClick={(stock) => {
              if (user?.id) void userCompanyAnalytics(stock.code, user.id).catch(() => {});
            }}
          />
        ) : (
          <StockGrid
            error={error}
            loading={loading}
            stocks={prioritizedStocks ?? []}
            visibleCount={visibleCount}
            onLoadMore={handleLoadMore}
          />
        )}

        <Modal
          open={showPricing}
          className="max-w-md"
          title={'Premium Access'}
          onOpenChange={setShowPricing}
        >
          <PricingDialogContent />
        </Modal>
      </div>
    </div>
  );
};

export default RecommendationList;
