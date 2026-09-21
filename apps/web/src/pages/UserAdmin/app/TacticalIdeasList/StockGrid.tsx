import { Button } from "@/components/ui/button";
import { COLORS } from "../RecommendationList/utils";
import TacticalStockCard from "./StockCard";

const TacticalStockGrid = ({
  error,
  stocks,
  loading,
  visibleCount,
  onLoadMore,
}: StockGridProps) => {
  const visibleStocks = stocks.slice(0, visibleCount);

  return (
    <>
      {loading && (
        <div className="mt-5 gap-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error && <div className="text-red-600">{error}</div>}
        {!loading &&
          !error &&
          visibleStocks.map((stock) => (
            <TacticalStockCard key={stock.id} stock={stock} />
          ))}
      </div>

      {visibleCount < stocks.length && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="px-8 py-2 transition-colors duration-300"
            style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
            onClick={onLoadMore}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.deepBlue;
              e.currentTarget.style.color = COLORS.white;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = COLORS.deepBlue;
            }}
          >
            Load More Ideas
          </Button>
        </div>
      )}
    </>
  );
};

export default TacticalStockGrid;

