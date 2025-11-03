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
  console.log({ sheetStocks });
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  const filteredStocks = sheetStocks.filter((stock) => {
    const matchesFilter = filterBy === "All" || stock.band === filterBy;
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.band.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case "MCAP Wise":
        return (
          Number(b.marketCap.replace(/[^0-9.]/g, "")) -
          Number(a.marketCap.replace(/[^0-9.]/g, ""))
        );
      case "Newest":
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      case "Oldest":
        return (
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        );
      case "Upside Wise":
        return Number(b.upside) - Number(a.upside);
      case "Return Wise":
        return (
          (b.target1 - b.entryPrice) / b.entryPrice -
          (a.target1 - a.entryPrice) / a.entryPrice
        );
      default:
        return 0;
    }
  });

  const handleLoadMore = () => {
    if (!user?.is_premium) {
      setShowPricing(true);
      return;
    }
    setVisibleCount(visibleCount + 9);
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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
        />

        <StockGrid
          stocks={sortedStocks} // Pass pre-processed visible stocks
          visibleCount={visibleCount}
          onLoadMore={handleLoadMore}
          loading={loading}
          error={error}
        />

        <Modal
          open={showPricing}
          onOpenChange={setShowPricing}
          title={"Premium Access"}
          className="max-w-md"
        >
          <PricingDialogContent />
        </Modal>
      </div>
    </div>
  );
};

export default RecommendationList;
