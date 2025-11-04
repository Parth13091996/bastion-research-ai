import React from "react";
import { Link } from "react-router-dom";
import useSheetStocks from "@/hooks/use-sheets-stocks";

const getBandColor = (band: string) => {
  switch (band) {
    case "BUY":
      return "bg-green-100 text-green-800";
    case "HOLD":
      return "bg-yellow-100 text-yellow-800";
    case "EXITED":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const RecentRecommendations: React.FC = () => {
  const { stocks, loading, error } = useSheetStocks(true);

  const sorted = [...stocks].sort(
    (a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const latestStocks = sorted.slice(0, 3);

  if (loading)
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-gray-500">
        Loading recent recommendations...
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-red-600">
        {error}
      </div>
    );

  return (
    <div className="lg:col-span-2 bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Latest stock picks and analysis
          </p>
        </div>
        <Link
          to="/user/app/recommendation"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4 flex flex-col gap-1">
        {latestStocks.map((stock) => (
          <Link to="/user/app/view-research" key={stock.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 bg-[#1C2852] rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold`}
                >
                  {stock.code ? stock.code.slice(0, 2).toUpperCase() : "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {stock.name}
                    </span>
                    <span
                      className={`px-2 py-1 ${getBandColor(
                        stock.band
                      )} text-xs font-medium rounded self-start`}
                    >
                      {stock.band}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {stock.code || stock.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    MCAP: {stock.marketCap}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <div className="text-sm font-medium text-gray-900">
                  ₹{stock.cmp}
                </div>
                <div
                  className={`text-sm ${
                    stock.cmp >= stock.entryPrice
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stock.cmp >= stock.entryPrice ? "↑ Gain" : "↓ Loss"}
                </div>
                <div className="text-xs text-gray-500">
                  Upside: {stock.upside}%
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentRecommendations;
