import React, { useState } from "react";
import { Search, Filter, TrendingUp, Target, DollarSign, Calendar, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1e40af", // Using a standard blue since exact brand blue wasn't found
  white: "#FFFFFF",
  gray: "#f8f9fa",
  teal: "#0d9488",
  orange: "#f59e0b",
  green: "#10b981",
  darkGreen: "#059669",
};

interface StockData {
  id: string;
  name: string;
  code: string;
  marketCap: string;
  upside: number;
  timeframe: string;
  totalReturns: number;
  returnsTimeframe: string;
  cmp: number;
  entryPrice: number;
  target1: number;
  isHot: boolean;
  sector: string;
}

const mockStockData: StockData[] = [
  {
    id: "1",
    name: "FINEOTEX CHEMICAL LTD",
    code: "FINEOTEX",
    marketCap: "₹2,788 Cr.",
    upside: 93.1,
    timeframe: "1 year, 4 months",
    totalReturns: -25.61,
    returnsTimeframe: "less than 3 months",
    cmp: 236.41,
    entryPrice: 317.8,
    target1: 456.5,
    isHot: true,
    sector: "Chemicals"
  },
  {
    id: "2",
    name: "MMR INDUSTRIES LTD",
    code: "MMR",
    marketCap: "₹704 Cr.",
    upside: 61.1,
    timeframe: "1 year, 4 months",
    totalReturns: -3.16,
    returnsTimeframe: "less than 3 months",
    cmp: 276.35,
    entryPrice: 286,
    target1: 446.16,
    isHot: true,
    sector: "Mining & Mineral products"
  },
  {
    id: "3",
    name: "RAMCO SYSTEMS LTD",
    code: "RAMCO",
    marketCap: "₹1,896 Cr.",
    upside: 23.97,
    timeframe: "1 year, 1 month",
    totalReturns: -25.49,
    returnsTimeframe: "less than 3 months",
    cmp: 407,
    entryPrice: 510.75,
    target1: 633.2,
    isHot: true,
    sector: "IT"
  },
  {
    id: "4",
    name: "TEXMACO INFRASTRUCTURE",
    code: "TEXINFRA",
    marketCap: "₹1,896 Cr.",
    upside: 117.27,
    timeframe: "1 year, 3 months",
    totalReturns: 0,
    returnsTimeframe: "less than 3 months",
    cmp: 89.5,
    entryPrice: 0,
    target1: 0,
    isHot: true,
    sector: "Infrastructure"
  },
  {
    id: "5",
    name: "INDO COUNT INDUSTRIES",
    code: "ICIL",
    marketCap: "₹1,896 Cr.",
    upside: 107.84,
    timeframe: "1 year, 3 months",
    totalReturns: 0,
    returnsTimeframe: "less than 3 months",
    cmp: 276.35,
    entryPrice: 0,
    target1: 0,
    isHot: true,
    sector: "Textiles"
  },
  {
    id: "6",
    name: "FINCABLES LIMITED",
    code: "FINCABLES",
    marketCap: "₹1,896 Cr.",
    upside: 90.07,
    timeframe: "3 months",
    totalReturns: 0,
    returnsTimeframe: "less than 3 months",
    cmp: 407,
    entryPrice: 0,
    target1: 0,
    isHot: true,
    sector: "Cables"
  }
];

const Recommendation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("upside");
  const [filterBy, setFilterBy] = useState("all");

  const filteredStocks = mockStockData.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StockCard = ({ stock }: { stock: StockData }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{stock.name}</h3>
            <p className="text-xs text-gray-500">{stock.code} • {stock.sector} • {stock.marketCap}</p>
          </div>
          {stock.isHot && (
            <Badge
              className="text-xs px-2 py-1"
              style={{ backgroundColor: COLORS.orange, color: COLORS.white }}
            >
              🔥 Hot
            </Badge>
          )}
        </div>
      </div>

      {/* Upside Section */}
      <div
        className="p-4 text-white"
        style={{ backgroundColor: COLORS.teal }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Upside left 👆</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stock.upside}%</div>
            <div className="text-xs opacity-90">likely within {stock.timeframe}</div>
          </div>
        </div>
      </div>

      {/* Total Returns */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Total Returns</span>
          <span
            className={`text-sm font-semibold ${stock.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {stock.totalReturns >= 0 ? '+' : ''}{stock.totalReturns}%
            <span className="text-xs text-gray-500">in {stock.returnsTimeframe}</span>
          </span>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-500 mb-1">CMP</div>
            <div className="font-semibold text-gray-900">₹{stock.cmp}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Entry Price 👇</div>
            <div className="font-semibold text-gray-900">₹{stock.entryPrice || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Target 1</div>
            <div className="font-semibold text-gray-900">₹{stock.target1 || '-'}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <Button
          className="w-full text-sm py-2"
          style={{ backgroundColor: COLORS.blue, borderColor: COLORS.blue }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.blue}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Reports & Details 
        </Button>
        <Button
          variant="outline"
          className="w-full text-sm py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Users className="h-4 w-4 mr-2" />
          Become a Member 
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Mainboard Stocks</h1>
          <p className="text-gray-600">Discover high-potential investment opportunities</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Stocks by Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="upside">Upside left: High to Low</option>
                <option value="name">Name</option>
                <option value="marketCap">Market Cap</option>
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
                <option value="all">Filter</option>
                <option value="hot">Hot Stocks</option>
                <option value="high-upside">High Upside</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600">Quick Filters:</span>
            <Button variant="outline" size="sm" className="text-xs">🔥 Most Recent</Button>
            <Button variant="outline" size="sm" className="text-xs">📈 Market Leadership</Button>
            <Button variant="outline" size="sm" className="text-xs">🏭 Industry Tailwind</Button>
            <Button variant="outline" size="sm" className="text-xs">💎 Value Pick</Button>
            <Button variant="outline" size="sm" className="text-xs">🔒 Moated</Button>
            <Button variant="outline" size="sm" className="text-xs">📖 Thematic Stories</Button>
            <Button variant="outline" size="sm" className="text-xs">📊 Strategy</Button>
            <Button variant="outline" size="sm" className="text-xs">🏢 Sector</Button>
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>

        {/* Load More / Pagination could go here */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="px-8 py-2"
            style={{ borderColor: COLORS.blue, color: COLORS.blue }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.blue}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Load More Stocks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
