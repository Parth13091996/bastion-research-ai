import React, { useState } from 'react';

const SpotLights = () => {
  const [activeTab, setActiveTab] = useState('inactive');

  const activeInvestments = [
    {
      date: '26th March 2024',
      sector: 'Financial Services - Distribution',
      returnSinceRec: '55%',
      irrPotential: '16%'
    },
    {
      date: '26th March 2024',
      sector: 'Content & Learning Solutions',
      returnSinceRec: '53%',
      irrPotential: '7%'
    },
    {
      date: '28th March 2024',
      sector: 'Banks',
      returnSinceRec: '24%',
      irrPotential: '22%'
    },
    {
      date: '1st April 2024',
      sector: 'Consumer Durables',
      returnSinceRec: '-3%',
      irrPotential: '23%'
    },
    {
      date: '1st May 2024',
      sector: 'Consumer Durables',
      returnSinceRec: '8%',
      irrPotential: '21%'
    },
    {
      date: '30th May 2024',
      sector: 'Recycling - Plastic',
      returnSinceRec: '34%',
      irrPotential: '27%'
    },
    {
      date: '5th July 2024',
      sector: 'Agro Chemicals',
      returnSinceRec: '9%',
      irrPotential: '13%'
    },
    {
      date: '26th July 2024',
      sector: 'Domestic Appliances',
      returnSinceRec: '-18%',
      irrPotential: '36%'
    },
    {
      date: '29th August 2024',
      sector: 'Chemicals & Fertilizers',
      returnSinceRec: '51%',
      irrPotential: '11%'
    },
    {
      date: '3rd November 2024',
      sector: 'Tea & Coffee',
      returnSinceRec: '28%',
      irrPotential: '12%'
    },
    {
      date: '4th January 2025',
      sector: 'Chemicals',
      returnSinceRec: '-6%',
      irrPotential: '22%'
    },
    {
      date: '16th March 2025',
      sector: 'Information Technology',
      returnSinceRec: '33%',
      irrPotential: '6%'
    },
    {
      date: '26th April 2025',
      sector: 'Hospitals',
      returnSinceRec: '18%',
      irrPotential: '17%'
    },
    {
      date: '24th June 2025',
      sector: 'Services',
      returnSinceRec: '0%',
      irrPotential: '26%'
    },
    {
      date: '13th July 2025',
      sector: 'Financial Services',
      returnSinceRec: '5%',
      irrPotential: '—',
      comments: 'Special Situation'
    }
  ];

  const inactiveInvestments = [
    {
      coverageStatus: 'Inactive',
      company: '*****',
      date: '14th April 2024',
      sector: 'Financial Services'
    }
  ];

  const closedInvestments = [
    {
      company: 'PSP Projects Ltd.',
      date: '11th March 2024',
      sector: 'EPC - Building',
      action: 'Position Closed.',
      comments: 'Access open for all',
      returnSinceRec: '0%',
      irrPotential: 'NA'
    },
    {
      company: 'SIS Ltd.',
      date: '9th April 2024',
      sector: 'Commercial Services',
      action: 'Position Closed.',
      comments: 'Access open for all',
      returnSinceRec: '-29%',
      irrPotential: 'NA'
    },
    {
      company: 'SIS Ltd.',
      date: '15th May 2025',
      sector: 'Commercial Services',
      action: 'Position Closed',
      comments: 'Special Situation - Buyback Access open for all',
      returnSinceRec: '11%',
      irrPotential: 'NA'
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-slate-800 text-white relative overflow-hidden h-[250px] rounded-br-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-15">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <h1 className="text-7xl font-bold mb-20">Our Research</h1>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block relative">
              <div className="flex space-x-8">
                {/* Person 1 */}
                <div className="relative">
                  <div className="w-20 h-12 bg-gray-400 rounded-t-lg mb-2"></div>
                  <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4"></div>
                  <div className="w-12 h-20 bg-red-600 rounded-lg mx-auto mb-2"></div>
                  <div className="w-16 h-12 bg-gray-800 rounded-lg mx-auto"></div>
                  <div className="absolute -right-4 top-8">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-1 ml-1"></div>
                  </div>
                </div>

                {/* Person 2 */}
                <div className="relative mt-8">
                  <div className="w-20 h-12 bg-gray-400 rounded-t-lg mb-2"></div>
                  <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4"></div>
                  <div className="w-12 h-20 bg-red-600 rounded-lg mx-auto mb-2"></div>
                  <div className="w-16 h-12 bg-gray-800 rounded-lg mx-auto"></div>
                  <div className="absolute -left-8 top-12 w-24 h-16 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Tables Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Animated Button */}
        <div className="mb-8">
          <button className="group relative bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md transition-all duration-300 overflow-hidden">
            <span className="group-hover:-translate-y-8 transition-transform duration-300 block">
              View Latest Updates
            </span>
            <span className="absolute top-12 left-1/2 transform -translate-x-1/2 group-hover:top-3 transition-all duration-300 font-semibold">
              Go !
            </span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-8 py-3 font-medium text-white rounded-t-lg ${activeTab === 'active' ? 'bg-red-500' : 'bg-gray-400'
              }`}
          >
            Active Universe
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-8 py-3 font-medium text-gray-700 rounded-t-lg ${activeTab === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
          >
            Inactive Universe
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200 border-2 border-gray-200">
    
    {/* Table Header */}
    {activeTab === 'active' && (
      <thead className="bg-gray-50 active-universe">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Lock / Unlock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Company
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Coverage Initiation Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Sector
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Action
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Comments
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            % Return since Recommendation
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            % IRR Potential from CMP
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Research Material
          </th>
        </tr>
      </thead>
    )}

    {activeTab === 'inactive' && (
      <thead className="bg-gray-60 inactive-universe">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Coverage Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Lock / Unlock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Company
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Coverage Initiation Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Sector
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-2 border-gray-200">
            Research Material
          </th>
        </tr>
      </thead>
    )}

    {/* Table Body */}
    <tbody className="bg-white divide-y divide-gray-200">
      {/* Inactive Universe Tab */}
      {activeTab === 'inactive' && (
        <>
          {inactiveInvestments.map((investment, index) => (
            <tr key={index} className="bg-gray-50">
              <td className="px-6 py-4 text-sm text-red-500 font-medium border-2 border-gray-200">
                {investment.coverageStatus}
              </td>
              <td className="px-6 py-4">
                <div className="w-5 h-5 text-orange-500">🔒</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">
                {investment.company}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">
                {investment.date}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">
                {investment.sector}
              </td>
              <td className="px-6 py-4 border-2 border-gray-200">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                  View Research
                </button>
              </td>
            </tr>
          ))}
        </>
      )}

      {/* Active Universe Tab */}
      {activeTab === 'active' && (
        <>
          <tr className="bg-gray-100">
            <td colSpan="9" className="px-6 py-4 text-center font-medium text-gray-700">
              Active Investments
            </td>
          </tr>
          {activeInvestments.map((investment, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 border-2 border-gray-200">
                <div className="w-5 h-5 text-orange-500">🔒</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">*****</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.date}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.sector}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">*****</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">
                {investment.comments || '*****'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.returnSinceRec}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.irrPotential}</td>
              <td className="px-6 py-4 border-2 border-gray-200">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                  View Research
                </button>
              </td>
            </tr>
          ))}

          {/* Closed Investments Header */}
          <tr className="bg-gray-100 border-2 border-gray-200">
            <td colSpan="9" className="px-6 py-4 text-center font-medium text-gray-700">
              Closed Investments
            </td>
          </tr>
          {closedInvestments.map((investment, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 border-2 border-gray-200">
                <div className="w-5 h-5 text-orange-500">🔒</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.company}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.date}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.sector}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.action}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.comments}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.returnSinceRec}</td>
              <td className="px-6 py-4 text-sm text-gray-900 border-2 border-gray-200">{investment.irrPotential}</td>
              <td className="px-6 py-4 border-2 border-gray-200">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                  View Research
                </button>
              </td>
            </tr>
          ))}
        </>
      )}
    </tbody>
  </table>
</div>

        </div>
      </section>
    </div>
  );
};

export default SpotLights;