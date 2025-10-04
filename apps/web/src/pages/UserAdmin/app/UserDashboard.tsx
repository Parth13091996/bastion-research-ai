import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  DollarSign,
  User,
  Crown,
  Shield,
  InfoIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const UserDashboard = () => {
  const { user, subscription, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name || user?.username || "User"}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Independent, Unbiased, Insightful Market Analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              {subscription?.isPremium ? (
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

        {/* User Info Card */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Section: Avatar + Info */}
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

            {/* Right Section: Membership info + Button */}
            <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Member since</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Recently"}
                </p>
                <Link
                  to="/renew-subscription"
                  className="mt-1 sm:mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base inline-block text-center"
                >
                  Renew Now
                </Link>
              </div>

              {/* Renew Now button */}
              {/* {user?.subscription_end &&
                (() => {
                  const today = new Date();
                  const subscriptionEnd = new Date(user.subscription_end);
                  const diffDays = Math.ceil(
                    (subscriptionEnd - today) / (1000 * 60 * 60 * 24)
                  );
                  return diffDays <= 30 ? (
                    <button className="mt-1 sm:mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base">
                      Renew Now
                    </button>
                  ) : null;
                })()} */}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* Live Recommendations Card */}
         <div style={{ backgroundColor: COLORS.blue, minHeight: '100vh', padding: '48px 24px' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4" style={{ color: COLORS.white }}>
         Every Hit. Every Miss. – Shared with Clarity
        </h1>
        <p className="text-lg" style={{ color: COLORS.gray }}>
         Confidence is built, not borrowed
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Recommendations Section */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: COLORS.white }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.blue }}></div>
                <h2 className="text-xl font-semibold" style={{ color: COLORS.black }}>
                  44 Live Recommendations
                </h2>
                <span className="text-xs" style={{ color: COLORS.blue }}>•</span>
              </div>
              <span className="text-sm" style={{ color: COLORS.blue }}>
                3 New Recommendations
              </span>
            </div>

            {/* Average Returns Card */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: COLORS.beige }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={24} style={{ color: COLORS.white }} />
                <span className="text-sm" style={{ color: COLORS.white }}>
                  Average Live Returns
                </span>
                <InfoIcon size={16} style={{ color: COLORS.white }} />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={20} style={{ color: COLORS.white }} />
                <span className="text-4xl font-bold" style={{ color: COLORS.white }}>
                  10.5%
                </span>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4" style={{ color: COLORS.black }}>
                Live Stock Performance
              </h3>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gray} strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.red} strokeWidth="12" 
                      strokeDasharray="75.4 251.2" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gray} strokeWidth="12" 
                      strokeDasharray="90.48 251.2" strokeDashoffset="-75.4" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#4ADE80" strokeWidth="12" 
                      strokeDasharray="85.44 251.2" strokeDashoffset="-165.88" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">High ({'>'}15%)</span>
                    </div>
                    <span className="font-semibold">15</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.gray }}></div>
                      <span className="text-sm">Medium (15% to -15%)</span>
                    </div>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.red }}></div>
                      <span className="text-sm">Low (&lt;-15%)</span>
                    </div>
                    <span className="font-semibold">11</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Gainer and Loser */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Top Gainer</span>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 120 40" className="w-full">
                    <polyline points="0,35 20,30 40,32 60,20 80,25 100,15 120,10" 
                      fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  </svg>
                  <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded" 
                    style={{ backgroundColor: '#00BCD4', color: COLORS.white }}>BUY!</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xl font-bold text-green-500">208.99%</span>
                  </div>
                  <p className="text-xs text-gray-500">in 2yr, 4mo</p>
                  <p className="text-xs mt-1">🔥 Target 2 | <span style={{ color: '#FF9800' }}>Active</span></p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} />
                  <span className="text-sm font-medium">Top Loser</span>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 120 40" className="w-full">
                    <polyline points="0,10 20,15 40,12 60,25 80,20 100,30 120,35" 
                      fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  </svg>
                  <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded" 
                    style={{ backgroundColor: '#00BCD4', color: COLORS.white }}>BUY!</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <TrendingDown size={16} style={{ color: COLORS.red }} />
                    <span className="text-xl font-bold" style={{ color: COLORS.red }}>-46.11%</span>
                  </div>
                  <p className="text-xs text-gray-500">in 9 months</p>
                  <p className="text-xs mt-1">🔥 Target 2 | <span style={{ color: '#FF9800' }}>Active</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Exits Section */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: COLORS.white }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5722' }}></div>
                <h2 className="text-xl font-semibold" style={{ color: COLORS.black }}>
                  36 Exits (past)
                </h2>
              </div>
              <span className="text-sm" style={{ color: COLORS.blue }}>
                3 New Exits
              </span>
            </div>

            {/* Average Returns Card */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: COLORS.beige }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={24} style={{ color: COLORS.white }} />
                <span className="text-sm" style={{ color: COLORS.white }}>
                  Average Exit Returns
                </span>
                <InfoIcon size={16} style={{ color: COLORS.white }} />
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={20} style={{ color: COLORS.white }} />
                <span className="text-4xl font-bold" style={{ color: COLORS.white }}>
                  62.37%
                </span>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4" style={{ color: COLORS.black }}>
                Exited Stock Performance
              </h3>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gray} strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#4ADE80" strokeWidth="12" 
                      strokeDasharray="251.2 251.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Profit Exits</span>
                    </div>
                    <span className="font-semibold">36</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.red }}></div>
                      <span className="text-sm">Loss Exits</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Exit and Worst Exit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Best Exit</span>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 120 40" className="w-full">
                    <polyline points="0,35 20,30 40,32 60,20 80,18 100,12 120,8" 
                      fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  </svg>
                  <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded" 
                    style={{ backgroundColor: COLORS.red, color: COLORS.white }}>SELL!</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xl font-bold text-green-500">269.17%</span>
                  </div>
                  <p className="text-xs text-gray-500">in 1yr, 6mo</p>
                  <p className="text-xs mt-1 font-medium">Gravita India Ltd.</p>
                  <p className="text-xs text-gray-400">Inactive</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} />
                  <span className="text-sm font-medium">Worst Exit</span>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 120 40" className="w-full">
                    <polyline points="0,20 20,18 40,22 60,19 80,21 100,20 120,22" 
                      fill="none" stroke={COLORS.blue} strokeWidth="2" />
                  </svg>
                  <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded" 
                    style={{ backgroundColor: COLORS.red, color: COLORS.white }}>SELL!</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xl font-bold text-green-500">0.67%</span>
                  </div>
                  <p className="text-xs text-gray-500">in 1yr, 8mo</p>
                  <p className="text-xs mt-1 font-medium">Monte Carlo Fashions Ltd.</p>
                  <p className="text-xs text-gray-400">Inactive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
                View All →
              </button>
            </div>

            {/* Updates */}
            <div className="space-y-4 sm:space-y-6">
              {/* NVIDIA Update */}
              <div className="border-l-4 border-red-200 pl-3 sm:pl-4">
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
              </div>

              {/* Market Update */}
              <div className="border-l-4 border-yellow-200 pl-3 sm:pl-4">
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
              </div>

              {/* CrowdStrike Update */}
              <div className="border-l-4 border-yellow-200 pl-3 sm:pl-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Performance Chart */}
    
      </div>
    </div>
  );
};

export default UserDashboard;
