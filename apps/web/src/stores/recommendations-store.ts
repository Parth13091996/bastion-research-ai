import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecommendationsState {
  // Cached data
  stocks: StockData[];
  dbData: StockData[];
  sheetStocks: StockData[];
  notInsertedData: StockData[];

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Timestamp for cache invalidation
  lastFetched: number | null;

  // Actions
  setStocks: (stocks: StockData[]) => void;
  setDbData: (data: StockData[]) => void;
  setSheetStocks: (stocks: StockData[]) => void;
  setNotInsertedData: (data: StockData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastFetched: () => void;
  clearCache: () => void;
  shouldRefetch: (maxAge?: number) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      // Initial state
      stocks: [],
      dbData: [],
      sheetStocks: [],
      notInsertedData: [],
      loading: false,
      error: null,
      lastFetched: null,

      // Actions
      setStocks: (stocks) => set({ stocks }),
      setDbData: (data) => set({ dbData: data }),
      setSheetStocks: (stocks) => set({ sheetStocks: stocks }),
      setNotInsertedData: (data) => set({ notInsertedData: data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      updateLastFetched: () => set({ lastFetched: Date.now() }),

      clearCache: () =>
        set({
          stocks: [],
          dbData: [],
          sheetStocks: [],
          notInsertedData: [],
          loading: false,
          error: null,
          lastFetched: null,
        }),

      shouldRefetch: (maxAge = CACHE_DURATION) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > maxAge;
      },
    }),
    {
      name: "recommendations-storage", // unique name for localStorage key
      partialize: (state) => ({
        // Only persist these fields
        stocks: state.stocks,
        dbData: state.dbData,
        sheetStocks: state.sheetStocks,
        notInsertedData: state.notInsertedData,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
