import Modal from "@/components/core/Modal";
import { useAuth } from "@/contexts/AuthContext";
import useTacticalIdeas from "@/hooks/use-tactical-ideas";
import { useState } from "react";
import RecommendationsControls from "../RecommendationList/Controls";
import TacticalStockGrid from "./StockGrid";
import { COLORS } from "../RecommendationList/utils";
import { User } from "@repo/types";
import { useSubscription } from "@/hooks/use-subscription";

const PricingDialogContent = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
    <p className="text-sm text-gray-600">
      Access all Tactical Ideas and premium research by subscribing to Bastion
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
  if (normalized === "exited") return "exit";
  if (normalized === "exit") return "exit";
  return normalized;
};

const prioritizeFreemium = <T extends { tags?: string }>(
  stocks: T[],
  user: User
) => {
  if (user?.role !== "free_subscriber") return stocks;
  const freemium: T[] = [];
  const others: T[] = [];
  for (const stock of stocks) {
    if (normalizeText(stock.tags) === "freemium") {
      freemium.push(stock);
    } else {
      others.push(stock);
    }
  }
  return [...freemium, ...others];
};

const TacticalIdeasList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const { ideas: stocks, loading, error } = useTacticalIdeas();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const { data: subscription } = useSubscription();

  const filteredStocks = (stocks || []).filter((stock) => {
    const matchesFilter =
      filterBy === "All" ||
      normalizeText(stock.band) === normalizeText(filterBy);
    const matchesSearch =
      (stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (stock.code?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (stock.band?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    return matchesFilter && matchesSearch;
  });

  const sortedStocks = (() => {
    if (sortBy === "Upside Wise") {
      const nonExit = filteredStocks.filter(
        (stk) => normalizeText(stk.band) !== "exit"
      );
      const exit = filteredStocks.filter(
        (stk) => normalizeText(stk.band) === "exit"
      );
      nonExit.sort((a, b) => Number(b.upside ?? 0) - Number(a.upside ?? 0));
      return [...nonExit, ...exit];
    }
    return [...filteredStocks].sort((a, b) => {
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
  })();

  const prioritizedStocks = prioritizeFreemium(sortedStocks, user);

  const handleLoadMore = () => {
    if (!subscription?.is_premium) {
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
            Tactical Ideas
          </h1>
          <p className="text-gray-600">
            Explore tactical opportunities with defined entry, CMP and stop
            loss.
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

        <TacticalStockGrid
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

export default TacticalIdeasList;

