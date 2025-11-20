import React, { useMemo } from "react";
import useSheetStocks from "@/hooks/use-sheets-stocks";
import { format, isValid, parseISO } from "date-fns";

type LatestUpdateItem = {
  title: string;
  description: string;
  date: string;
  company: string;
  type: "Quarterly" | "Announcement";
  pdf_url?: string;
};

const parseDate = (value: string): number => {
  if (!value) return 0;

  // Try parsing as ISO date first
  let d = parseISO(value);

  // If that fails, try standard Date constructor
  if (!isValid(d)) {
    d = new Date(value);
  }

  return isValid(d) ? d.getTime() : 0;
};

const formatDate = (value: string): string | null => {
  if (!value) return null;

  // Try parsing as ISO date first
  let d = parseISO(value);

  // If that fails, try standard Date constructor
  if (!isValid(d)) {
    d = new Date(value);
  }

  return isValid(d) ? format(d, "d MMM, yyyy") : null;
};

const LatestUpdates: React.FC = () => {
  const { stocks, loading, error } = useSheetStocks();

  const updates = useMemo<LatestUpdateItem[]>(() => {
    const items: LatestUpdateItem[] = [];
    stocks.forEach((s) => {
      const company = s.name || s.code || "";
      const quarterly = (s.quarterly_update || [])
        .slice()
        .filter((u) => formatDate(u.date) !== null) // Filter out invalid dates
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 3)
        .map((u) => ({
          title: u.title,
          description: u.description,
          date: formatDate(u.date)!,
          company,
          type: "Quarterly" as const,
          pdf_url: u.pdf_url,
        }));
      const anns = (s.announcements_and_update || [])
        .slice()
        .filter((u) => formatDate(u.date) !== null) // Filter out invalid dates
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 3)
        .map((u) => ({
          title: u.title,
          description: u.description,
          date: formatDate(u.date)!,
          company,
          type: "Announcement" as const,
          pdf_url: u.pdf_url,
        }));
      items.push(...quarterly, ...anns);
    });

    // Sort globally by date desc and limit to top 6 to keep it compact
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
      ) : (
        <div className="space-y-4 sm:space-y-5 max-h-96 overflow-y-auto">
          {updates.map((u, idx) => (
            <a
              key={`${u.company}-${u.title}-${idx}`}
              href={u.pdf_url || "#"}
              target={u.pdf_url ? "_blank" : undefined}
              rel={u.pdf_url ? "noopener noreferrer" : undefined}
              className="block border-l-4 border-gray-200 pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg"
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
            </a>
          ))}
          {updates.length === 0 && (
            <div className="text-xs text-gray-500">
              No updates available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LatestUpdates;
