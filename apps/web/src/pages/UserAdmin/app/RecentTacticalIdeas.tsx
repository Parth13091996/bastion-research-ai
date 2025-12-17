import PricingDialogModal from "@/components/core/common/Modals/PricingDialogModal";
import useTacticalIdeas from "@/hooks/use-tactical-ideas";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatIndianNumber } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";

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

const tiers: Record<string, string[]> = {
  freemium: ["freemium"],
  core: ["freemium", "core"],
  core_annual: ["freemium", "core", "core_annual"],
  research_hub: ["freemium", "core", "core_annual", "research_hub"],
};

const RecentTacticalIdeas: React.FC = () => {
  const { ideas: stocks, loading, error } = useTacticalIdeas();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const { data: subscription } = useSubscription();

  const userPlanCode =
    subscription?.currentPlan || user?.membership_plans?.plan_code || "freemium";
  const currentTier = tiers[userPlanCode] ?? tiers["freemium"];
  const isPremiumUser = !!subscription?.is_premium;

  const accessibleStocks =
    (stocks || []).filter((stock) => {
      const tags = stock?.tags ? stock?.tags : "freemium";
      return Array.isArray(currentTier) && currentTier.includes(tags);
    }) || [];

  const sorted = [...accessibleStocks].sort(
    (a, b) =>
      new Date(b.dateRecommended ?? 0).getTime() -
      new Date(a.dateRecommended ?? 0).getTime()
  );

  const latestAccessibleStocks = sorted.slice(0, 3);

  if (loading)
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-gray-500">
        Loading recent tactical ideas...
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-red-600">
        {error}
      </div>
    );

  return (
    <div className="lg:col-span-3 bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Tactical Ideas
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Short-term opportunities with defined stop loss
          </p>
        </div>
        <Link
          to="/user/app/tactical-ideas"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
          onClick={(e) => {
            if (!isPremiumUser) {
              e.preventDefault();
              setShowPricing(true);
            }
          }}
        >
          View All 
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4 flex flex-col gap-1">
        {latestAccessibleStocks.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No accessible tactical ideas for your current plan yet.
          </div>
        ) : (
          latestAccessibleStocks.map((stock) => {
            const tags = stock?.tags ? stock?.tags : "freemium";
            const hasAccess =
              Array.isArray(currentTier) && currentTier.includes(tags);

            return (
              <div
                key={stock.id}
                className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3 overflow-hidden"
              >
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
                    <div className="text-xs text-gray-500 mt-1 flex gap-3">
                      <span>
                        Entry: ?
                        {formatIndianNumber(Number(stock.entryPrice ?? 0))}
                      </span>
                      <span>
                        CMP: ?
                        {formatIndianNumber(Number(stock.cmp ?? 0))}
                      </span>
                      {stock.stopLoss != null && (
                        <span>
                          SL: ?
                          {formatIndianNumber(Number(stock.stopLoss ?? 0))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <div className="text-sm font-medium text-gray-900">
                    ?{formatIndianNumber(Number(stock.cmp ?? 0))}
                  </div>
                  <div
                    className={`text-sm ${
                      Number(stock.cmp ?? 0) >= Number(stock.entryPrice ?? 0)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(stock.cmp ?? 0) >= Number(stock.entryPrice ?? 0)
                      ? " Gain"
                      : " Loss"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Upside: {stock.upside}%
                  </div>
                </div>

                {!hasAccess && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700 z-10">
                    Upgrade your plan to view this idea
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <PricingDialogModal
        showPricing={showPricing}
        setShowPricing={setShowPricing}
      />
    </div>
  );
};

export default RecentTacticalIdeas;

