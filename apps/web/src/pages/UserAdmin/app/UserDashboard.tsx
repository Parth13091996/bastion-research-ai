import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Crown,
  Shield,
} from "lucide-react";
import ChartDashboard from "./ChartDashboard";

const UserDashboard = () => {
  const user = {
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    email: "john@example.com",
    role: "investor",
    created_at: "2023-01-15"
  };

  const subscription = { is_premium: true };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name + " " + user?.last_name}!
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {subscription?.is_premium ? (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Premium Member</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">No Active Plan</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {user?.first_name?.[0] || user?.username?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {user?.email}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Member since</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  Jan 15, 2023
                </p>
                <button className="mt-1 sm:mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base inline-block text-center">
                  Renew Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <ChartDashboard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Recent Recommendations
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Latest stock picks and analysis
                </p>
              </div>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
                View All →
              </button>
            </div>

            {/* Stock Recommendations */}
            <div className="space-y-3 sm:space-y-4">
              {/* NVDA */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold">
                    NV
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        NVDA
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded self-start">
                        STRONG BUY
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      NVIDIA Corporation
                    </div>
                    <div className="text-xs text-gray-500">Sarah Chen</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">
                    $180.00
                  </div>
                  <div className="text-sm text-green-600">↗ +11.1%</div>
                  <div className="text-xs text-gray-500">⚠ Medium Risk</div>
                </div>
              </div>

              {/* TSLA */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold">
                    TS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        TSLA
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded self-start">
                        BUY
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Tesla, Inc.
                    </div>
                    <div className="text-xs text-gray-500">
                      Michael Rodriguez
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">
                    $520.00
                  </div>
                  <div className="text-sm text-green-600">↗ +8.0%</div>
                  <div className="text-xs text-red-500">⚠ High Risk</div>
                </div>
              </div>

              {/* CRWD */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold">
                    CR
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        CRWD
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded self-start">
                        BUY
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      CrowdStrike Holdings
                    </div>
                    <div className="text-xs text-gray-500">David Park</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">
                    $195.00
                  </div>
                  <div className="text-sm text-green-600">↗ +10.1%</div>
                  <div className="text-xs text-gray-500">⚠ Medium Risk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Updates */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Latest Updates
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Recent market insights
                </p>
              </div>
            </div>

            {/* Updates */}
            <div className="space-y-4 sm:space-y-6 max-h-96 overflow-y-auto">
              {/* NVIDIA Update */}
              <a
                href="#"
                className="block border-l-4 border-red-200 pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    NVIDIA Earnings Beat: Raising Price Target
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  Earnings Alert
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Exceptional earnings beat indicates our AI infrastructure
                  thesis - raising price target to $180
                </p>
                <div className="text-xs text-gray-500">Jan 15 • Sarah Chen</div>
              </a>

              {/* Market Update */}
              <a
                href="#"
                className="block border-l-4 border-yellow-200 pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Market Update: Tech Rotation Continues
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  Market Commentary
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Quality tech outperformance continues - maintain overweight in
                  our core holdings
                </p>
                <div className="text-xs text-gray-500">
                  Jan 12 • Research Team
                </div>
              </a>

              {/* CrowdStrike Update */}
              <a
                href="#"
                className="block border-l-4 border-yellow-200 pl-3 sm:pl-4 hover:bg-gray-50 transition rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    CrowdStrike: New Enterprise Wins Accelerating
                  </span>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2 inline-block">
                  Stock Update
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Strong enterprise momentum supports our bullish thesis
                </p>
                <div className="text-xs text-gray-500">
                  Jan 10 • Analyst Team
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
