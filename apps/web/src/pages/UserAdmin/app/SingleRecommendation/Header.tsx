import { Link } from "react-router-dom";
import { getBandColor } from "../RecommendationList/utils";
import { Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const Header = ({ stock }) => {
  const percentReturnNum = stock.percentReturn;
  const totalReturnNum = Math.round(Number(percentReturnNum));
  const entryPrice =
    typeof stock?.entryPrice !== "undefined" ? stock.entryPrice : 0;
  const cmp =
    typeof stock?.cmp !== "undefined"
      ? stock.cmp
      : typeof stock?.cmpOrExitPrice !== "undefined"
        ? stock.cmpOrExitPrice
        : 0;
  const target1 =
    typeof stock?.target1 !== "undefined"
      ? stock.target1
      : typeof stock?.targetPrice !== "undefined"
        ? stock.targetPrice
        : 0;
  const upsideNum = cmp > 0 ? Math.round(((target1 - cmp) / cmp) * 100) : 0;
  const totalReturnColor =
    totalReturnNum >= 0 ? "text-green-600" : "text-red-600";

  // For metrics display
  const stockMetrics = [
    {
      label: "Recommendation Date",
      value: stock?.dateRecommended
        ? formatDate(stock.dateRecommended)
        : stock?.created_at
          ? formatDate(stock.created_at)
          : stock?.lastUpdated
            ? formatDate(stock.lastUpdated)
            : "N/A",
    },
    {
      label: "Recommendation Price",
      value:
        typeof entryPrice !== "undefined" && entryPrice !== null
          ? `₹${entryPrice}`
          : "₹0",
    },
    {
      label: "Target Price",
      value:
        typeof target1 !== "undefined" && target1 !== null
          ? `₹${target1}`
          : "₹0",
    },
    {
      label: "CMP",
      value: typeof cmp !== "undefined" && cmp !== null ? `₹${cmp}` : "₹0",
    },
    {
      label: "Total Return",
      value: `${totalReturnNum >= 0 ? "+" : ""}${totalReturnNum}%`,
      color: totalReturnColor,
    },
    {
      label: "Upside Left",
      value:
        typeof upsideNum !== "undefined" && upsideNum !== null
          ? `${upsideNum}%`
          : "0%",
      color: "text-blue-600",
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm md:sticky md:top-0 md:z-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo Box (replicating logic from StockCard.tsx) */}
          {stock?.logo ? (
            <img
              src={stock.logo}
              alt={
                stock?.name ||
                stock?.companyName ||
                stock?.company_name ||
                "Logo"
              }
              className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-md"
            />
          ) : (
            <div
              className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-md text-xs font-semibold"
              style={{
                background: "#f3f4f6",
                color: "#374151",
                border: `1px solid #e5e7eb`,
              }}
            >
              LOGO
            </div>
          )}
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mr-5">
              {stock?.name ||
                stock?.companyName ||
                stock?.company_name ||
                "Company Name Ltd."}
            </h1>

            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`${getBandColor(
              stock?.band || stock?.action || "BUY"
            )} px-4 py-1 rounded-full text-sm shadow-sm font-medium flex items-center gap-1`}
          >
            {stock?.band || stock?.action || "BUY"}
          </button>
          <Link
            to="/contact-us"
            className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm shadow-sm font-medium inline-block text-center"
          >
            Raise a Query
          </Link>
        </div>
      </div>

      {/* METRICS */}
      <div className="max-w-7xl mx-auto px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {stockMetrics.map((m, i) => (
          <div
            key={i}
            className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center hover:bg-gray-100 transition"
          >
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p
              className={`text-sm font-semibold ${m.color || "text-gray-900"}`}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
};

export default Header;
