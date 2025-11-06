import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLink, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AnnouncementsUpdates from "./AnnouncementsUpdates";
import Header from "./Header";
import ResourcesQuarterly from "./ResourcesQuarterly";
import {
  fetchSingleRecommendationGraphSheetData,
  parseDate,
  type PBRow,
} from "./utils";
import { getRecommendationByCompanySymbol } from "@/api/recommendations-apis";

function actionToNumeric(action: string | null | undefined): number | null {
  if (!action) return null;
  const val = action.toLowerCase();
  if (val === "buy") return 1;
  if (val === "sell") return -1;
  if (val === "hold") return 0;
  return null;
}

function formatMonthYear(dateStr: string) {
  const dailyMatch = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dailyMatch) {
    return `${dailyMatch[2]} ${dailyMatch[3]}`;
  }
  const monthYearMatch = dateStr.match(/^([A-Za-z]{3})-(\d{2})$/);
  if (monthYearMatch) {
    const year = parseInt(monthYearMatch[2], 10);
    return `${monthYearMatch[1]} 20${year < 50 ? ("0" + year).slice(-2) : year}`; // e.g., "Mar 2024"
  }
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (isoMatch) {
    const dt = new Date(dateStr);
    const mths = [
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
    ];
    return `${mths[dt.getMonth()]} ${dt.getFullYear()}`;
  }
  return dateStr;
}

const SingleRecommendation = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");
  const { stocks, loading } = useSheetStocks(true);
  const [externalRows, setExternalRows] = useState<PBRow[] | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!symbol) {
      setFetchError("invalid recommendation symbol.");
      return;
    }
    setFetchError(null);
    getRecommendationByCompanySymbol(symbol).then((response) => {
      setStock({ ...response, ...stocks.find((r) => r.code === symbol) });
    });
  }, [symbol, stocks]);

  useEffect(() => {
    let cancelled = false;
    fetchSingleRecommendationGraphSheetData(
      stock?.stock_performance_url as string
    )
      .then((rows) => {
        if (!cancelled) setExternalRows(rows);
      })
      .catch(() => {
        if (!cancelled) setExternalRows(null);
      });
    return () => {
      cancelled = true;
    };
  }, [stock?.nseSymbol, stock?.name]);

  const parseAnyDate = (d: string) => {
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(d)) {
      const dt = new Date(d);
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }
    return parseDate(d);
  };

  function getGraphData(): Array<{
    date: string;
    "Stock NAV": number | null;
    "Index NAV": number | null;
    Action: number | null;
    actualDate: string;
  }> {
    if (externalRows && externalRows.length) {
      const first = externalRows[0] || {};
      const dateKey = Object.keys(first).find(
        (k) => k.toLowerCase() === "date"
      );
      const stockNavKey = Object.keys(first).find(
        (k) => k.replace(/\s/g, "").toLowerCase() === "stocknav"
      );
      const indexNavKey = Object.keys(first).find(
        (k) => k.replace(/\s/g, "").toLowerCase() === "indexnav"
      );
      const actionKey = Object.keys(first).find(
        (k) => k.toLowerCase() === "action"
      );
      //@ts-ignore
      return externalRows.map(
        (
          row
        ): {
          date: string;
          "Stock NAV": number | null;
          "Index NAV": number | null;
          Action: number | null;
        } => {
          const dateVal = dateKey ? (row[dateKey] as string) : "";
          let stockNavVal =
            stockNavKey && typeof row[stockNavKey] !== "undefined"
              ? Number(row[stockNavKey])
              : null;
          if (Number.isNaN(stockNavVal)) stockNavVal = null;
          let indexNavVal =
            indexNavKey && typeof row[indexNavKey] !== "undefined"
              ? Number(row[indexNavKey])
              : null;
          if (Number.isNaN(indexNavVal)) indexNavVal = null;
          let action = actionKey ? row[actionKey] : null;

          return {
            date: formatMonthYear(dateVal),
            "Stock NAV": stockNavVal,
            "Index NAV": indexNavVal,
            Action: actionToNumeric(action as string),
            //@ts-ignore
            actualDate: dateVal,
          };
        }
      );
    }
    return [
      {
        date: "Jan 2024",
        "Stock NAV": 92,
        "Index NAV": 80,
        Action: 1,
        actualDate: String(new Date()),
      },
      {
        date: "Feb 2024",
        "Stock NAV": 96,
        "Index NAV": 95,
        Action: 1,
        actualDate: String(new Date()),
      },
      {
        date: "Mar 2024",
        "Stock NAV": 100,
        "Index NAV": 100,
        Action: 1,
        actualDate: String(new Date()),
      },
    ];
  }

  const allData = getGraphData();

  // Function to filter data based on time range
  const getFilteredData = () => {
    let cutoff: Date;
    switch (timeRange) {
      case "1M":
        cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
      case "3M":
        cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case "1Y":
        cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      default:
        return allData;
    }
    return allData.filter((d: any) => parseAnyDate(d.actualDate) >= cutoff);
  };

  const announcements = Array.isArray(stock?.announcements_and_update)
    ? stock.announcements_and_update.map((item: any, idx: number) => ({
        id: idx,
        date: formatMonthYear(item.date),
        heading: item.title,
        preview: item.description,
        hasPdf: !!item.pdf_url,
        pdf_url: item.pdf_url,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg">Error: {fetchError}</div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Header stock={stock} />

          {/* BODY */}
          <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Index NAV, Stock NAV
                    </h2>
                    <p className="text-sm text-gray-500">Since Jan 2024</p>
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

                <div className={isMobile ? "overflow-x-auto" : "overflow-hidden"}>
                  <LineChart width={550} height={400} data={getFilteredData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" yAxisId="left" />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "Action") {
                          if (value === 1) return ["BUY", "Action"];
                          if (value === 0) return ["HOLD", "Action"];
                          if (value === -1) return ["SELL", "Action"];
                          return [value, "Action"];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Stock NAV"
                      stroke="#2563eb"
                      strokeWidth={1}
                      name={`${stock?.name || stock?.nseSymbol || "Stock"} NAV`}
                      dot={false}
                      yAxisId="left"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="Index NAV"
                      stroke="#10b981"
                      strokeWidth={1}
                      name="Index NAV"
                      dot={false}
                      yAxisId="left"
                      connectNulls
                    />
                  </LineChart>
                </div>
              </div>

              {/* Resources + Quarterly Updates */}
              <ResourcesQuarterly
                stock={stock}
                setSelectedUpdate={setSelectedUpdate}
              />
            </div>

            {/* Announcements and Updates */}
            <AnnouncementsUpdates
              announcements={announcements}
              setSelectedUpdate={setSelectedUpdate}
            />
          </main>

          {/* MODAL */}
          {selectedUpdate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">
                      {formatMonthYear(selectedUpdate.date)}
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
                  {selectedUpdate.hasPdf && selectedUpdate.pdf_url && (
                    <Link
                      to="/user/app/pdf-viewer"
                      state={{ url: selectedUpdate.pdf_url }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Open PDF Document
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  {selectedUpdate.hasPdf && !selectedUpdate.pdf_url && (
                    <span className="block text-sm text-gray-400 mt-2">
                      PDF is not available for this update.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SingleRecommendation;
