import { useState, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Eye, FileText, Trash2, X } from 'lucide-react';

const ManageSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [planTypeFilter, setPlanTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sample data for different tabs
  const subscriptionsData = [
    {
      id: 658,
      membership: 'Freemium',
      username: 'tharmamgmail.com',
      name: 'RAJESH KANNATHARA',
      startDate: 'August 24, 2024',
      expiryNextRenewal: '',
      amount: '0.00 INR',
      paymentType: 'Manual',
      transactionId: '0',
      status: 'Active'
    },
    {
      id: 657,
      membership: 'Freemium',
      username: 'learningappbgcmail.com',
      name: 'Learning App',
      startDate: 'August 24, 2024',
      expiryNextRenewal: '',
      amount: '0.00 INR',
      paymentType: 'Manual',
      transactionId: '0',
      status: 'Active'
    },
    {
      id: 656,
      membership: 'Annual Plan',
      username: 'shreyaanshacademylist@gmail.com',
      name: 'Shreyaansh Limbachiya',
      startDate: 'August 22, 2024',
      expiryNextRenewal: 'August 22, 2025',
      amount: '15,890.00 INR',
      paymentType: 'Manual',
      transactionId: '',
      status: 'Active'
    },
    {
      id: 655,
      membership: 'Freemium',
      username: 'kuleshdeekshit190@gmail.com',
      name: 'Kulesh Swami',
      startDate: 'August 20, 2024',
      expiryNextRenewal: '',
      amount: '0.00 INR',
      paymentType: 'Manual',
      transactionId: '0',
      status: 'Active'
    }
  ];

  const allActivitiesData = [
    {
      invoiceId: 'BIL-205',
      membership: 'Annual Plan',
      username: 'shreyaanshacademylist@gmail.com',
      name: 'Shreyaansh Limbachiya',
      paymentDate: 'August 22, 2024',
      amount: '18,750.20 INR',
      paymentType: 'Manual Semi Automatic',
      status: 'Success'
    },
    {
      invoiceId: 'BIL-204',
      membership: 'Annual Plan',
      username: 'Sudheena',
      name: 'Sudheen Reddy',
      paymentDate: 'August 17, 2024',
      amount: '18,750.20 INR',
      paymentType: 'Razorpay Semi Automatic',
      status: 'Success'
    },
    {
      invoiceId: 'BIL-204',
      membership: 'Bastion Research Core',
      username: 'khalfasolutions@gmail.com',
      name: 'Khalfaso Hryanshi',
      paymentDate: 'August 11, 2024',
      amount: '4,000.00 INR',
      paymentType: 'Razorpay Auto Debit',
      status: 'Failed'
    }
  ];

  const upcomingSubscriptionsData = [
    {
      id: 194,
      membership: 'Annual Plan',
      username: 'Cabochan',
      name: 'Anuj Bhartiya',
      startDate: 'August 30, 2024',
      expiryNextRenewal: 'August 30, 2025',
      amount: '15,890.00 INR',
      paymentType: 'Razorpay Semi Automatic'
    },
    {
      id: 195,
      membership: 'Annual Plan',
      username: 'Jeegat',
      name: 'Naveen Rawat',
      startDate: 'August 30, 2024',
      expiryNextRenewal: 'August 30, 2025',
      amount: '15,890.00 INR',
      paymentType: 'Razorpay Semi Automatic'
    },
    {
      id: 196,
      membership: 'Annual Plan',
      username: 'Atuj',
      name: 'Atuj Mehra',
      startDate: 'September 3, 2024',
      expiryNextRenewal: 'September 3, 2025',
      amount: '15,890.00 INR',
      paymentType: 'Manual'
    }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'subscriptions':
        return subscriptionsData;
      case 'activities':
        return allActivitiesData;
      case 'upcoming':
        return upcomingSubscriptionsData;
      default:
        return subscriptionsData;
    }
  };

  const filteredData = useMemo(() => {
    let data = getCurrentData();
    
    if (searchTerm) {
      data = data.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (membershipFilter) {
      data = data.filter(item => item.membership === membershipFilter);
    }

    if (statusFilter && activeTab !== 'upcoming') {
      data = data.filter(item => item.status === statusFilter);
    }

    return data;
  }, [activeTab, searchTerm, membershipFilter, statusFilter, gatewayFilter, planTypeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const renderSubscriptionsTable = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">ID</th>
              <th className="text-left p-3 font-medium text-gray-700">Membership</th>
              <th className="text-left p-3 font-medium text-gray-700">Username</th>
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Start Date</th>
              <th className="text-left p-3 font-medium text-gray-700">Expiry/Next Renewal</th>
              <th className="text-left p-3 font-medium text-gray-700">Amount</th>
              <th className="text-left p-3 font-medium text-gray-700">Payment Type</th>
              <th className="text-left p-3 font-medium text-gray-700">Transaction ID</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr 
                key={row.id}
                className="border-b hover:bg-gray-50 relative"
                onMouseEnter={() => setHoveredRow(`sub-${index}`)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-3 text-sm">{row.id}</td>
                <td className="p-3 text-sm">{row.membership}</td>
                <td className="p-3 text-sm text-blue-600">{row.username}</td>
                <td className="p-3 text-sm">{row.name}</td>
                <td className="p-3 text-sm">{row.startDate}</td>
                <td className="p-3 text-sm">{row.expiryNextRenewal}</td>
                <td className="p-3 text-sm">{row.amount}</td>
                <td className="p-3 text-sm">{row.paymentType}</td>
                <td className="p-3 text-sm">{row.transactionId}</td>
                <td className="p-3 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {row.status}
                  </span>
                </td>
                {hoveredRow === `sub-${index}` && (
                  <td className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center gap-1">
                      <X size={12} />
                      Cancel
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivitiesTable = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Invoice ID</th>
              <th className="text-left p-3 font-medium text-gray-700">Membership</th>
              <th className="text-left p-3 font-medium text-gray-700">Username</th>
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Payment Date</th>
              <th className="text-left p-3 font-medium text-gray-700">Amount</th>
              <th className="text-left p-3 font-medium text-gray-700">Payment Type</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr 
                key={row.invoiceId + index}
                className="border-b hover:bg-gray-50 relative"
                onMouseEnter={() => setHoveredRow(`act-${index}`)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-3 text-sm text-blue-600">{row.invoiceId}</td>
                <td className="p-3 text-sm">{row.membership}</td>
                <td className="p-3 text-sm text-blue-600">{row.username}</td>
                <td className="p-3 text-sm">{row.name}</td>
                <td className="p-3 text-sm">{row.paymentDate}</td>
                <td className="p-3 text-sm">{row.amount}</td>
                <td className="p-3 text-sm">{row.paymentType}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.status === 'Success' 
                      ? 'bg-green-100 text-green-800' 
                      : row.status === 'Failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {row.status}
                  </span>
                </td>
                {hoveredRow === `act-${index}` && (
                  <td className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex bg-blue-600 rounded shadow-lg">
                      <button 
                        className="p-2 text-white hover:bg-blue-700 rounded-l transition-colors relative group"
                        title="View Invoice"
                      >
                        <Eye size={14} />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          View Invoice
                        </span>
                      </button>
                      <button 
                        className="p-2 text-white hover:bg-blue-700 transition-colors relative group"
                        title="View Details"
                      >
                        <FileText size={14} />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          View Details
                        </span>
                      </button>
                      <button 
                        className="p-2 text-white hover:bg-blue-700 rounded-r transition-colors relative group"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Delete
                        </span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUpcomingTable = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">ID</th>
              <th className="text-left p-3 font-medium text-gray-700">Membership</th>
              <th className="text-left p-3 font-medium text-gray-700">Username</th>
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Start Date</th>
              <th className="text-left p-3 font-medium text-gray-700">Expiry/Next Renewal</th>
              <th className="text-left p-3 font-medium text-gray-700">Amount</th>
              <th className="text-left p-3 font-medium text-gray-700">Payment Type</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-sm">{row.id}</td>
                <td className="p-3 text-sm">{row.membership}</td>
                <td className="p-3 text-sm text-blue-600">{row.username}</td>
                <td className="p-3 text-sm">{row.name}</td>
                <td className="p-3 text-sm">{row.startDate}</td>
                <td className="p-3 text-sm">{row.expiryNextRenewal}</td>
                <td className="p-3 text-sm">{row.amount}</td>
                <td className="p-3 text-sm">{row.paymentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCurrentTable = () => {
    switch (activeTab) {
      case 'subscriptions':
        return renderSubscriptionsTable();
      case 'activities':
        return renderActivitiesTable();
      case 'upcoming':
        return renderUpcomingTable();
      default:
        return renderSubscriptionsTable();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Subscriptions</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by Username"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
          >
            <option value="">Select Memberships</option>
            <option value="Freemium">Freemium</option>
            <option value="Annual Plan">Annual Plan</option>
            <option value="Bastion Research Core">Bastion Research Core</option>
          </select>

          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
          >
            <option value="">Gateway</option>
            <option value="Manual">Manual</option>
            <option value="Razorpay">Razorpay</option>
          </select>

          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value)}
          >
            <option value="">Plan Type</option>
            <option value="Annual">Annual</option>
            <option value="Monthly">Monthly</option>
          </select>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Apply
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg mb-6">
        <div className="flex justify-center border-b">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('subscriptions');
                setCurrentPage(1);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4V6zm2-4h12v2H6V2zm-2 8h16v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8zm2 2v4h12v-4H4z"/>
              </svg>
              Subscriptions
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-l border-r border-gray-300 ${
                activeTab === 'activities'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('activities');
                setCurrentPage(1);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
              </svg>
              All Activities
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('upcoming');
                setCurrentPage(1);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              Upcoming Subscriptions
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4">
          {renderCurrentTable()}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} subscriptions
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select 
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">Subscriptions</span>
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="px-3 py-1 text-sm">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptions;