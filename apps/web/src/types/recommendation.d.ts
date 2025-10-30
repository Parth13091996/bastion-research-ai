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
  upside?: number;
  cmp?: number;
  entryPrice?: number;
  target1?: number;
  sector?: string;
  band?: "BUY" | "HOLD" | "EXITED";
  lastUpdated?: string;
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
