import Modal from "@/components/core/Modal";
import { useAuth } from "@/contexts/AuthContext";
import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useState } from "react";
import RecommendationsControls from "./Controls";
import StockGrid from "./StockGrid";
import { COLORS } from "./utils";

const PricingDialogContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
    <p className="text-sm text-gray-600">
      Access all recommendations and premium research by subscribing to Bastion
      Research Core.
    </p>
    <div className="rounded-xl border p-4 bg-gray-50">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-blue-600">₹ 18,750</span>
        <span className="text-gray-500">/ Annually (incl. GST)</span>
      </div>
      <a
        href="/user/app/account/subscription"
        className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full"
      >
        View Plans / Subscribe
      </a>
    </div>
  </div>
);

const RecommendationList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const { stocks: sheetStocks, loading, error } = useSheetStocks();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const filteredStocks = (sheetStocks || []).filter((stock) => {
    const matchesFilter = filterBy === "All" || stock.band === filterBy;
    const matchesSearch =
      (stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.band?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case "MCAP Wise":
        // Null checks for marketCap
        return (
          Number((b.marketCap ?? "0").replace(/[^0-9.]/g, "")) -
          Number((a.marketCap ?? "0").replace(/[^0-9.]/g, ""))
        );
      case "Newest":
        // Null checks for lastUpdated
        return (
          new Date(b.lastUpdated ?? 0).getTime() -
          new Date(a.lastUpdated ?? 0).getTime()
        );
      case "Oldest":
        return (
          new Date(a.lastUpdated ?? 0).getTime() -
          new Date(b.lastUpdated ?? 0).getTime()
        );
      case "Upside Wise":
        // Null check for upside
        return Number(b.upside ?? 0) - Number(a.upside ?? 0);
      case "Return Wise":
        // Null checks for target1, entryPrice
        const aEntry = a.entryPrice ?? 1; // avoid zero division; fallback to 1
        const bEntry = b.entryPrice ?? 1;
        return (
          ((b.target1 ?? bEntry) - bEntry) / bEntry -
          ((a.target1 ?? aEntry) - aEntry) / aEntry
        );
      default:
        return 0;
    }
  });

  const handleLoadMore = () => {
    //@ts-ignore
    if (!user?.plan_id === 1) {
      setShowPricing(true);
      return;
    }
    setVisibleCount((prev) => (prev ?? 0) + 9);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            All Recommendations
          </h1>
          <p className="text-gray-600">
            Discover high-potential investment opportunities
          </p>
        </div>

        <RecommendationsControls
          sortBy={sortBy}
          filterBy={filterBy}
          searchTerm={searchTerm}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
          onSearchChange={setSearchTerm}
        />

        <StockGrid
          error={error}
          loading={loading}
          stocks={sortedStocks ?? []}
          visibleCount={visibleCount}
          onLoadMore={handleLoadMore}
        />

        <Modal
          open={showPricing}
          className="max-w-md"
          title={"Premium Access"}
          onOpenChange={setShowPricing}
        >
          <PricingDialogContent />
        </Modal>
      </div>
    </div>
  );
};

export default RecommendationList;
