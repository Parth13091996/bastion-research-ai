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

const SingleRecommendation = () => {
  const { id } = useParams<{ id: string }>();

  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");

  const rawSheetData = useSheetStocksStore((s) => s.rawSheetData);

  function mapToStock(sheetRow: any, apiRow: any) {
    return {
      id: sheetRow?.id ?? apiRow?.id,
      name:
        sheetRow?.companyName ??
        sheetRow?.name ??
        apiRow?.company_name ??
        apiRow?.name ??
        "Company Name Ltd.",
      nseSymbol: sheetRow?.nseSymbol || apiRow?.nse_symbol || undefined,
      logo: apiRow?.logo || sheetRow?.logo || undefined,

      // Dates
      dateRecommended:
        sheetRow?.dateRecommended ||
        apiRow?.dateRecommended ||
        apiRow?.created_at,
      lastUpdated: apiRow?.updated_at || sheetRow?.updated_at || undefined,
      dateExit: sheetRow?.dateExit || apiRow?.dateExit || undefined,
      holdingPeriod:
        sheetRow?.holdingPeriod || apiRow?.holdingPeriod || undefined,

      // Stock prices & targets
      entryPrice:
        sheetRow?.priceAtRecommendation ??
        sheetRow?.entryPrice ??
        apiRow?.price_at_recommendation ??
        apiRow?.priceAtRecommendation ??
        undefined,
      cmp:
        sheetRow?.cmpOrExitPrice ??
        sheetRow?.cmp ??
        apiRow?.cmpOrExitPrice ??
        apiRow?.cmp ??
        undefined,
      target1:
        sheetRow?.targetPrice ??
        sheetRow?.target1 ??
        apiRow?.targetPrice ??
        apiRow?.target1 ??
        undefined,
      // returns
      percentReturn:
        typeof sheetRow?.percentReturn !== "undefined"
          ? sheetRow?.percentReturn
          : typeof sheetRow?.percent_return !== "undefined"
            ? sheetRow?.percent_return
            : (apiRow?.percentReturn ?? apiRow?.percent_return ?? undefined),
      upside:
        // upsidePotential as percent integer, e.g. 0.47 = 47%
        typeof sheetRow?.upsidePotential !== "undefined"
          ? Math.round(sheetRow.upsidePotential * 1000) / 10
          : typeof sheetRow?.upside !== "undefined"
            ? sheetRow.upside
            : typeof apiRow?.upsidePotential !== "undefined"
              ? Math.round(apiRow.upsidePotential * 1000) / 10
              : typeof apiRow?.upside !== "undefined"
                ? apiRow.upside
                : undefined,
      band:
        sheetRow?.action ||
        sheetRow?.band ||
        apiRow?.action ||
        apiRow?.band ||
        "BUY",
      latestMcapCr: sheetRow?.latestMcapCr ?? apiRow?.latestMcapCr ?? undefined,

      // Resources, communications, news...
      business_note: apiRow?.business_note ?? undefined,
      quick_bite: apiRow?.quick_bite ?? undefined,
      video: apiRow?.video ?? undefined,
      exit_rationale: apiRow?.exit_rationale ?? undefined,
      quarterly_update: apiRow?.quarterly_update ?? [],
      announcements_and_update: apiRow?.announcements_and_update ?? [],
      // fallback: allow performance_series, if any, or static below
      performance_series:
        sheetRow?.performance_series ?? apiRow?.performance_series,
    };
  }

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

  // Fallback to static data if no performance_series available
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

  // === Dynamic Quarterly Updates & Announcements logic
  // Parse/normalize quarterly updates and announcements if present
  const quarterlyUpdates = Array.isArray(stock?.quarterly_update)
    ? stock.quarterly_update.map((item: any, idx: number) => ({
        id: idx,
        date: item.date,
        heading: item.title,
        preview: item.description,
        hasPdf: !!item.pdf_url,
        pdf_url: item.pdf_url,
      }))
    : [];

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

  // For dynamic resources
  const businessNoteAvailable = !!stock?.business_note;
  const quickBiteAvailable = !!stock?.quick_bite;
  const videoAvailable = !!stock?.video;
  const exitRationaleAvailable = !!stock?.exit_rationale;

  // Robust return/cmp/upside extraction
  // The "percentReturn" and "upside" fields may be 0.xx or in percent, normalize for view
  const entryPrice =
    typeof stock?.entryPrice !== "undefined" ? stock.entryPrice : 0;
  const cmp =
    typeof stock?.cmp !== "undefined"
      ? stock.cmp
      : typeof stock?.cmpOrExitPrice !== "undefined"
        ? stock.cmpOrExitPrice
        : 0;
  const target1 =
    typeof stock?.target1 !== "undefined"
      ? stock.target1
      : typeof stock?.targetPrice !== "undefined"
        ? stock.targetPrice
        : 0;
  // percentReturn comes in as 0.61, display as +61.0%
  const percentReturnNum =
    typeof stock?.percentReturn === "number" ? stock.percentReturn * 100 : 0;
  const percentReturn =
    typeof stock?.percentReturn === "number"
      ? (stock.percentReturn * 100).toFixed(1)
      : "0";
  const totalReturnNum = percentReturnNum;
  const totalReturnColor =
    totalReturnNum >= 0 ? "text-green-600" : "text-red-600";
  const upsideNum =
    typeof stock?.upside === "number"
      ? stock.upside
      : typeof stock?.upsidePotential === "number"
        ? Math.round(stock.upsidePotential * 1000) / 10
        : 0; // fix for possible float

  // For metrics display
  const stockMetrics = [
    {
      label: "Recommendation Date",
      value:
        stock?.dateRecommended ||
        stock?.created_at ||
        stock?.lastUpdated ||
        "N/A",
    },
    {
      label: "Recommendation Price",
      value:
        typeof entryPrice !== "undefined" && entryPrice !== null
          ? `₹${entryPrice}`
          : "₹0",
    },
    {
      label: "Target Price",
      value:
        typeof target1 !== "undefined" && target1 !== null
          ? `₹${target1}`
          : "₹0",
    },
    {
      label: "CMP",
      value: typeof cmp !== "undefined" && cmp !== null ? `₹${cmp}` : "₹0",
    },
    {
      label: "Total Return",
      value: `${totalReturnNum >= 0 ? "+" : ""}${percentReturn}%`,
      color: totalReturnColor,
    },
    {
      label: "Upside Left",
      value:
        typeof upsideNum !== "undefined" && upsideNum !== null
          ? `${upsideNum}%`
          : "0%",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg">Error: {fetchError}</div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <header className="bg-white border-b border-gray-200 shadow-sm md:sticky md:top-0 md:z-10">
            <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">
                  {stock?.name ||
                    stock?.companyName ||
                    stock?.company_name ||
                    "Company Name Ltd."}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`${getBandColor(
                    stock?.band || stock?.action || "BUY"
                  )} px-4 py-1 rounded-full text-sm shadow-sm font-medium flex items-center gap-1`}
                >
                  {stock?.band || stock?.action || "BUY"}
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
                    {/* Dynamically show 'Read Business Understanding Note' only if available */}
                    {businessNoteAvailable && (
                      <a
                        href={stock.business_note}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-4 rounded-lg font-semibold shadow-sm"
                      >
                        <FileText size={18} />
                        Read Business Understanding Note
                      </a>
                    )}
                    {/* Secondary Resources */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Quick Bite */}
                      {quickBiteAvailable && (
                        <a
                          href={stock.quick_bite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
                        >
                          <FileText size={16} />
                          Quick Bite
                        </a>
                      )}
                      {/* Watch Video */}
                      {videoAvailable && (
                        <a
                          href={stock.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
                        >
                          <Video size={16} />
                          Watch Video
                        </a>
                      )}
                      {/* Exit Rationale */}
                      {exitRationaleAvailable && (
                        <a
                          href={stock.exit_rationale}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
                        >
                          <FileText size={16} />
                          Exit Rationale
                        </a>
                      )}
                    </div>
                    {/* Show fallback if none of the dynamic resources exist */}
                    {!businessNoteAvailable &&
                      !quickBiteAvailable &&
                      !videoAvailable &&
                      !exitRationaleAvailable && (
                        <div className="text-sm text-gray-400 text-center py-6">
                          No resources available for this stock.
                        </div>
                      )}
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
                    {quarterlyUpdates.length === 0 && (
                      <div className="text-gray-400 text-center py-6 text-sm">
                        No quarterly updates yet.
                      </div>
                    )}
                    {quarterlyUpdates.map((u) => (
                      <div
                        key={u.id}
                        onClick={() =>
                          setSelectedUpdate({ ...u, updateType: "quarterly" })
                        }
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

            {/* Announcements and Updates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Important Announcements and Updates
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcements.length === 0 && (
                  <div className="col-span-full text-gray-400 text-center py-6 text-sm">
                    No announcements or updates yet.
                  </div>
                )}
                {announcements.map((u) => (
                  <div
                    key={u.id}
                    onClick={() =>
                      setSelectedUpdate({ ...u, updateType: "announcement" })
                    }
                    className="p-5 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {u.date}
                      </span>
                      {u.hasPdf && (
                        <FileText size={16} className="text-blue-600" />
                      )}
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
                  {selectedUpdate.hasPdf && selectedUpdate.pdf_url && (
                    <a
                      href={selectedUpdate.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Open PDF Document
                      <ExternalLink size={16} />
                    </a>
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
