import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Trash2,
  ChevronDown,
  Calendar,
  Plus,
} from "lucide-react";

// Mock data (same as before, truncated for brevity)
const mockData = [
  {
    transaction_id: "pay_MKJVgrVkAGQ",
    invoice_id: "BB-266",
    user_id: "shreyadhiruobhavyalit@gmail.com",
    user_email: "shreyadhiruobhavyalit@gmail.com",
    membership: "Annual Plan",
    payment_gateway: "Manual",
    payment_type: "One Time",
    payer_email: "Paid by admin",
    transaction_status: "Success",
    payment_date: "2025-08-27",
    amount: "₹750.30",
  },
  {
    transaction_id: "pay_MKJVgrVkBGR",
    invoice_id: "BB-265",
    user_id: "sudheekart234@gmail.com",
    user_email: "sudheekart234@gmail.com",
    membership: "Annual Plan",
    payment_gateway: "Razorpay",
    payment_type: "One Time",
    payer_email: "sudheekart234@gmail.com",
    transaction_status: "Success",
    payment_date: "2025-08-17",
    amount: "₹750.30",
  },
  {
    transaction_id: "Manual_001",
    invoice_id: "BB-264",
    user_id: "apashallahsharmeth888@gmail.com",
    user_email: "apashallahsharmeth888@gmail.com",
    membership: "Bastion Research Core",
    payment_gateway: "Razorpay",
    payment_type: "Subscription (Automatic)",
    payer_email: "apashallahsharmeth888@gmail.com",
    transaction_status: "Failed",
    payment_date: "2025-08-13",
    amount: "₹4,000.00",
  },
  {
    transaction_id: "Manual_002",
    invoice_id: "BB-263",
    user_id: "vishalsetha01@gmail.com",
    user_email: "vishalsetha01@gmail.com",
    membership: "Annual Plan",
    payment_gateway: "Manual",
    payment_type: "One Time",
    payer_email: "Paid by admin",
    transaction_status: "Success",
    payment_date: "2025-08-12",
    amount: "₹750.30",
  },
  {
    transaction_id: "pay_PurKYGTAMLdrX",
    invoice_id: "BB-262",
    user_id: "apashallahsharmeth888@gmail.com",
    user_email: "apashallahsharmeth888@gmail.com",
    membership: "Bastion Research Core",
    payment_gateway: "Razorpay",
    payment_type: "Subscription (Automatic)",
    payer_email: "apashallahsharmeth888@gmail.com",
    transaction_status: "Cancelled",
    payment_date: "2025-08-11",
    amount: "₹0.00",
  },
  ...Array.from({ length: 20 }, (_, i) => ({
    transaction_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
    invoice_id: `BB-${260 - i}`,
    user_id: `user${i + 6}@gmail.com`,
    user_email: `user${i + 6}@gmail.com`,
    membership:
      i % 3 === 0
        ? "Annual Plan"
        : i % 3 === 1
          ? "Monthly Plan"
          : "Bastion Research Core",
    payment_gateway: i % 3 === 0 ? "Manual" : "Razorpay",
    payment_type: i % 2 === 0 ? "One Time" : "Subscription (Automatic)",
    payer_email: i % 3 === 0 ? "Paid by admin" : `user${i + 6}@gmail.com`,
    transaction_status: ["Success", "Failed", "Cancelled"][i % 3],
    payment_date: `2025-07-${String(30 - i).padStart(2, "0")}`,
    amount: `₹${(Math.random() * 1000 + 500).toFixed(2)}`,
  })),
];

// Status badge
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

// Row actions
const RowActions = ({ row }: { row: any }) => (
  <div className="flex space-x-2">
    <button
      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => console.log("View Invoice", row.invoice_id)}
    >
      <FileText size={14} />
    </button>
    <button
      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => console.log("View Details", row.transaction_id)}
    >
      <Eye size={14} />
    </button>
    <button
      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={() => console.log("Delete", row.transaction_id)}
    >
      <Trash2 size={14} />
    </button>
  </div>
);

const PaymentHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    gateway: "All",
    paymentType: "All",
    status: "All",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rowData = mockData;

  // Filtered Data
  const filteredData = useMemo(() => {
    return rowData.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesGateway =
        filters.gateway === "All" || item.payment_gateway === filters.gateway;
      const matchesPaymentType =
        filters.paymentType === "All" ||
        item.payment_type === filters.paymentType;
      const matchesStatus =
        filters.status === "All" || item.transaction_status === filters.status;

      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.payment_date);
        if (startDate && itemDate < new Date(startDate)) matchesDate = false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) matchesDate = false;
        }
      }
      return (
        matchesSearch &&
        matchesGateway &&
        matchesPaymentType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [rowData, searchQuery, filters, startDate, endDate]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen mx-auto max-w-[80rem] bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Showing {paginatedData.length} of {rowData.length} transactions
            </p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Manual Payment</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-4 py-2 border-b">Transaction ID</th>
                <th className="px-4 py-2 border-b">Invoice ID</th>
                <th className="px-4 py-2 border-b">User</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Membership</th>
                <th className="px-4 py-2 border-b">Gateway</th>
                <th className="px-4 py-2 border-b">Type</th>
                <th className="px-4 py-2 border-b">Payer Email</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Date</th>
                <th className="px-4 py-2 border-b">Amount</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors border-b"
                >
                  <td className="px-4 py-2">{row.transaction_id}</td>
                  <td className="px-4 py-2 text-blue-600">{row.invoice_id}</td>
                  <td className="px-4 py-2">{row.user_id}</td>
                  <td className="px-4 py-2">{row.user_email}</td>
                  <td className="px-4 py-2">{row.membership}</td>
                  <td className="px-4 py-2">{row.payment_gateway}</td>
                  <td className="px-4 py-2">{row.payment_type}</td>
                  <td className="px-4 py-2">{row.payer_email}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={row.transaction_status} />
                  </td>
                  <td className="px-4 py-2">{row.payment_date}</td>
                  <td className="px-4 py-2">{row.amount}</td>
                  <td className="px-4 py-2">
                    <RowActions row={row} />
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            transactions
          </div>

          <div className="flex items-center space-x-4">
            {/* Page size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">transactions</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                «
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                ‹
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <span className="text-sm text-gray-500">of {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
