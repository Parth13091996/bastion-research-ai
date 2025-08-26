import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Trash2, 
  ChevronDown,
  Calendar,
  Plus
} from 'lucide-react';

// Mock data for demonstration (replace with your actual API data)
const mockData = [
  {
    transaction_id: 'pay_MKJVgrVkAGQ',
    invoice_id: 'BB-266',
    user_id: 'shreyadhiruobhavyalit@gmail.com',
    user_email: 'shreyadhiruobhavyalit@gmail.com',
    membership: 'Annual Plan',
    payment_gateway: 'Manual',
    payment_type: 'One Time',
    payer_email: 'Paid by admin',
    transaction_status: 'Success',
    payment_date: 'August 27, 2025 12:00 AM',
    amount: '₹750.30'
  },
  {
    transaction_id: 'pay_MKJVgrVkAGQ',
    invoice_id: 'BB-265',
    user_id: 'sudheekart234@gmail.com',
    user_email: 'sudheekart234@gmail.com',
    membership: 'Annual Plan',
    payment_gateway: 'Razorpay',
    payment_type: 'One Time',
    payer_email: 'sudheekart234@gmail.com',
    transaction_status: 'Success',
    payment_date: 'August 17, 2025 7:57 PM',
    amount: '₹750.30'
  },
  {
    transaction_id: 'Manual',
    invoice_id: 'BB-264',
    user_id: 'apashallahsharmeth888@gmail.com',
    user_email: 'apashallahsharmeth888@gmail.com',
    membership: 'Bastion Research Core',
    payment_gateway: 'Razorpay',
    payment_type: 'Subscription (Automatic)',
    payer_email: 'apashallahsharmeth888@gmail.com',
    transaction_status: 'Failed',
    payment_date: 'August 13, 2025 8:25 PM',
    amount: '4,000.00'
  },
  {
    transaction_id: '-',
    invoice_id: 'BB-263',
    user_id: 'vishalsetha01@gmail.com',
    user_email: 'vishalsetha01@gmail.com',
    membership: 'Annual Plan',
    payment_gateway: 'Manual',
    payment_type: 'One Time',
    payer_email: 'Paid by admin',
    transaction_status: 'Success',
    payment_date: 'August 12, 2025 12:00 AM',
    amount: '₹750.30'
  },
  {
    transaction_id: 'pay_PurKYGTAMLdrX',
    invoice_id: 'BB-262',
    user_id: 'apashallahsharmeth888@gmail.com',
    user_email: 'apashallahsharmeth888@gmail.com',
    membership: 'Bastion Research Core',
    payment_gateway: 'Razorpay',
    payment_type: 'Subscription (Automatic)',
    payer_email: 'apashallahsharmeth888@gmail.com',
    transaction_status: 'Cancelled',
    payment_date: 'August 11, 2025 5:34 AM',
    amount: '0.00'
  },
  // Add more mock data for pagination demonstration
  ...Array.from({ length: 20 }, (_, i) => ({
    transaction_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
    invoice_id: `BB-${260 - i}`,
    user_id: `user${i + 6}@gmail.com`,
    user_email: `user${i + 6}@gmail.com`,
    membership: i % 2 === 0 ? 'Annual Plan' : 'Monthly Plan',
    payment_gateway: i % 3 === 0 ? 'Manual' : 'Razorpay',
    payment_type: i % 2 === 0 ? 'One Time' : 'Subscription (Automatic)',
    payer_email: i % 3 === 0 ? 'Paid by admin' : `user${i + 6}@gmail.com`,
    transaction_status: ['Success', 'Failed', 'Cancelled'][i % 3],
    payment_date: `July ${30 - i}, 2025 12:00 AM`,
    amount: `₹${(Math.random() * 1000 + 500).toFixed(2)}`
  }))
];

// Status renderer component
const StatusRenderer = (params: ICellRendererParams) => {
  const status = params.value;
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// Actions renderer component
const ActionsRenderer = (params: ICellRendererParams) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="relative h-full flex items-center"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className="flex space-x-2">
          <div className="relative group">
            <button 
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => console.log('View Invoice', params.data.invoice_id)}
            >
              <FileText size={14} />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Invoice
            </div>
          </div>
          
          <div className="relative group">
            <button 
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => console.log('View Details', params.data.transaction_id)}
            >
              <Eye size={14} />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Details
            </div>
          </div>
          
          <div className="relative group">
            <button 
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => console.log('Delete', params.data.transaction_id)}
            >
              <Trash2 size={14} />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Delete
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gateway: '',
    paymentType: '',
    subscription: '',
    status: ''
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use mock data instead of API for demonstration
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => Promise.resolve(mockData), // Replace with your actual API call
    // queryFn: () => axiosInstance.get('/api/payment-history').then((res) => res.data),
  });

  const rowData = apiData || mockData;

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!rowData) return [];
    
    return rowData.filter(item => {
      const matchesSearch = searchQuery === '' || 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesGateway = filters.gateway === '' || item.payment_gateway === filters.gateway;
      const matchesPaymentType = filters.paymentType === '' || item.payment_type === filters.paymentType;
      const matchesStatus = filters.status === '' || item.transaction_status === filters.status;
      
      return matchesSearch && matchesGateway && matchesPaymentType && matchesStatus;
    });
  }, [rowData, searchQuery, filters]);

  const columnDefs: ColDef[] = [
    { 
      headerName: 'Transaction ID', 
      field: 'transaction_id',
      width: 150,
      cellStyle: { color: '#1f2937' }
    },
    { 
      headerName: 'Invoice ID', 
      field: 'invoice_id',
      width: 120,
      cellStyle: { color: '#3b82f6' }
    },
    { 
      headerName: 'User', 
      field: 'user_id',
      width: 200
    },
    { 
      headerName: 'User Email', 
      field: 'user_email',
      width: 200
    },
    { 
      headerName: 'Membership', 
      field: 'membership',
      width: 180
    },
    { 
      headerName: 'Payment Gateway', 
      field: 'payment_gateway',
      width: 150
    },
    { 
      headerName: 'Payment Type', 
      field: 'payment_type',
      width: 180
    },
    { 
      headerName: 'Payer Email', 
      field: 'payer_email',
      width: 200
    },
    { 
      headerName: 'Transaction Status', 
      field: 'transaction_status',
      width: 150,
      cellRenderer: StatusRenderer
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false
    }
  ];

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...');
    // Implement CSV export functionality
  };

  const handleAddManualPayment = () => {
    console.log('Adding manual payment...');
    // Implement add manual payment functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <button
            onClick={handleAddManualPayment}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={16} />
            <span>Add Manual Payment</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          {/* Search and Filter Row */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.gateway}
              onChange={(e) => handleFilterChange('gateway', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Gateway</option>
              <option value="Manual">Manual</option>
              <option value="Razorpay">Razorpay</option>
            </select>

            <select
              value={filters.paymentType}
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Payment Type</option>
              <option value="One Time">One Time</option>
              <option value="Subscription (Automatic)">Subscription (Automatic)</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range and Action Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                Filter
              </button>

              <button
                onClick={handleExportCSV}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download size={16} />
                <span>Export To CSV</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Bulk Actions</span>
                <ChevronDown size={16} />
              </button>
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                Go
              </button>

              <button className="text-blue-500 hover:text-blue-600 flex items-center space-x-1">
                <Filter size={16} />
                <span>Show / Hide columns</span>
              </button>
            </div>
          </div>
        </div>

        {/* AG Grid Table */}
        <div className="p-6">
          <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
            <AgGridReact
              rowData={filteredData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              rowSelection="multiple"
              animateRows={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true
              }}
              onRowClicked={(event) => console.log('Row clicked:', event.data)}
              rowClass="hover:bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;