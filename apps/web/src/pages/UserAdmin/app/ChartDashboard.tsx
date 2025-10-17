import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
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
        <span className="text-xs text-gray-300 font-medium">{label}</span>
        <span className="text-xs text-white font-semibold">{value}</span>
      </div>
      <div className="h-6 w-full bg-white/10 rounded-lg overflow-hidden flex items-center">
        <div
          className={`${color} h-full transition-all duration-1000 ease-out`}
          style={{ width: `${fillWidth}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-400">{percentage}% of {value}</span>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ label, value, subLabel, color, isUp = true }) => (
  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
    <div className="flex items-center gap-1.5 mb-2">
      {isUp ? <TrendingUp size={14} className={color} /> : <TrendingDown size={14} className={color} />}
      <span className="text-xs text-gray-300 font-medium">{label}</span>
    </div>
    <span className={`text-xl font-bold ${color}`}>{value}</span>
    {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
  </div>
);

const ChartDashboard = () => {
  const liveRecommendations = [
    { label: "High > 15%", value: 15, percentage: 34.1, color: "bg-gradient-to-l from-green-500 to-green-400" },
    { label: "Medium (-15% to 15%)", value: 18, percentage: 40.9, color: "bg-gradient-to-l from-yellow-400 to-yellow-300" },
    { label: "Low <-15%", value: 11, percentage: 25.0, color: "bg-gradient-to-l from-red-500 to-red-400" },
  ];

  const exits = [
    { label: "Profit Exits", value: 36, percentage: 100, color: "bg-gradient-to-l from-green-500 to-green-400" },
    { label: "Loss Exits", value: 0, percentage: 0, color: "bg-gradient-to-l from-red-500 to-red-400" },
  ];

  return (
    <div className="mb-8 rounded-xl bg-gradient-to-br from-[#13013d] to-[#010313] p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Every Hit. Every Miss. <span className="text-blue-300">Shared with Clarity</span>
        </h1>
        <p className="text-sm text-gray-300 font-light">Confidence is built, not borrowed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Recommendations */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">44 Live Recommendations</h2>
            </div>
            <Link to="/user/app/recommendation" className="text-xs sm:text-sm text-blue-300 font-medium hover:underline">
              3 New
            </Link>
          </div>

          <div className="rounded-xl p-4 mb-6 bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-white" />
              <span className="text-xs sm:text-sm text-white font-medium">Average Live Returns</span>
            </div>
            <span className="text-3xl font-bold text-white">10.5%</span>
          </div>

          {/* Horizontal Bars */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              {liveRecommendations.map((item, idx) => (
                <HorizontalBar key={idx} {...item} />
              ))}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-3">Performance Breakdown</p>
                <div className="space-y-3">
                  {liveRecommendations.map((item, idx) => (
                    <div className="flex justify-between items-center" key={idx}>
                      <span className="text-xs text-gray-300">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color.split(" ")[0]}`}>{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">Total Holdings</p>
                <p className="text-2xl font-bold text-white">44</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Top Gainer" value="+208.99%" subLabel="in 2yr, 4mo | Lagnam Spintex | Active" color="text-green-400" />
            <StatCard label="Top Loser" value="-46.11%" subLabel="in 9 months | Legent 2 | Active" color="text-red-400" isUp={false} />
          </div>
        </div>

        {/* Exits */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">36 Exits (past)</h2>
            </div>
            <Link to="/user/app/recommendation" className="text-xs sm:text-sm text-blue-300 font-medium hover:underline">
              3 New
            </Link>
          </div>

          <div className="rounded-xl p-4 mb-6 bg-gradient-to-r from-pink-500 to-orange-400">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-white" />
              <span className="text-xs sm:text-sm text-white font-medium">Average Exit Returns</span>
            </div>
            <span className="text-3xl font-bold text-white">62.37%</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              {exits.map((item, idx) => (
                <HorizontalBar key={idx} {...item} />
              ))}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-3">Exit Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">Success Rate</span>
                    <span className="text-sm font-bold text-green-400">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">Avg Gain</span>
                    <span className="text-sm font-bold text-green-400">+62.37%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-300">Losses</span>
                    <span className="text-sm font-bold text-red-400">0</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">Total Exits</p>
                <p className="text-2xl font-bold text-white">36</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Best Exit" value="+269.17%" subLabel="in 1yr, 6mo | Gravita India Ltd. | Inactive" color="text-green-400" />
            <StatCard label="Worst Exit" value="+0.67%" subLabel="in 1yr, 8mo | Monte Carlo Fashions | Inactive" color="text-red-400" isUp={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDashboard;
