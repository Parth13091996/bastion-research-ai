interface QuarterlyUpdate {
  date: string;
  title: string;
  pdf_url?: string;
  description: string;
}

interface Announcement {
  date: string;
  title: string;
  pdf_url?: string;
  description: string;
}

interface StockData {
  id: string | number;
  logo?: string;
  name: string;
  company_name?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: QuarterlyUpdate[];
  announcements_and_update?: Announcement[];
  created_at?: string;
  updated_at?: string;
  code?: string;
  marketCap?: string;
  upside?: string;
  cmp?: number;
  entryPrice?: number;
  target1?: number;
  sector?: string;
  band?: "BUY" | "HOLD" | "EXITED";
  lastUpdated?: string;
  percentReturn?: number | string;
  tags?: string;
  dateRecommended?: string;
  holdingPeriod?: string;
  dateExit?: string;
}
/**
 * Controls for search, sort, and filter.
 * Handles local state for inputs and callbacks for parent.
 */
interface RecommendationsControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterBy: string;
  onFilterChange: (filter: string) => void;
}

/**
 * Grid of stock cards with load more functionality.
 */
interface StockGridProps {
  stocks: StockData[];
  visibleCount: number;
  onLoadMore: () => void;
  loading: boolean;
  error: string | null;
}

interface DashboardMetrics {
  liveCount: number;
  avgLiveReturn: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topGainer?: RecommendationRecord;
  topLoser?: RecommendationRecord;

  exitCount: number;
  avgExitReturn: number;
  profitExits: number;
  lossExits: number;
  successRate: number;
  bestExit?: RecommendationRecord;
  worstExit?: RecommendationRecord;
}

interface ExtendedRecommendation {
  id?: number | string;
  name: string;
  code: string;
  marketCap: string;
  upside: number;
  cmp: number;
  entryPrice: number;
  target1: number;
  sector?: string;
  band: string;
  lastUpdated?: string;
  logo?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
  // For CSV compatibility with previous prop names:
  companyName?: string;
  nseSymbol?: string;
  dateRecommended?: string;
  priceAtRecommendation?: number;
  dateExit?: string;
  holdingPeriod?: string;
  cmpOrExitPrice?: number;
  percentReturn?: string | number;
  action?: string;
  targetPrice?: number;
  upsidePotential?: number;
  latestMcapCr?: number | string;
}

interface ExtendedRecommendationRecord {
  id: number;
  companyName: string;
  nseSymbol: string;
  dateRecommended: string;
  priceAtRecommendation: string;
  dateExit?: string;
  holdingPeriod?: string;
  cmpOrExitPrice: string;
  percentReturn?: string | number;
  action: string;
  targetPrice?: string;
  upsidePotential?: string;
  latestMcapCr?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
  stock_performance_url?: string;
  tags?: string;
  created_at?: string;
}

interface UpdateItem {
  date: string;
  title: string;
  description: string;
  pdf_url: string;
}
