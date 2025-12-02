import Modal from "@/components/core/Modal";
import { useAuth } from "@/contexts/AuthContext";
import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useState } from "react";
import RecommendationsControls from "./Controls";
import StockGrid from "./StockGrid";
import { COLORS } from "./utils";
import { User } from "@repo/types";

const PricingDialogContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
    <p className="text-sm text-gray-600">
      Access all recommendations and premium research by subscribing to Bastion
      Research Core.
    </p>
    <a
      href="/user/app/account/subscription"
      className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#c00000] text-white hover:bg-white border border-blue-900 hover:text-[#c00000] w-full"
    >
      View Plans / Subscribe
    </a>
  </div>
);

const normalizeText = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized === "exited" ? "exit" : normalized;
};

const prioritizeFreemium = <T extends { tags?: string }>(
  stocks: T[],
  user: User
) => {
  const freemium: T[] = [];
  const others: T[] = [];

  if (user?.role !== "free_subscriber") {
    return stocks;
  }

  stocks.forEach((stock) => {
    if (normalizeText(stock.tags) === "freemium") {
      freemium.push(stock);
    } else {
      others.push(stock);
    }
  });

  return [...freemium, ...others];
};

const RecommendationList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const { stocks, loading, error } = useSheetStocks();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const filteredStocks = (stocks || []).filter((stock) => {
    const matchesFilter =
      filterBy === "All" ||
      normalizeText(stock.band) === normalizeText(filterBy);
    const matchesSearch =
      (stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (stock.band?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case "MCAP Wise":
        return Number(b.marketCap ?? "0") - Number(a.marketCap ?? "0");
      case "Newest":
        return (
          new Date(b.dateRecommended ?? 0).getTime() -
          new Date(a.dateRecommended ?? 0).getTime()
        );
      case "Oldest":
        return (
          new Date(a.dateRecommended ?? 0).getTime() -
          new Date(b.dateRecommended ?? 0).getTime()
        );
      case "Upside Wise":
        return Number(b.upside ?? 0) - Number(a.upside ?? 0);
      case "Return Wise": {
        const getNumericPercentReturn = (val: any) => {
          if (val === undefined || val === null) return 0;
          if (typeof val === "string") {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
          }
          if (typeof val === "number") return val;
          return 0;
        };
        const aReturn = getNumericPercentReturn(a.percentReturn);
        const bReturn = getNumericPercentReturn(b.percentReturn);
        return bReturn - aReturn;
      }
      default:
        return 0;
    }
  });

  const prioritizedStocks = prioritizeFreemium(sortedStocks, user);

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
          stocks={prioritizedStocks ?? []}
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
