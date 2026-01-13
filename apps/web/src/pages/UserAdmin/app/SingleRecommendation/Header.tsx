import { Link } from "react-router-dom";
import { getBandColor, getTextColor } from "../RecommendationList/utils";
import { formatDate } from "@/lib/utils";
import { formatIndianNumber } from "@/utils";

const Header = ({ stock, selectedPerformanceIndex }) => {
  // Defensive checks
  if (!stock || typeof stock !== "object") {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm md:sticky md:top-0 md:z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500">
          Loading...
        </div>
      </header>
    );
  }

  // Extract selected performance item if present
  let performance = null;
  if (
    Array.isArray(stock.stock_performance_url) &&
    typeof selectedPerformanceIndex === "number" &&
    stock.stock_performance_url.length > selectedPerformanceIndex &&
    stock.stock_performance_url[selectedPerformanceIndex]
  ) {
    performance = stock.stock_performance_url[selectedPerformanceIndex];
  }

  // Use performance values if they exist, else fallback to stock
  const recommendationDate =
    performance?.recommendation_date && typeof performance.recommendation_date === "string" && performance.recommendation_date.length > 0
      ? formatDate(performance.recommendation_date)
      : stock?.dateRecommended && typeof stock.dateRecommended === "string"
      ? formatDate(stock.dateRecommended)
      : stock?.created_at && typeof stock.created_at === "string"
      ? formatDate(stock.created_at)
      : stock?.lastUpdated && typeof stock.lastUpdated === "string"
      ? formatDate(stock.lastUpdated)
      : "N/A";

  const recommendationPrice =
    performance?.recommendation_price && performance.recommendation_price.length > 0 && !isNaN(Number(performance.recommendation_price))
      ? `₹${formatIndianNumber(Number(performance.recommendation_price))}`
      : typeof stock?.entryPrice !== "undefined" && stock.entryPrice !== null && !isNaN(Number(stock.entryPrice))
      ? `₹${formatIndianNumber(Number(stock.entryPrice))}`
      : "₹0";

  const exitPrice =
    performance?.exit_price && performance.exit_price.length > 0 && !isNaN(Number(performance.exit_price))
      ? `₹${formatIndianNumber(Number(performance.exit_price))}`
      : typeof stock?.cmpOrExitPrice !== "undefined" && stock.cmpOrExitPrice !== null && !isNaN(Number(stock.cmpOrExitPrice))
      ? `₹${formatIndianNumber(Number(stock.cmpOrExitPrice))}`
      : typeof stock?.cmp !== "undefined" && stock.cmp !== null && !isNaN(Number(stock.cmp))
      ? `₹${formatIndianNumber(Number(stock.cmp))}`
      : "₹0";

  // Exit date: Try performance.exit_date, else stock.dateExit
  const exitDate =
    performance?.exit_date && typeof performance.exit_date === "string" && performance.exit_date.length > 0
      ? formatDate(performance.exit_date)
      : stock?.dateExit && typeof stock.dateExit === "string"
      ? formatDate(stock.dateExit)
      : "N/A";

  // Holding period as plain text, do not parse, and do not add "days" (may be "2 years", "3 quarters", etc.)
  const holdingPeriod =
    performance?.holding_period && performance.holding_period.length > 0
      ? performance.holding_period
      : typeof stock?.holdingPeriod === "string"
      ? stock.holdingPeriod
      : typeof stock?.holdingPeriod === "number"
      ? String(stock.holdingPeriod)
      : "N/A";

  // Total return as plain text, do not parse; handle as string if present, else fallback, else "N/A"
  const totalReturn =
    performance?.total_return && performance.total_return !== ""
      ? performance.total_return
      : typeof stock?.percentReturn === "string" && stock.percentReturn !== ""
      ? stock.percentReturn
      : typeof stock?.percentReturn !== "undefined" && stock.percentReturn !== null
      ? String(stock.percentReturn)
      : "N/A";

  // Use color for totalReturn if it appears to be negative (contains -), otherwise use green if it's a number >=0, else text-gray-900
  let totalReturnColor = "text-gray-900";
  if (
    typeof totalReturn === "string" &&
    totalReturn.trim().length > 0
  ) {
    if (totalReturn.trim().startsWith('-')) {
      totalReturnColor = "text-red-600";
    } else if (!isNaN(Number(totalReturn))) {
      totalReturnColor =
        Number(totalReturn) >= 0 ? "text-green-600" : "text-red-600";
    }
  }

  // Exit status
  const isExit =
    (typeof stock.status === "string" &&
      stock.status.trim().toUpperCase() === "EXIT") ||
    (typeof stock.band === "string" &&
      stock.band.trim().toUpperCase() === "EXIT") ||
    (typeof stock.action === "string" &&
      stock.action.trim().toUpperCase() === "EXIT") ||
    performance?.is_active === false ||
    (!!performance?.exit_price && performance.exit_price.length > 0);

  // Metrics: Show all exit related info from selected performance if available.
  const stockMetrics = isExit
    ? [
        {
          label: "Recommendation Date",
          value: recommendationDate
        },
        {
          label: "Recommendation Price",
          value: recommendationPrice
        },
        {
          label: "Exit Price",
          value: exitPrice
        },
        {
          label: "Exit Date",
          value: exitDate
        },
        {
          label: "Holding Period",
          value: holdingPeriod ? holdingPeriod : "N/A"
        },
        {
          label: "Total Return",
          value: totalReturn,
          color: totalReturnColor
        }
      ]
    : [
        {
          label: "Recommendation Date",
          value: recommendationDate
        },
        {
          label: "Recommendation Price",
          value: recommendationPrice
        },
        {
          label: "Target Price",
          value:
            typeof stock?.target1 !== "undefined" && stock.target1 !== null && !isNaN(Number(stock.target1))
              ? `₹${formatIndianNumber(Number(stock.target1))}`
              : typeof stock?.targetPrice !== "undefined" && stock.targetPrice !== null && !isNaN(Number(stock.targetPrice))
              ? `₹${formatIndianNumber(Number(stock.targetPrice))}`
              : "₹0"
        },
        {
          label: "CMP",
          value:
            typeof stock?.cmp !== "undefined" && stock.cmp !== null && !isNaN(Number(stock.cmp))
              ? `₹${formatIndianNumber(Number(stock.cmp))}`
              : "₹0"
        },
        {
          label: "Total Return",
          value: totalReturn,
          color: totalReturnColor
        },
        {
          label: "Upside Left",
          value:
            typeof stock?.cmp === "number" && stock.cmp > 0 &&
            typeof stock?.target1 === "number"
              ? `${Math.round(((stock.target1 - stock.cmp) / stock.cmp) * 100)}%`
              : "0%",
          color: "text-blue-600"
        }
      ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm md:sticky md:top-0 md:z-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-left gap-4 md:gap-0">
        <div className="flex items-center gap-4 order-2 md:order-1">
          {/* Logo Box */}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">
              {stock?.name ||
                stock?.companyName ||
                stock?.company_name ||
                "Company Name Ltd."}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 order-1 md:order-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 md:gap-2 px-1 md:px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Go Back
          </button>
          <button
            style={{
              backgroundColor: getBandColor(
                stock?.band || stock?.action || "BUY"
              ),
              color: getTextColor(stock?.band || stock?.action || "BUY"),
            }}
            className="px-2 md:px-4 py-1 rounded-full text-xs md:text-sm shadow-sm font-medium flex items-center gap-1"
          >
            {stock?.band || stock?.action || "BUY"}
          </button>
          <Link
            to="/contact-us"
            className="bg-blue-100 text-blue-700 px-2 md:px-4 py-1 rounded-full text-xs md:text-sm shadow-sm font-medium inline-block text-center"
          >
            Raise a Query
          </Link>
        </div>
      </div>

      {/* METRICS */}
      <div
        className={`max-w-7xl mx-auto px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4`}
      >
        {Array.isArray(stockMetrics) &&
          stockMetrics.map((m, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center hover:bg-gray-100 transition"
            >
              <p className="text-xs text-gray-500 mb-1">{m.label ?? ""}</p>
              <p className={`text-sm font-semibold ${m.color || "text-gray-900"}`}>
                {m.value ?? "N/A"}
              </p>
            </div>
          ))}
      </div>
    </header>
  );
};

export default Header;
