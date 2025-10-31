import { getRecommendationById } from "@/api/recommendations-apis";
import {
  Bell,
  Building2,
  ClipboardList,
  ExternalLink,
  FileText,
  Video,
  X,
} from "lucide-react";
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
import { useSheetStocksStore } from "@/stores/recommendation-store";
import Header from "./Header";
import { mapToStock } from "./utils";
import { parseDate } from "pdf-lib";
import ResourcesQuarterly from "./ResourcesQuarterly";
import AnnouncementsUpdates from "./AnnouncementsUpdates";

const SingleRecommendation = () => {
  const { id } = useParams<{ id: string }>();
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");
  const rawSheetData = useSheetStocksStore((s) => s.rawSheetData);

  useEffect(() => {
    if (!id) {
      setFetchError("Invalid recommendation id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    getRecommendationById(id)
      .then((data) => {
        // Try to find the relevant Sheet row by matching id or fallback to company_name if present in data
        let sheetRow: any = null;
        if (id) {
          sheetRow =
            rawSheetData.find(
              (row: any, idx: number) =>
                `${idx}-${row.nseSymbol || row.companyName}` === id
            ) ||
            (data && (data.company_name || data.name)
              ? rawSheetData.find(
                  (row: any) =>
                    row.companyName?.toLowerCase() ===
                    (data.company_name?.toLowerCase() ||
                      data.name?.toLowerCase())
                )
              : null);
        }
        // Build normalized stock
        let normalizedStock = mapToStock(sheetRow, data);
        setStock(normalizedStock);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message || "An error occurred.");
        setLoading(false);
        setStock(null);
      });
  }, [id, rawSheetData]);

  // Helper function to parse "MMM-YY" date strings into Date objects

  const allData =
    stock && Array.isArray(stock.performance_series)
      ? stock.performance_series
      : [
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

  const announcements = Array.isArray(stock?.announcements_and_update)
    ? stock.announcements_and_update.map((item: any, idx: number) => ({
        id: idx,
        date: item.date,
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
