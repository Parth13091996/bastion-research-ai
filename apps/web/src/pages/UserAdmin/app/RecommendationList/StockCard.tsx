import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { COLORS, getBandColor, getTextColor } from "./utils";
import { userCompanyAnalytics } from "@/api/recommendations-apis";
import { useAuth } from "@/contexts/AuthContext";

const StockCard = ({ stock }: { stock: StockData }) => {
  const { user } = useAuth();

  // Percent when CMP > Entry
  const gainPercent = Math.min(
    ((stock.cmp - stock.entryPrice) / (stock.target1 - stock.entryPrice)) * 100,
    100
  );

  // Percent when CMP < Entry
  const lossPercent = Math.min(
    ((stock.entryPrice - stock.cmp) / stock.entryPrice) * 100,
    100
  );

  return (
    <div
      className="bg-white rounded-[20px] shadow-md border overflow-hidden transform transition-shadow hover:shadow-lg"
      style={{ borderColor: COLORS.lightGray, minHeight: 260 }}
    >
      {/* Header */}
      <div
        className="flex items-center p-4"
        style={{
          borderBottom: `1px solid ${COLORS.red}`,
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        {stock.logo ? (
          <img
            src={stock.logo}
            alt={stock.name}
            className="w-16 h-16 object-contain rounded-md"
          />
        ) : (
          <div
            className="w-16 h-16 flex items-center justify-center rounded-md text-xs font-semibold"
            style={{
              background: "#f3f4f6",
              color: COLORS.grayDark,
              border: `1px solid ${COLORS.lightGray}`,
            }}
          >
            LOGO
          </div>
        )}

        <div className="ml-4 flex-1 text-gray-900">
          <h3 className="font-semibold text-base leading-tight">
            {stock.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {stock.sector} <span className="text-gray-400">|</span> MCAP:
            <span className="text-gray-800"> {stock.marketCap}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last Updated On: {stock.lastUpdated}
          </p>
        </div>
      </div>

      {/* Band & Upside Pills */}
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

        <span
          className="px-3 py-1 rounded-full text-white text-xs font-semibold"
          style={{
            background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
            boxShadow: "0 1px 4px rgba(28,40,82,0.12)",
          }}
        >
          Expected Upside: {stock.upside}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="p-4 mx-4 mb-4 rounded-lg border" style={{ backgroundColor: COLORS.lightGray }}>
        <div className="mb-3 relative" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
          <div className="relative w-full h-4 bg-gray-300 rounded-full flex items-center">

            {/* -------- CMP > ENTRY -------- */}
            {stock.cmp >= stock.entryPrice && (
              <>
                {/* Green filled bar */}
                <div
                  className="h-4 rounded-full transition-all duration-500 absolute"
                  style={{
                    width: `${gainPercent}%`,
                    backgroundColor: COLORS.darkGreen,
                    left: 0,
                  }}
                ></div>

                {/* Entry Price (left) */}
                <div className="absolute top-6 left-0 flex flex-col text-xs text-gray-500">
                  <span className="flex flex-col items-center justify-center">
                    <span>₹{stock.entryPrice}</span>
                    <span>Entry Price</span>
                  </span>
                </div>

                {/* CMP on bar */}
                <div
                  className="absolute -top-8 text-xs font-semibold text-green-700"
                  style={{
                    left: `${gainPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="flex flex-col items-center justify-center">
                    <span>CMP</span>
                    <span>₹{stock.cmp}</span>
                  </span>
                </div>

                {/* Target Price (right) */}
                <div className="absolute top-6 right-0 flex flex-col text-xs text-gray-500">
                  <span className="flex flex-col items-center justify-center">
                    <span>₹{stock.target1}</span>
                    <span>Target Price</span>
                  </span>
                </div>
              </>
            )}

            {/* -------- CMP < ENTRY -------- */}
            {stock.cmp < stock.entryPrice && (
              <>
                {/* Red filled bar */}
                <div
                  className="h-4 rounded-l-full rounded-r-none transition-all duration-500 absolute"
                  style={{
                    width: `${lossPercent}%`,
                    backgroundColor: COLORS.red,
                    left: 0,
                  }}
                ></div>

                {/* CMP at start of red bar */}
                <div
                  className="absolute -top-8 text-xs font-semibold text-red-700"
                  style={{
                    left: "0%",
                    transform: "translateX(0)",
                  }}
                >
                  <span className="flex flex-col items-center justify-center">
                    <span>CMP</span>
                    <span>₹{stock.cmp}</span>
                  </span>
                </div>

                {/* Entry Price at end of red bar */}
                <div
                  className="absolute top-6 text-xs text-gray-500"
                  style={{
                    left: `${lossPercent}%`,
                    transform: "translateX(-60%)",
                  }}
                >
                  <span className="flex flex-col items-center justify-center">
                    <span>₹{stock.entryPrice}</span>
                    <span>Entry Price</span>
                  </span>
                </div>

                {/* Target Price fixed right */}
                <div className="absolute top-6 right-0 flex flex-col text-xs text-gray-500">
                  <span className="flex flex-col items-center justify-center">
                    <span>₹{stock.target1}</span>
                    <span>Target Price</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Research Button */}
      <div className="px-4 pb-4">
        <Link
          to={`/user/app/view-research/${stock.code}`}
          onClick={() => {
            userCompanyAnalytics(stock.code, user?.id);
          }}
        >
          <Button
            variant="outline"
            className="w-full text-sm py-2 font-semibold relative overflow-hidden"
            style={{
              borderColor: COLORS.lightGray,
              color: COLORS.white,
              background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
              boxShadow: "0 6px 18px rgba(28,40,82,0.06)",
              borderRadius: 8,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = "0 10px 26px rgba(28,40,82,0.12)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = "0 6px 18px rgba(28,40,82,0.06)";
            }}
          >
            <Eye className="h-4 w-4 mr-2 inline-block" />
            View Research
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StockCard;
