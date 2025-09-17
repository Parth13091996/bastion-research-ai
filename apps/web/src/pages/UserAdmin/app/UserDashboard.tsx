import React from 'react';
import { TrendingUp, Target, FileText, DollarSign } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Bastion Research User Dashboard
          </h1>
          <p className="text-gray-600">Independent, Unbiased, Insightful Market Analysis</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Active Picks */}
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase">Active Picks</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">10</div>
            <div className="text-sm text-green-600 font-medium">↗ +5 this week</div>
          </div>

          {/* Average Return */}
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase">Avg. Return</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">+27.0%</div>
            <div className="text-sm text-green-600 font-medium">↗ vs. S&P 500 +10.2%</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase">Win Rate</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">150%</div>
            <div className="text-sm text-gray-600">12 month trailing</div>
          </div>

          {/* Research Reports */}
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase">Research Reports</h3>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">15</div>
            <div className="text-sm text-gray-600">Published this month</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Recommendations</h2>
                <p className="text-sm text-gray-600">Latest stock picks and analysis</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>

            {/* Stock Recommendations */}
            <div className="space-y-4">
              {/* NVDA */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
                    NV
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">NVDA</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">STRONG BUY</span>
                    </div>
                    <div className="text-sm text-gray-600">NVIDIA Corporation</div>
                    <div className="text-xs text-gray-500">Sarah Chen</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$180.00</div>
                  <div className="text-sm text-green-600">↗ +11.1%</div>
                  <div className="text-xs text-gray-500">⚠ Medium Risk</div>
                </div>
              </div>

              {/* TSLA */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                    TS
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">TSLA</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">BUY</span>
                    </div>
                    <div className="text-sm text-gray-600">Tesla, Inc.</div>
                    <div className="text-xs text-gray-500">Michael Rodriguez</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$520.00</div>
                  <div className="text-sm text-green-600">↗ +8.0%</div>
                  <div className="text-xs text-red-500">⚠ High Risk</div>
                </div>
              </div>

              {/* CRWD */}
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    CR
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">CRWD</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">BUY</span>
                    </div>
                    <div className="text-sm text-gray-600">CrowdStrike Holdings</div>
                    <div className="text-xs text-gray-500">David Park</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$195.00</div>
                  <div className="text-sm text-green-600">↗ +10.1%</div>
                  <div className="text-xs text-gray-500">⚠ Medium Risk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Updates */}
          <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Latest Updates</h2>
                <p className="text-sm text-gray-600">Recent market insights</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>

            {/* Updates */}
            <div className="space-y-6">
              {/* NVIDIA Update */}
              <div className="border-l-4 border-red-200 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">NVIDIA Earnings Beat: Raising Price Target</span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  Earnings Alert
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Exceptional earnings beat indicates our AI infrastructure 
                  thesis - raising price target to $180
                </p>
                <div className="text-xs text-gray-500">Jan 15 • Sarah Chen</div>
              </div>

              {/* Market Update */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Market Update: Tech Rotation Continues</span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  Market Commentary
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Quality tech outperformance continues - maintain 
                  overweight in our core holdings
                </p>
                <div className="text-xs text-gray-500">Jan 12 • Research Team</div>
              </div>

              {/* CrowdStrike Update */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">CrowdStrike: New Enterprise Wins Accelerating</span>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2 inline-block">
                  Stock Update
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Strong enterprise momentum supports our bullish thesis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Performance Chart */}
        <div className="mt-8 bg-white rounded-lg p-4 lg:p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Performance</h2>
            <p className="text-sm text-gray-600">Recommendations vs. S&P 500 benchmark</p>
          </div>

          {/* Chart Container */}
          <div className="relative h-64 lg:h-80 mb-6">
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
          <div className="flex flex-wrap justify-center lg:justify-start space-x-6 text-sm mb-6">
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
          <div className="grid grid-cols-3 gap-4 lg:gap-8">
            <div className="text-center lg:text-left">
              <div className="text-xl lg:text-2xl font-bold text-green-600">+21.4%</div>
              <div className="text-sm text-gray-600">Portfolio Return</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl lg:text-2xl font-bold text-green-600">+11.2%</div>
              <div className="text-sm text-gray-600">S&P 500 Return</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">+10.2%</div>
              <div className="text-sm text-gray-600">Outperformance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;