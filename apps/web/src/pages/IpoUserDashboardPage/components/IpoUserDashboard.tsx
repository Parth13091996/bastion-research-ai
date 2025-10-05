import React, { useState } from 'react';
import { Bell, Calendar, BarChart3, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import Header from './Header';
import Footer from '@/components/generic/Footer';

const IpoUserDashboard = () => {
  const [showAllIpos, setShowAllIpos] = useState(false);

  const handleAllIposClick = () => {
    setShowAllIpos(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAllIposClick={handleAllIposClick} />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Trial Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center justify-between mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900">Trial: 13 days left</span>
              <span className="text-amber-800 text-sm ml-2">
                Covers all live IPOs in your window. Auto-renews at ₹1,500/year unless you cancel before 10/12/2025.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 whitespace-nowrap">
              Go to Billing
            </button>
            <button className="px-4 py-2 border border-amber-400 bg-white text-amber-900 text-sm rounded hover:bg-amber-50 whitespace-nowrap">
              Cancel trial
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
              <p className="text-sm text-gray-500 mt-1">Independent, fundamentals-first IPO insights</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
              Premium Member
            </span>
          </div>
        </div>

        {/* Stats Grid - First Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Active IPO windows</p>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">2</p>
            <p className="text-xs text-gray-500">+2 opening in next 7 days</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total IPOs covered</p>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">5</p>
            <p className="text-xs text-gray-500">3 Mainboard + 2 SME</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Active (Mainboard)</p>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">0</p>
            <p className="text-xs text-gray-500">2 ongoing & upcoming</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Active (SME)</p>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">2</p>
            <p className="text-xs text-gray-500">2 ongoing & upcoming</p>
          </div>
        </div>

        {/* Stats Grid - Second Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Briefs updated this month</p>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">5</p>
            <p className="text-xs text-gray-500">September 2025</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Recommendation mix</p>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Apply: 3</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Watch: 1</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Avoid: 1</span>
            </div>
            <p className="text-xs text-gray-500">We cover all live IPOs during your trial, with occasional material updates.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Your plan</p>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">Trial • 13 days left</p>
            <p className="text-xs text-gray-500 mb-3">Auto-renews at ₹1,500/yr unless cancelled.</p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                Continue after trial
              </button>
              <button className="px-3 py-1.5 border border-amber-400 text-amber-900 text-xs rounded hover:bg-amber-50">
                Cancel trial
              </button>
            </div>
          </div>
        </div>

        {/* Recent Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent recommendations</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700">View all</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Side - IPO List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
              {/* IPO 1 */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Navkar Infra Services</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Apply</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Mainboard</span>
                    <span className="text-xs text-gray-500">Price band: ₹150–₹165</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full ml-4">
                  Publishing soon
                </span>
              </div>

              {/* IPO 2 */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Airfloa Rail Technology</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Apply</span>
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded">SME</span>
                    <span className="text-xs text-gray-500">Price band: ₹240–₹260</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded ml-4 flex items-center space-x-1 hover:bg-indigo-700">
                  <FileText className="w-3 h-3" />
                  <span>Open</span>
                </button>
              </div>

              {/* IPO 3 */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Zenith Specialty Labs</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Apply</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">Mainboard</span>
                    <span className="text-xs text-gray-500">Price band: ₹690–₹730</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded ml-4 flex items-center space-x-1 hover:bg-indigo-700">
                  <FileText className="w-3 h-3" />
                  <span>Open</span>
                </button>
              </div>
            </div>

            {/* Right Side - Latest Updates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Latest updates</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-600 mb-2">Alpha Motors Components</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Anchor indications suggest wider band; full brief on Day-1.
                </p>
                <p className="text-xs text-gray-500 text-right">9/28/2025</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default IpoUserDashboard;