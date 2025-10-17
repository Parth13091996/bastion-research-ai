import React, { useState, useEffect } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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

// Dummy Data
const generateDummyStocks = (): StockData[] => {
  const sectors = ["IT", "Finance", "Chemicals", "Healthcare", "Energy"];
  const bands: StockData["band"][] = ["BUY", "HOLD", "EXITED"];
  const stocks: StockData[] = [];

  for (let i = 1; i <= 30; i++) {
    const band = bands[Math.floor(Math.random() * bands.length)];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const cmp = Math.floor(Math.random() * 500) + 50;
    const entryPrice = Math.floor(Math.random() * 100) + (cmp - 60);
    const target1 = cmp + Math.floor(Math.random() * 200);
    stocks.push({
      id: i.toString(),
      name: `Stock Company ${i}`,
      code: `STK${i}`,
      marketCap: `₹${Math.floor(Math.random() * 5000 + 100)} Cr.`,
      upside: Math.floor(Math.random() * 100),
      cmp,
      entryPrice,
      target1,
      sector,
      band,
      lastUpdated: new Date(
        2025,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString().split("T")[0],
    });
  }
  return stocks;
};

const mockStockData = generateDummyStocks();

const Recommendation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("MCAP Wise");
  const [filterBy, setFilterBy] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);

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

  const filteredStocks = mockStockData.filter((stock) => {
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
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "Oldest":
        return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
      case "Upside Wise":
        return b.upside - a.upside;
      case "Return Wise":
        return (b.target1 - b.entryPrice) / b.entryPrice -
          (a.target1 - a.entryPrice) / a.entryPrice;
      default:
        return 0;
    }
  });

  const visibleStocks = sortedStocks.slice(0, visibleCount);

  const StockCard = ({ stock }: { stock: StockData }) => {
    const [cmpPosition, setCmpPosition] = useState(0);

    const barPercentage =
      stock.cmp >= stock.entryPrice
        ? Math.min(
          ((stock.cmp - stock.entryPrice) / (stock.target1 - stock.entryPrice)) * 100,
          100
        )
        : Math.min(((stock.entryPrice - stock.cmp) / stock.entryPrice) * 100, 100);

    const barColor = stock.cmp >= stock.entryPrice ? COLORS.green : COLORS.red;

    useEffect(() => {
      const timeout = setTimeout(() => setCmpPosition(barPercentage), 100);
      return () => clearTimeout(timeout);
    }, [barPercentage]);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex p-4 border-b border-red-700 bg-red-[#C00000]">
          <div className="w-16 h-16 bg-blue-200 rounded-md border border-blue-900 flex items-center justify-center text-xs text-blue-500">
            LOGO
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">{stock.name}</h3>
            <p className="text-xs text-gray-600">
              {stock.sector} | MCAP: {stock.marketCap}
            </p>
            <p className="text-xs text-gray-400 mt-1">Last Updated On: {stock.lastUpdated}</p>
          </div>
        </div>

        {/* Pill badges */}
        <div className="flex gap-2 p-4 flex-wrap mb-2">
          <span
            className="px-3 py-1 rounded-full text-white text-s font-semibold"
            style={{ backgroundColor: getBandColor(stock.band) }}
          >
            {stock.band}
          </span>
          <span
            className="px-3 py-1 rounded-full text-white text-s font-semibold ml-auto"
            style={{ backgroundColor: COLORS.blue }}
          >
            Expected Upside: {stock.upside}%
          </span>
        </div>
        {/* Price Range Bar */}
        {/* Price Range Bar */}
<div className="mb-3 relative px-4">
  <div className="relative w-full h-4 bg-gray-200 rounded-full flex items-center">
    {/* CMP >= Entry Price: Green bar left to right */}
    {stock.cmp >= stock.entryPrice && (
      <>
        <div
          className="h-4 rounded-full transition-all duration-500 absolute"
          style={{
            width: `${Math.min(
              ((stock.cmp - stock.entryPrice) / (stock.target1 - stock.entryPrice)) * 100,
              100
            )}%`,
            backgroundColor: COLORS.green,
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
              ((stock.cmp - stock.entryPrice) / (stock.target1 - stock.entryPrice)) * 100,
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
            left: `${50 - Math.min(
              ((stock.entryPrice - stock.cmp) / stock.entryPrice) * 50,
              50
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
  </div>
</div>

        <div className="p-4">
          <div className="grid grid-cols-3 text-sm font-medium text-gray-700 mb-3">
            <div>
              <div className="text-xs text-gray-500">Entry Price</div>₹{stock.entryPrice}
            </div>
            <div>
              <div className="text-xs text-gray-500">CMP</div>₹{stock.cmp}
            </div>

            <div>
              <div className="text-xs text-gray-500">Target Price</div>₹{stock.target1}
            </div>
          </div>
        </div>

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
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.gray }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Recommendations</h1>
          <p className="text-gray-600">Discover high-potential investment opportunities</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleStocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>

        {visibleCount < sortedStocks.length && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="px-8 py-2 transition-colors duration-300"
              style={{ borderColor: COLORS.blue, color: COLORS.blue }}
              onClick={() => setVisibleCount(visibleCount + 9)}
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
        )}
      </div>
    </div>
  );
};

export default Recommendation;
