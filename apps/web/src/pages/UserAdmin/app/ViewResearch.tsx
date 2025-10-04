import React, { useState } from 'react';
import { TrendingUp, FileText, Video, ExternalLink, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ViewResearch = () => {
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  // Sample data for the chart
  const chartData = [
    { date: 'Jan', stock: 100, bse500: 100 },
    { date: 'Feb', stock: 105, bse500: 102 },
    { date: 'Mar', stock: 110, bse500: 104 },
    { date: 'Apr', stock: 115, bse500: 106 },
    { date: 'May', stock: 125, bse500: 108 },
    { date: 'Jun', stock: 135, bse500: 110 },
  ];

  // Sample updates data
  const updates = [
    {
      id: 1,
      date: '15 Sep 2024',
      heading: 'Q2 FY24 Results Analysis',
      preview: 'Strong revenue growth of 24% YoY driven by increased demand in domestic markets. EBITDA margins improved by 180 bps...',
      hasPdf: true
    },
    {
      id: 2,
      date: '10 Aug 2024',
      heading: 'Management Commentary Update',
      preview: 'Management remains optimistic about H2 outlook. Capacity expansion on track for Q3 completion. New product launches expected...',
      hasPdf: true
    },
    {
      id: 3,
      date: '05 Jul 2024',
      heading: 'Industry Tailwinds Analysis',
      preview: 'Sector showing strong momentum with government policy support. Key beneficiaries identified across value chain...',
      hasPdf: false
    },
    {
      id: 4,
      date: '20 Jun 2024',
      heading: 'Quarterly Business Review',
      preview: 'Order book visibility remains strong at 12+ months. Operating leverage playing out well with volume growth...',
      hasPdf: true
    },
  ];

  const stockMetrics = {
    recommendationDate: '12 Jan 2024',
    recommendationPrice: '₹285',
    targetPrice: '₹420',
    cmp: '₹385',
    totalReturn: '+35.1%',
    upsideLeft: '+9.1%'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1 - Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Company Name Ltd.</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Raise a Query
            </button>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Recommendation Date</div>
              <div className="text-sm font-semibold text-gray-900">{stockMetrics.recommendationDate}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Recommendation Price</div>
              <div className="text-sm font-semibold text-gray-900">{stockMetrics.recommendationPrice}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Target Price</div>
              <div className="text-sm font-semibold text-gray-900">{stockMetrics.targetPrice}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">CMP</div>
              <div className="text-sm font-semibold text-gray-900">{stockMetrics.cmp}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total Return</div>
              <div className="text-sm font-semibold text-green-600">{stockMetrics.totalReturn}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Upside Left</div>
              <div className="text-sm font-semibold text-blue-600">{stockMetrics.upsideLeft}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 - Chart and Resources */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Stock Performance vs BSE 500
            </h2>
            <p className="text-sm text-gray-500 mb-6">Since Recommendation Date</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Stock"
                  dot={{ fill: '#2563eb', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bse500" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="BSE 500"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Right Side - Resources and Updates */}
          <div className="space-y-6">
            {/* Resource Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  <FileText size={18} />
                  <span className="text-sm">Business Note</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  <FileText size={18} />
                  <span className="text-sm">Quick Bite</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  <Video size={18} />
                  <span className="text-sm">Watch Video</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  <FileText size={18} />
                  <span className="text-sm">Exit Rationale</span>
                </button>
              </div>
            </div>

            {/* Quarterly Updates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Updates</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {updates.slice(0, 3).map((update) => (
                  <div
                    key={update.id}
                    onClick={() => setSelectedUpdate(update)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">{update.date}</span>
                      {update.hasPdf && (
                        <FileText size={14} className="text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                      {update.heading}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {update.preview}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 - All Updates */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Updates</h2>
          <div className="grid grid-cols-3 gap-4">
            {updates.map((update) => (
              <div
                key={update.id}
                onClick={() => setSelectedUpdate(update)}
                className="p-5 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all border border-gray-200 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-gray-500 font-medium">{update.date}</span>
                  {update.hasPdf && (
                    <FileText size={16} className="text-blue-600" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {update.heading}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {update.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-2">{selectedUpdate.date}</div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUpdate.heading}</h3>
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
              {selectedUpdate.hasPdf && (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FileText size={18} />
                  Open PDF Document
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResearch;