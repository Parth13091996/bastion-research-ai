import { COLORS, getBandColor, getProfitOrLossPercent, getTextColor, isExited } from "./utils";

// Modified BandUpsidePills to handle EXITED stocks
const BandUpsidePills =({ stock }: { stock: StockData }) => {
    const exited = isExited(stock);
    return (
      <div className="flex gap-2 p-4 flex-wrap mb-2 items-center">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: getBandColor(stock.band),
            color: getTextColor(stock.band),
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          {stock.band}
        </span>
        {exited ? (
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-semibold"
            style={{
              background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
              boxShadow: "0 1px 4px rgba(28,40,82,0.12)",
            }}
          >
            Profit or Loss: {getProfitOrLossPercent(stock)}%
          </span>
        ) : (
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-semibold"
            style={{
              background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
              boxShadow: "0 1px 4px rgba(28,40,82,0.12)",
            }}
          >
            Expected Upside: {stock.upside}%
          </span>
        )}
      </div>
    );
  }
  

  export default BandUpsidePills