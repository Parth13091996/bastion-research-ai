import {
  fetchRecommendationsFromSheet,
  getSheetUrl,
} from "@/lib/recommendations";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Reusable Horizontal Bar Component
const HorizontalBar = ({ label, value, percentage, color }) => {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setFillWidth(percentage), 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-300 font-medium responsive-text">{label}</span>
        <span className="text-xs text-white font-semibold responsive-text">{value}</span>
      </div>
      <div className="h-6 w-full bg-white/10 rounded-lg overflow-hidden flex items-center responsive-bar">
        <div
          className={`${color} h-full transition-all duration-1000 ease-out`}
          style={{ width: `${fillWidth}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-400 responsive-text">
        {percentage}% of {value}
      </span>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ label, value, subLabel, color, isUp = true }) => (
  <div className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10 responsive-card">
    <div className="flex items-center gap-1.5 mb-2">
      {isUp ? (
        <TrendingUp size={14} className={`${color} responsive-icon`} />
      ) : (
        <TrendingDown size={14} className={`${color} responsive-icon`} />
      )}
      <span className="text-xs text-gray-300 font-medium responsive-text">{label}</span>
    </div>
    <span className={`text-lg sm:text-xl font-bold ${color} responsive-value`}>{value}</span>
    {subLabel && <p className="text-xs text-gray-400 mt-0.5 responsive-subtext">{subLabel}</p>}
  </div>
);

// Helper to map API array with objects to structured state
function mapDashboardData(data) {
  // Extract values by label
  const getVal = (label) => data.find((d) => d.label === label)?.value;
  // Grab period/company info if present
  const getExtra = (label) => data.find((d) => d.label === label);

  const liveCount = Number(getVal("Live Recommendation")) || 0;
  const exitCount = Number(getVal("Exits (Past)")) || 0;

  // For the bar charts
  const liveHigh = Number(getVal("High > 15%")) || 0;
  const liveMed = Number(getVal("Medium (-15% to 15%)")) || 0;
  const liveLow = Number(getVal("Low <-15%")) || 0;

  const exitsProfit = Number(getVal("Profit Exits")) || 0;
  const exitsLoss = Number(getVal("Loss Exits")) || 0;

  // Live stat percentages
  const livePerc = (cnt) =>
    liveCount ? Math.round((cnt / liveCount) * 1000) / 10 : 0;
  const exitPerc = (cnt) =>
    exitCount ? Math.round((cnt / exitCount) * 1000) / 10 : 0;

  // Get gainer, loser, exit/best
  const tgVal = Number(getVal("Top Gainer")) || 0;
  const tlVal = Number(getVal("Top Loser")) || 0;
  const topGainerText = tgVal ? `+${(tgVal * 100).toFixed(2)}%` : "+0.00%";
  const topLoserText = tlVal ? `${(tlVal * 100).toFixed(2)}%` : "0.00%";
  const topGainerSub = [
    getVal("Time period held") && getVal("Stock with Top Gainer")
      ? `in ${getVal("Time period held")} | ${getVal("Stock with Top Gainer")} | Active`
      : "",
  ][0];
  const topLoserSub = [
    getVal("Time period held") && getVal("Stock with worst loser")
      ? `in ${getVal("Time period held")} | ${getVal("Stock with worst loser")} | Active`
      : "",
  ][0];

  // Exits
  const bestExitVal = Number(getVal("Best Exits")) || 0;
  const worstExitVal = Number(getVal("Worst Exit")) || 0;
  const avgExitReturnVal = Number(getVal("Average Exit Return")) || 0;
  // Substitute for best/worst period/names if present
  const bestExitSub = [
    getVal("Time period held") && getVal("Stock with best exit")
      ? `in ${getVal("Time period held")} | ${getVal("Stock with best exit")} | Inactive`
      : "",
  ][0];
  const worstExitSub = [
    getVal("Time period held") && getVal("Stock with Worst exit")
      ? `in ${getVal("Time period held")} | ${getVal("Stock with Worst exit")} | Inactive`
      : "",
  ][0];

  // No proper mapping for success rate in this data, mark as N/A
  return {
    liveStats: [
      {
        label: "High > 15%",
        value: liveHigh,
        percentage: livePerc(liveHigh),
        color: "bg-gradient-to-l from-green-500 to-green-400",
      },
      {
        label: "Medium (-15% to 15%)",
        value: liveMed,
        percentage: livePerc(liveMed),
        color: "bg-gradient-to-l from-yellow-400 to-yellow-300",
      },
      {
        label: "Low <-15%",
        value: liveLow,
        percentage: livePerc(liveLow),
        color: "bg-gradient-to-l from-red-500 to-red-400",
      },
    ],
    exitsStats: [
      {
        label: "Profit Exits",
        value: exitsProfit,
        percentage: exitPerc(exitsProfit),
        color: "bg-gradient-to-l from-green-500 to-green-400",
      },
      {
        label: "Loss Exits",
        value: exitsLoss,
        percentage: exitPerc(exitsLoss),
        color: "bg-gradient-to-l from-red-500 to-red-400",
      },
    ],
    totals: {
      liveCount,
      exitCount,
      avgLiveReturn: Number(getVal("Average Live Returns %"))
        ? getVal("Average Live Returns %") * 100
        : 0,
      avgExitReturn: avgExitReturnVal * 100,
      successRate: exitCount ? (exitsProfit / exitCount) * 100 : 0,
      topGainerText,
      topLoserText,
      topGainerSub,
      topLoserSub,
      bestExitText: bestExitVal
        ? `+${(bestExitVal * 100).toFixed(2)}%`
        : "+0.00%",
      bestExitSub,
      worstExitText: worstExitVal
        ? `${(worstExitVal * 100).toFixed(2)}%`
        : "0.00%",
      worstExitSub,
    },
  };
}

const ChartDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveStats, setLiveStats] = useState([
    {
      label: "High > 15%",
      value: 0,
      percentage: 0,
      color: "bg-gradient-to-l from-green-500 to-green-400",
    },
    {
      label: "Medium (-15% to 15%)",
      value: 0,
      percentage: 0,
      color: "bg-gradient-to-l from-yellow-400 to-yellow-300",
    },
    {
      label: "Low <-15%",
      value: 0,
      percentage: 0,
      color: "bg-gradient-to-l from-red-500 to-red-400",
    },
  ]);
  const [exitsStats, setExitsStats] = useState([
    {
      label: "Profit Exits",
      value: 0,
      percentage: 0,
      color: "bg-gradient-to-l from-green-500 to-green-400",
    },
    {
      label: "Loss Exits",
      value: 0,
      percentage: 0,
      color: "bg-gradient-to-l from-red-500 to-red-400",
    },
  ]);

  const [totals, setTotals] = useState({
    liveCount: 0,
    exitCount: 0,
    avgLiveReturn: 0,
    avgExitReturn: 0,
    successRate: 0,
    topGainerText: "",
    topLoserText: "",
    topGainerSub: "",
    topLoserSub: "",
    bestExitText: "",
    bestExitSub: "",
    worstExitText: "",
    worstExitSub: "",
  });

  useEffect(() => {
    (async () => {
      try {
        // Only fetch once, this just fetches one sheet (LIVE) in the backend, even for EXITS
        const url = await getSheetUrl("live");
        // API returns a flat list of objects, not recs as array per stock
        const dashboardData = await fetchRecommendationsFromSheet(url, "live");
        // If data is not an array, error
        if (!Array.isArray(dashboardData)) {
          setError("Data not in expected array format");
          setLoading(false);
          return;
        }
        // Map the data to our dashboard state
        const {
          liveStats: ls,
          exitsStats: es,
          totals: t,
        } = mapDashboardData(dashboardData);
        setLiveStats(ls);
        setExitsStats(es);
        setTotals(t);
      } catch (e: any) {
        setError(e?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-16">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-16">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl bg-gradient-to-br from-[#13013d] to-[#010313] p-4 sm:p-6 lg:p-8 responsive-container">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight responsive-heading">
          Every Hit. Every Miss.{" "}
          <span className="text-blue-300">Shared with Clarity</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light responsive-subheading">
          Confidence is built, not borrowed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Live Recommendations */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-lg responsive-panel">
          <div className="flex flex-col sm:flex-row items-left justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse responsive-dot"></div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white responsive-panel-title">
                {totals.liveCount} Live Recommendations
              </h2>
            </div>
            <Link
              to="/user/app/recommendation"
              className="text-xs sm:text-sm text-blue-300 font-medium hover:underline responsive-link ml-4"
            >
              3 New
            </Link>
          </div>

          <div className="rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 responsive-metric-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-white responsive-icon" />
              <span className="text-xs sm:text-sm text-white font-medium responsive-text">
                Average Live Returns
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-white responsive-metric-value">
              {isNaN(Number(totals.avgLiveReturn))
                ? "0.0"
                : Number(totals.avgLiveReturn).toFixed(1)}
              %
            </span>
          </div>

          {/* Horizontal Bars */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div>
              {liveStats.map((item, idx) => (
                <HorizontalBar key={idx} {...item} />
              ))}
            </div>

            <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/10 flex flex-col justify-between responsive-summary-card">
              <div>
                <p className="text-xs text-white mb-3 responsive-text">Performance Breakdown</p>
                <div className="space-y-2 lg:space-y-3">
                  {liveStats.map((item, idx) => (
                    <div
                      className="flex justify-between items-center"
                      key={idx}
                    >
                      <span className="text-xs text-gray-400 responsive-text">
                        {item.label}
                      </span>
                      <span className={`text-sm font-bold text-gray-400 responsive-value`}>
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 lg:mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 responsive-text">Total Holdings</p>
                <p className="text-xl lg:text-2xl font-bold text-white responsive-total-value">
                  {totals.liveCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3">
            <StatCard
              label="Top Gainer"
              value={totals.topGainerText || "+0.00%"}
              subLabel={totals.topGainerSub}
              color="text-green-400"
            />
            <StatCard
              label="Top Loser"
              value={totals.topLoserText || "0.00%"}
              subLabel={totals.topLoserSub}
              color="text-red-400"
              isUp={false}
            />
          </div>
        </div>

        {/* Exits */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-lg responsive-panel flex flex-col">
          <div className="flex flex-col sm:flex-row items-left justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse responsive-dot"></div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white responsive-panel-title">
                {totals.exitCount} Exits (past)
              </h2>
            </div>
            <Link
              to="/user/app/recommendation"
              className="text-xs sm:text-sm text-blue-300 font-medium hover:underline responsive-link ml-4"
            >
              3 New
            </Link>
          </div>

          <div className="rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 bg-gradient-to-r from-pink-500 to-orange-400 responsive-metric-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-white responsive-icon" />
              <span className="text-xs sm:text-sm text-white font-medium responsive-text">
                Average Exit Returns
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-white responsive-metric-value">
              {isNaN(Number(totals.avgExitReturn))
                ? "0.0"
                : Number(totals.avgExitReturn).toFixed(2)}
              %
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="flex flex-col h-full">
              {exitsStats.map((item, idx) => (
                <HorizontalBar key={idx} {...item} />
              ))}
            </div>

            <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/10 flex flex-col justify-between h-full mt-auto">
              <div className="flex-grow">
                <p className="text-xs text-gray-400 mb-3 responsive-text">Exit Summary</p>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300 responsive-text">Success Rate</span>
                    <span className="text-sm font-bold text-green-400 responsive-value">
                      {isNaN(Number(totals.successRate))
                        ? "0%"
                        : `${Number(totals.successRate).toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300 responsive-text">Avg Gain</span>
                    <span className="text-sm font-bold text-green-400 responsive-value">
                      {isNaN(Number(totals.avgExitReturn))
                        ? "+0.00%"
                        : `+${Number(totals.avgExitReturn).toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300 responsive-text">Losses</span>
                    <span className="text-sm font-bold text-red-400 responsive-value">
                      {exitsStats[1]?.value ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 lg:mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 responsive-text">Total Exits</p>
                <p className="text-xl lg:text-2xl font-bold text-white responsive-total-value">
                  {totals.exitCount}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3 mt-auto">
            <StatCard
              label="Best Exit"
              value={totals.bestExitText || "+0.00%"}
              subLabel={totals.bestExitSub}
              color="text-green-400"
            />
            <StatCard
              label="Worst Exit"
              value={totals.worstExitText || "0.00%"}
              subLabel={totals.worstExitSub}
              color="text-red-400"
              isUp={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboard;