import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TrendingUp,
  FileText,
  Video,
  ExternalLink,
  X,
  Bell,
  ClipboardList,
  Building2,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ViewResearch = () => {
  const location = useLocation();
  const stock = location.state?.stock;

  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");

  // Helper function to parse "MMM-YY" date strings into Date objects
  const parseDate = (dateStr: string) => {
    const [month, year] = dateStr.split("-");
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(month);
    return new Date(2000 + parseInt(year), monthIndex, 1);
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case "BUY":
        return "bg-green-100 text-green-700";
      case "HOLD":
        return "bg-yellow-100 text-yellow-700";
      case "EXITED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Simulated data for 6 months
  const allData = [
    { date: "Jan-24", stock: 100, bse500: 100 },
    { date: "Feb-24", stock: 105, bse500: 102 },
    { date: "Mar-24", stock: 110, bse500: 104 },
    { date: "Apr-24", stock: 115, bse500: 106 },
    { date: "May-24", stock: 125, bse500: 108 },
    { date: "Jun-24", stock: 135, bse500: 110 },
    { date: "Jul-24", stock: 140, bse500: 113 },
    { date: "Aug-24", stock: 150, bse500: 115 },
    { date: "Sep-24", stock: 155, bse500: 118 },
    { date: "Oct-24", stock: 160, bse500: 120 },
  ];

  // Function to filter data based on time range
  const getFilteredData = () => {
    const now = new Date("2024-10-01");
    let cutoff: Date;
    switch (timeRange) {
      case "1M":
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
      case "3M":
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case "1Y":
        cutoff = new Date(now);
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      default:
        return allData;
    }
    return allData.filter((d) => parseDate(d.date) >= cutoff);
  };

  const updates = [
    {
      id: 1,
      date: "15 Sep 2024",
      heading: "Q2 FY24 Results Analysis",
      preview:
        "Strong revenue growth of 24% YoY driven by increased demand in domestic markets. EBITDA margins improved by 180 bps...",
      hasPdf: true,
    },
    {
      id: 2,
      date: "10 Aug 2024",
      heading: "Management Commentary Update",
      preview:
        "Management remains optimistic about H2 outlook. Capacity expansion on track for Q3 completion...",
      hasPdf: true,
    },
    {
      id: 3,
      date: "05 Jul 2024",
      heading: "Industry Tailwinds Analysis",
      preview:
        "Sector showing strong momentum with government policy support. Key beneficiaries identified...",
      hasPdf: false,
    },
  ];

  const totalReturn = stock
    ? (((stock.cmp - stock.entryPrice) / stock.entryPrice) * 100).toFixed(1)
    : "0";
  const totalReturnNum = parseFloat(totalReturn);
  const totalReturnColor =
    totalReturnNum >= 0 ? "text-green-600" : "text-red-600";

  const stockMetrics = [
    { label: "Recommendation Date", value: stock?.lastUpdated || "N/A" },
    {
      label: "Recommendation Price",
      value: stock ? `₹${stock.entryPrice}` : "₹0",
    },
    { label: "Target Price", value: stock ? `₹${stock.target1}` : "₹0" },
    { label: "CMP", value: stock ? `₹${stock.cmp}` : "₹0" },
    {
      label: "Total Return",
      value: `${totalReturnNum >= 0 ? "+" : ""}${totalReturn}%`,
      color: totalReturnColor,
    },
    {
      label: "Upside Left",
      value: stock ? `${stock.upside}%` : "0%",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 shadow-sm md:sticky md:top-0 md:z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">
              {stock?.name || "Company Name Ltd."}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={`${getBandColor(stock?.band || "BUY")} px-4 py-1 rounded-full text-sm shadow-sm font-medium flex items-center gap-1`}
            >
              {stock?.band || "BUY"}
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

      {/* BODY */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* CHART + RESOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Stock Performance vs BSE 500
                </h2>
                <p className="text-sm text-gray-500">Since 12 Jan 2024</p>
              </div>
              <div className="flex gap-2">
                {["1M", "3M", "1Y", "ALL"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs rounded-full border shadow-sm ${
                      timeRange === range
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Stock"
                  dot={{ fill: "#2563eb", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="bse500"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="BSE 500"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resources + Quarterly Updates */}
          <div className="space-y-6">
            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resources
              </h3>
              <div className="space-y-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-4 rounded-lg font-semibold shadow-sm"
                >
                  <FileText size={18} />
                  Read Business Understanding Note
                </a>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Quick Bite",
                      color: "purple",
                      icon: <FileText size={16} />,
                    },
                    {
                      label: "Watch Video",
                      color: "red",
                      icon: <Video size={16} />,
                    },
                    {
                      label: "Exit Rationale",
                      color: "orange",
                      icon: <FileText size={16} />,
                    },
                  ].map((btn) => {
                    if (btn.label === "Watch Video") {
                      return (
                        <a
                          key={btn.label}
                          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1 bg-${btn.color}-50 hover:bg-${btn.color}-100 text-${btn.color}-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition`}
                        >
                          {btn.icon}
                          {btn.label}
                        </a>
                      );
                    } else {
                      return (
                        <a
                          key={btn.label}
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1 bg-${btn.color}-50 hover:bg-${btn.color}-100 text-${btn.color}-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition`}
                        >
                          {btn.icon}
                          {btn.label}
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            {/* Quarterly Updates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Quarterly Updates
                </h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {updates.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUpdate(u)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-200 shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {u.date}
                      </span>
                      {u.hasPdf && (
                        <FileText size={14} className="text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                      {u.heading}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {u.preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Important Announcements and Updates
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {updates.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUpdate(u)}
                className="p-5 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                    {u.date}
                  </span>
                  {u.hasPdf && <FileText size={16} className="text-blue-600" />}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {u.heading}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {u.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  {selectedUpdate.date}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUpdate.heading}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">{selectedUpdate.preview}</p>
              {selectedUpdate.hasPdf && (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FileText size={18} />
                  Open PDF Document
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResearch;
