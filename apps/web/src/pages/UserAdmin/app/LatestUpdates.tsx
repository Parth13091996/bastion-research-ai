import React, { useMemo, useState } from "react";
import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import PricingDialogModal from "@/components/core/common/Modals/PricingDialogModal";

// Copied from RecentRecommendations.tsx
const tiers: Record<string, string[]> = {
  freemium: ["freemium"],
  core: ["freemium", "core"],
  core_annual: ["freemium", "core", "core_annual"],
  research_hub: ["freemium", "core", "core_annual", "research_hub"],
};

type LatestUpdateItem = {
  title: string;
  description: string;
  date: string;
  company: string;
  tag: string | undefined; // For access control
  type: "Quarterly" | "Announcement";
  pdf_url?: string;
};

const parseDate = (value: string): number => {
  // Try common formats; fallback to Date.parse
  const d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const safeFormatDate = (dateInput: string): string => {
  const dateObj = new Date(dateInput);
  if (!dateInput || isNaN(dateObj.getTime())) {
    return "(Invalid Date)";
  }
  return format(dateObj, "d MMM, yyyy");
};

const LatestUpdates: React.FC = () => {
  const { stocks, loading, error } = useSheetStocks();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);

  const userPlanCode = user?.membership_plans?.plan_code || "freemium";
  const currentTier = tiers[userPlanCode] ?? tiers["freemium"];

  const updates = useMemo<LatestUpdateItem[]>(() => {
    if (!stocks || !Array.isArray(stocks)) return [];
    const items: LatestUpdateItem[] = [];

    stocks.forEach((s) => {
      const company = s.name || s.code || "";
      const tag = s.tags;

      const quarterly = (s.quarterly_update || [])
        .slice()
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 3)
        .map((u) => ({
          title: u.title,
          description: u.description,
          date: safeFormatDate(u.date),
          company,
          tag,
          type: "Quarterly" as const,
          pdf_url: u.pdf_url,
        }));

      const anns = (s.announcements_and_update || [])
        .slice()
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 3)
        .map((u) => ({
          title: u.title,
          description: u.description,
          date: safeFormatDate(u.date),
          company,
          tag,
          type: "Announcement" as const,
          pdf_url: u.pdf_url,
        }));

      items.push(...quarterly, ...anns);
    });

    return items
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .slice(0, 6);
  }, [stocks]);

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Latest Updates
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Top updates across recommendations
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading updates...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : updates.length === 0 ? (
        <div className="text-xs text-gray-500">No updates available yet.</div>
      ) : (
        <div className="space-y-4 sm:space-y-5 max-h-96 overflow-y-auto">
          {updates.map((u, idx) => {
            // Access check: tag in currentTier array (like in RecentRecommendations)
            const hasAccess =
              Array.isArray(currentTier) &&
              u.tag &&
              currentTier.includes(u.tag);

            return (
              <div key={`${u.company}-${u.title}-${idx}`} className="relative">
                <a
                  href={hasAccess && u.pdf_url ? u.pdf_url : "#"}
                  target={hasAccess && u.pdf_url ? "_blank" : undefined}
                  rel={
                    hasAccess && u.pdf_url ? "noopener noreferrer" : undefined
                  }
                  className="block border-l-4 border-gray-200 pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg"
                  onClick={(e) => {
                    if (!hasAccess) {
                      e.preventDefault();
                      setShowPricing(true);
                    }
                  }}
                >
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {u.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {u.type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {u.company}
                    </span>
                    <span className="text-gray-500">{u.date}</span>
                  </div>

                  {u.description && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {u.description}
                    </p>
                  )}

                  {!hasAccess && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700 z-10">
                      Upgrade your plan to view this update
                    </div>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      )}

      <PricingDialogModal
        showPricing={showPricing}
        setShowPricing={setShowPricing}
      />
    </div>
  );
};

export default LatestUpdates;
