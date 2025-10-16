import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1e40af",
  white: "#FFFFFF",
  gray: "#f8f9fa",
  teal: "#0d9488",
  orange: "#f59e0b",
  green: "#10b981",
  darkGreen: "#059669",
  hold: "#fbbf24",
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
const normalizeNumber = (v: any): number => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const s = String(v).replace(/[,₹\s]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const coerceBand = (v: any): "BUY" | "HOLD" | "EXITED" => {
  const s = String(v || "").toUpperCase();
  if (s === "BUY" || s === "HOLD" || s === "EXITED") return s;
  return "BUY";
};

const mapRowToStock = (row: any, idx: number): StockData => {
  // Attempt to map common header variants
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (row[k] !== undefined) return row[k];
    }
    return "";
  };
  return {
    id: String(get("id", "ID", "Id") || idx + 1),
    name: String(get("name", "Name", "Stock", "Stock Name") || ""),
    code: String(get("code", "Code", "Ticker", "Symbol") || ""),
    marketCap: String(get("marketCap", "MarketCap", "Market Cap") || ""),
    upside: normalizeNumber(get("upside", "Upside", "Expected Upside")),
    cmp: normalizeNumber(get("cmp", "CMP", "Current Price", "Price")),
    entryPrice: normalizeNumber(get("entryPrice", "Entry", "Entry Price")),
    target1: normalizeNumber(get("target1", "Target", "Target1", "Target Price")),
    sector: String(get("sector", "Sector") || ""),
    band: coerceBand(get("band", "Band", "Status", "Recommendation")),
    lastUpdated: String(get("lastUpdated", "Updated", "Last Updated") || ""),
  };
};

const Recommendation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [rows, setRows] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(endpoints.recommendations);
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((r, i) => mapRowToStock(r, i));
        setRows(mapped);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getBandColor = (band: string) => {
    switch (band) {
      case "BUY":
        return COLORS.green;
      case "HOLD":
        return COLORS.hold;
      case "EXITED":
        return COLORS.exited;
      default:
        return COLORS.gray;
    }
  };

  const getProgressWidth = (cmp: number, entry: number, target: number) => {
    if (!target || !cmp) return "0%";
    const progress = ((cmp - entry) / (target - entry)) * 100;
    return `${Math.min(Math.max(progress, 0), 100)}%`;
  };

  // Filter logic
  const filteredStocks = useMemo(() => rows.filter(
    (stock) =>
      (filterBy === "All" || stock.band === filterBy) &&
      (stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [rows, filterBy, searchTerm]);

  const StockCard = ({ stock }: { stock: StockData }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Top Section */}
      <div className="flex p-4 border-b border-gray-100">
        {/* Left Image */}
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
          Open Idea
        </div>

        {/* Details */}
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{stock.name}</h3>
          <p className="text-xs text-gray-600">
            {stock.sector} | MCAP: {stock.marketCap}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last Updated On: {stock.lastUpdated}
          </p>
        </div>
      </div>

      {/* Band Section */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: getBandColor(stock.band),
          color: COLORS.white,
        }}
      >
        <div className="text-base font-semibold">{stock.band}</div>
        <div className="text-base font-semibold">
          Expected Upside: {stock.upside}%
        </div>
      </div>

      {/* Price Section */}
      <div className="p-4">
        <div className="grid grid-cols-3 text-sm font-medium text-gray-700 mb-3">
          <div>
            <div className="text-xs text-gray-500">CMP</div>₹{stock.cmp}
          </div>
          <div>
            <div className="text-xs text-gray-500">Entry Price</div>₹
            {stock.entryPrice}
          </div>
          <div>
            <div className="text-xs text-gray-500">Target Price</div>₹
            {stock.target1}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="h-2 rounded-full"
            style={{
              width: getProgressWidth(
                stock.cmp,
                stock.entryPrice,
                stock.target1
              ),
              backgroundColor: getBandColor(stock.band),
            }}
          ></div>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 pb-4">
        <Link to="/user/app/view-research">
          <Button
            variant="outline"
            className="w-full text-sm py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Research
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            All Recommendations
          </h1>
          <p className="text-gray-600">
            Discover high-potential investment opportunities
          </p>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading recommendations...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Stocks by Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 w-full"
              />
            </div>
          </div>

          {/* Sorting and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {/* Sorting */}
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

            {/* Filter */}
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

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="px-8 py-2 transition-colors duration-300"
            style={{ borderColor: COLORS.blue, color: COLORS.blue }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.blue;
              e.currentTarget.style.color = COLORS.white;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = COLORS.blue;
            }}
          >
            Load More Stocks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
