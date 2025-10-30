import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useState } from "react";
import RecommendationsControls from "./Controls";
import StockGrid from "./StockGrid";
import { COLORS } from "./utils";

const RecommendationList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const { stocks: sheetStocks, loading, error } = useSheetStocks();

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
        return b.upside - a.upside;
      case "Return Wise":
        return (
          (b.target1 - b.entryPrice) / b.entryPrice -
          (a.target1 - a.entryPrice) / a.entryPrice
        );
      default:
        return 0;
    }
  });

  const handleLoadMore = () => setVisibleCount(visibleCount + 9);

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
      </div>
    </div>
  );
};

export default RecommendationList;
