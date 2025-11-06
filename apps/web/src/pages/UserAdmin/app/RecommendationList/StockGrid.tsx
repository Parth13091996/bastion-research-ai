import { Button } from "@/components/ui/button";
import StockCard from "./StockCard";
import { COLORS } from "./utils";

const StockGrid = ({
  stocks,
  visibleCount,
  onLoadMore,
  loading,
  error,
}: StockGridProps) => {
  const sortedStocks = [...stocks].sort((a, b) => {
    return (
      Number(b.marketCap.replace(/[^0-9.]/g, "")) -
      Number(a.marketCap.replace(/[^0-9.]/g, ""))
    );
  });

  const visibleStocks = sortedStocks.slice(0, visibleCount);

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
            <StockCard key={stock.id} stock={stock} />
          ))}
      </div>

      {/* Load More */}
      {visibleCount < sortedStocks.length && (
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
            Load More Stocks
          </Button>
        </div>
      )}
    </>
  );
};

export default StockGrid;
