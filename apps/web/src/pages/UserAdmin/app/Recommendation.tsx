import React, { useState, useEffect } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  fetchRecommendationsFromSheet,
  getSheetUrl,
} from "@/lib/recommendations";

/**
 * Color system (as requested)
 * - Deep Blue: #1C2852
 * - Red:      #C00000
 * - Beige:    #C4B696
 * - Light Gray:#E6E6E6
 *
 * Inline gradients are used for pixel-precision.
 */

const COLORS = {
  red: "#C00000",
  deepBlue: "#1C2852",
  beige: "#C4B696",
  lightGray: "#E6E6E6",
  white: "#FFFFFF",
  gray: "#f8f9fa",
  teal: "#0d9488",
  orange: "#f59e0b",
  green: "#d1f1d9",
  darkGreen: "#059669",
  gold: "#fef2c3",
  exited: "#9ca3af",
};

interface StockData {
  id: string;
  name: string;
  code: string;
  marketCap: string;
  upside: number;
  cmp: number;
  entryPrice: number;
  target1: number;
  sector: string;
  band: "BUY" | "HOLD" | "EXITED";
  lastUpdated: string;
}

// Hook to load sheet data (unchanged logic)
const useSheetStocks = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = getSheetUrl();
        const recs = await fetchRecommendationsFromSheet(url);
        const transformed: StockData[] = recs.map((r, idx) => ({
          id: `${idx}-${r.nseSymbol || r.companyName}`,
          name: r.companyName,
          code: r.nseSymbol || "",
          marketCap: r.latestMcapCr ? `₹${r.latestMcapCr} Cr.` : "₹0 Cr.",
          upside: Math.round(r.upsidePotential || 0),
          cmp: Math.round(r.cmpOrExitPrice || 0),
          entryPrice: Math.round(r.priceAtRecommendation || 0),
          target1: Math.round(r.targetPrice || 0),
          sector: "",
          band: (r.action?.toUpperCase() as any) || "BUY",
          lastUpdated: (r.dateRecommended || "").toString(),
        }));
        setStocks(transformed);
      } catch (e: any) {
        setError(e?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stocks, loading, error };
};

const Recommendation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);
  const { stocks: sheetStocks, loading, error } = useSheetStocks();

  // Return band color (keeps your logic, but uses chosen palette)
  const getBandColor = (band: string) => {
    switch (band) {
      case "BUY":
        return COLORS.green;
      case "HOLD":
        return COLORS.gold;
      case "EXITED":
        return COLORS.exited;
      default:
        return COLORS.lightGray;
    }
  };

  // Return text color for band pill
  const getTextColor = (band: string) => {
    switch (band) {
      case "BUY":
        return "#059669"; // Dark Green
      case "HOLD":
        return "#b8860b"; // Dark Gold
      case "EXIT":
        return "#494949"; // Dark Gray
      default:
        return "#FFFFFF";
    }
  };

  const filteredStocks = sheetStocks.filter((stock) => {
    const matchesFilter = filterBy === "All" || stock.band === filterBy;
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.band.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case "MCAP Wise":
        return (
          Number(b.marketCap.replace(/[^0-9.]/g, "")) -
          Number(a.marketCap.replace(/[^0-9.]/g, ""))
        );
      case "Newest":
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      case "Oldest":
        return (
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        );
      case "Upside Wise":
        return b.upside - a.upside;
      case "Return Wise":
        return (
          (b.target1 - b.entryPrice) / b.entryPrice -
          (a.target1 - a.entryPrice) / a.entryPrice
        );
      default:
        return 0;
    }
  });

  const visibleStocks = sortedStocks.slice(0, visibleCount);

  /**
   * STOCK CARD
   *
   * Notes:
   * - The Price Range Bar block is preserved exactly as you provided
   *   (no changes to that logic or markup).
   * - Inline gradients are used for header, logo box, and Expected Upside pill.
   * - Card corners are rounded-[20px].
   */
  const StockCard = ({ stock }: { stock: StockData }) => {
    const [cmpPosition, setCmpPosition] = useState(0);

    const barPercentage =
      stock.cmp >= stock.entryPrice
        ? Math.min(
            ((stock.cmp - stock.entryPrice) /
              (stock.target1 - stock.entryPrice)) *
              100,
            100
          )
        : Math.min(
            ((stock.entryPrice - stock.cmp) / stock.entryPrice) * 100,
            100
          );

    const barColor = stock.cmp >= stock.entryPrice ? COLORS.green : COLORS.red;

    useEffect(() => {
      const timeout = setTimeout(() => setCmpPosition(barPercentage), 100);
      return () => clearTimeout(timeout);
    }, [barPercentage]);

    return (
      <div
        className="bg-white rounded-[20px] shadow-md border overflow-hidden transform transition-shadow hover:shadow-lg"
        style={{ borderColor: COLORS.lightGray, minHeight: 260 }}
      >
        {/* ---------- Top header ---------- */}
        <div
          className="flex items-center p-4"
          style={{
            borderBottom: `1px solid ${COLORS.red}`,
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          {/* ---------- Logo Box (Gold -> Beige diagonal) ---------- */}
          <div
            className="w-16 h-16 flex items-center justify-center rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #E6E6E6 0%, #C4B696 100%)", // Gold -> Beige diagonal
              border: `1px solid rgba(0,0,0,0.04)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              color: COLORS.white,
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-sm text-xs font-semibold"
              style={{
                // Slight inner box for contrast
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
                padding: 6,
                color: COLORS.white,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              LOGO
            </div>
          </div>

          {/* ---------- Stock Details ---------- */}
          <div className="ml-4 flex-1 text-gray-900">
            <h3 className="font-semibold text-base leading-tight">{stock.name}</h3>
            <p className="text-xs text-gray-600 mt-1">
              {stock.sector} <span className="text-gray-400">|</span> MCAP:{" "}
              <span className="text-gray-800">{stock.marketCap}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Last Updated On: {stock.lastUpdated}</p>
          </div>
        </div>

        {/* ---------- Pill badges ---------- */}
        <div className="flex gap-2 p-4 flex-wrap mb-2 items-center">
          {/* Band pill (BUY/HOLD/EXITED) - solid color based on getBandColor */}
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

          {/* Expected Upside pill - Deep Blue -> Red gradient, white text */}
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

        {/* ---------- Price Range Bar and Values (Combined Card) ---------- */}
        <div className="p-4 mx-4 mb-4 rounded-lg border" style={{ backgroundColor: COLORS.lightGray, }}>
          <div className="mb-3 relative" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            <div className="relative w-full h-4 bg-gray-300 rounded-full flex items-center">
              {/* CMP >= Entry Price: Green bar left to right */}
              {stock.cmp >= stock.entryPrice && (
                <>
                  <div
                    className="h-4 rounded-full transition-all duration-500 absolute"
                    style={{
                      width: `${Math.min(
                        ((stock.cmp - stock.entryPrice) /
                          (stock.target1 - stock.entryPrice)) *
                          100,
                        100
                      )}%`,
                      backgroundColor: COLORS.darkGreen,
                      left: 0,
                    }}
                  ></div>

                  {/* Entry Price fixed below bar */}
                  <div className="absolute top-6 left-0 text-xs text-gray-500">
                    ₹{stock.entryPrice}
                  </div>

                  {/* CMP flowing above bar */}
                  <div
                    className="absolute -top-5 text-xs font-semibold text-green-700"
                    style={{
                      left: `${Math.min(
                        ((stock.cmp - stock.entryPrice) /
                          (stock.target1 - stock.entryPrice)) *
                          100,
                        100
                      )}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    CMP: ₹{stock.cmp}
                  </div>

                  {/* Target Price fixed below bar */}
                  <div className="absolute top-6 right-0 text-xs text-gray-500">
                    ₹{stock.target1}
                  </div>
                </>
              )}

              {/* CMP < Entry Price: Entry Price center, red bar flows left */}
              {stock.cmp < stock.entryPrice && (
                <>
                  {/* Red bar flows left from center */}
                  <div
                    className="h-4 rounded-full transition-all duration-500 absolute"
                    style={{
                      width: `${Math.min(
                        ((stock.entryPrice - stock.cmp) / stock.entryPrice) * 50,
                        50
                      )}%`,
                      backgroundColor: COLORS.red,
                      right: "50%",
                    }}
                  ></div>

                  {/* Entry Price fixed below bar */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                    ₹{stock.entryPrice}
                  </div>

                  {/* CMP flowing above bar */}
                  <div
                    className="absolute -top-5 text-xs font-semibold text-red-700"
                    style={{
                      left: `${50 -
                        Math.min(
                          ((stock.entryPrice - stock.cmp) / stock.entryPrice) *
                            50,
                          50
                        )
                        }%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    CMP: ₹{stock.cmp}
                  </div>

                  {/* Target Price fixed below bar */}
                  <div className="absolute top-6 right-0 text-xs text-gray-500">
                    ₹{stock.target1}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 text-sm font-medium text-gray-700">
            <div>
              <div className="text-xs text-gray-500">Entry Price</div>₹
              {stock.entryPrice}
              
            </div>
            <div>
              <div className="text-xs text-gray-500">CMP</div>₹{stock.cmp}
            </div>

            <div>
              <div className="text-xs text-gray-500">Target Price</div>₹
              {stock.target1}
            </div>
          </div>
        </div>

        {/* ---------- View Research Button (Deep Blue -> Red gradient) ---------- */}
        <div className="px-4 pb-4">
          <Link to="/user/app/view-research" state={{ stock }}>
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Recommendations</h1>
          <p className="text-gray-600">Discover high-potential investment opportunities</p>
        </div>

        {/* ---------- Search / Controls ---------- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Name, Code or Tag (BUY/HOLD/EXITED)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sorting:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MCAP Wise">MCAP Wise</option>
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Upside Wise">Upside Wise</option>
                <option value="Return Wise">Return Wise</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="BUY">BUY</option>
                <option value="HOLD">HOLD</option>
                <option value="EXITED">EXITED</option>
              </select>
            </div>
          </div>
        </div>

        {/* ---------- Cards Grid ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading &&
            !error &&
            visibleStocks.map((stock) => <StockCard key={stock.id} stock={stock} />)}
        </div>

        {/* Load More */}
        {visibleCount < sortedStocks.length && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="px-8 py-2 transition-colors duration-300"
              style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
              onClick={() => setVisibleCount(visibleCount + 9)}
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
      </div>
    </div>
  );
};

export default Recommendation;
