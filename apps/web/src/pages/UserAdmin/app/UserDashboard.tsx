import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, FileText, DollarSign, User, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
                Welcome back, {user?.first_name || user?.username || 'User'}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Independent, Unbiased, Insightful Market Analysis</p>
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
                  <span className="text-sm font-medium">Free Member</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">{user?.email}</p>
                <p className="text-xs sm:text-sm text-gray-500 capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Member since</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Active Picks */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase">Active Picks</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">10</div>
            <div className="text-xs sm:text-sm text-green-600 font-medium">↗ +5 this week</div>
          </div>

          {/* Average Return */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase">Avg. Return</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">+27.0%</div>
            <div className="text-xs sm:text-sm text-green-600 font-medium">↗ vs. S&P 500 +10.2%</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase">Win Rate</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">150%</div>
            <div className="text-xs sm:text-sm text-gray-600">12 month trailing</div>
          </div>

          {/* Research Reports */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase">Research Reports</h3>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">15</div>
            <div className="text-xs sm:text-sm text-gray-600">Published this month</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Recommendations</h2>
                <p className="text-xs sm:text-sm text-gray-600">Latest stock picks and analysis</p>
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
                      <span className="font-medium text-gray-900 text-sm sm:text-base">NVDA</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded self-start">STRONG BUY</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">NVIDIA Corporation</div>
                    <div className="text-xs text-gray-500">Sarah Chen</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">$180.00</div>
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
                      <span className="font-medium text-gray-900 text-sm sm:text-base">TSLA</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded self-start">BUY</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Tesla, Inc.</div>
                    <div className="text-xs text-gray-500">Michael Rodriguez</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">$520.00</div>
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
                      <span className="font-medium text-gray-900 text-sm sm:text-base">CRWD</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded self-start">BUY</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">CrowdStrike Holdings</div>
                    <div className="text-xs text-gray-500">David Park</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-900">$195.00</div>
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
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Latest Updates</h2>
                <p className="text-xs sm:text-sm text-gray-600">Recent market insights</p>
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
                  <span className="font-medium text-gray-900 text-sm sm:text-base">NVIDIA Earnings Beat: Raising Price Target</span>
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
                  <span className="font-medium text-gray-900 text-sm sm:text-base">Market Update: Tech Rotation Continues</span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  Market Commentary
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Quality tech outperformance continues - maintain 
                  overweight in our core holdings
                </p>
                <div className="text-xs text-gray-500">Jan 12 • Research Team</div>
              </div>

              {/* CrowdStrike Update */}
              <div className="border-l-4 border-yellow-200 pl-3 sm:pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">CrowdStrike: New Enterprise Wins Accelerating</span>
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
        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Portfolio Performance</h2>
            <p className="text-xs sm:text-sm text-gray-600">Recommendations vs. S&P 500 benchmark</p>
          </div>

          {/* Chart Container */}
          <div className="relative h-48 sm:h-64 lg:h-80 mb-4 sm:mb-6">
            <svg className="w-full h-full" viewBox="0 0 600 300">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="60" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Y-axis labels */}
              <text x="15" y="25" className="text-xs fill-gray-500">34%</text>
              <text x="15" y="85" className="text-xs fill-gray-500">19%</text>
              <text x="15" y="145" className="text-xs fill-gray-500">12%</text>
              <text x="15" y="205" className="text-xs fill-gray-500">5%</text>
              <text x="15" y="265" className="text-xs fill-gray-500">0%</text>
              <text x="15" y="295" className="text-xs fill-gray-500">-5%</text>

              {/* X-axis labels */}
              <text x="60" y="290" className="text-xs fill-gray-500">Jan</text>
              <text x="180" y="290" className="text-xs fill-gray-500">Feb</text>
              <text x="300" y="290" className="text-xs fill-gray-500">Mar</text>
              <text x="420" y="290" className="text-xs fill-gray-500">Apr</text>
              <text x="540" y="290" className="text-xs fill-gray-500">May</text>

              {/* Our Picks Line (Orange) */}
              <path
                d="M 60,240 L 120,210 L 180,180 L 240,150 L 300,140 L 360,160 L 420,145 L 480,150 L 540,90 L 580,60"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
              
              {/* Data Points for Our Picks */}
              <circle cx="60" cy="240" r="4" fill="#f97316" />
              <circle cx="120" cy="210" r="4" fill="#f97316" />
              <circle cx="180" cy="180" r="4" fill="#f97316" />
              <circle cx="240" cy="150" r="4" fill="#f97316" />
              <circle cx="300" cy="140" r="4" fill="#f97316" />
              <circle cx="360" cy="160" r="4" fill="#f97316" />
              <circle cx="420" cy="145" r="4" fill="#f97316" />
              <circle cx="480" cy="150" r="4" fill="#f97316" />
              <circle cx="540" cy="90" r="4" fill="#f97316" />
              <circle cx="580" cy="60" r="4" fill="#f97316" />

              {/* S&P 500 Line (Gray, Dashed) */}
              <path
                d="M 60,250 L 120,260 L 180,255 L 240,240 L 300,235 L 360,240 L 420,235 L 480,230 L 540,220 L 580,210"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Data Points for S&P 500 */}
              <circle cx="60" cy="250" r="3" fill="#9ca3af" />
              <circle cx="580" cy="210" r="3" fill="#9ca3af" />
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center lg:justify-start space-x-4 sm:space-x-6 text-xs sm:text-sm mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Our Picks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-gray-400 border-dashed"></div>
              <span className="text-gray-600">S&P 500</span>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">+21.4%</div>
              <div className="text-xs sm:text-sm text-gray-600">Portfolio Return</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">+11.2%</div>
              <div className="text-xs sm:text-sm text-gray-600">S&P 500 Return</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">+10.2%</div>
              <div className="text-xs sm:text-sm text-gray-600">Outperformance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;