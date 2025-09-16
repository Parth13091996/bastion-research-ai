import React, { useState, useMemo } from "react";
import { Eye, FileText, Trash2, Plus } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

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
];

const StatusBadge = ({ value }: { value: string }) => {
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
      className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(value)}`}
    >
      {value}
    </span>
  );
};

const RowActions = ({
  data,
  onDelete,
}: {
  data: any;
  onDelete: (id: string) => void;
}) => (
  <div className="flex space-x-2">
    <button
      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => console.log("View Invoice", data.invoice_id)}
    >
      <FileText size={14} />
    </button>
    <button
      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => console.log("View Details", data.transaction_id)}
    >
      <Eye size={14} />
    </button>
    <button
      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={() => onDelete(data.transaction_id)}
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
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () =>
      axiosInstance.get(endpoints.paymentHistory.base).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(endpoints.paymentHistory.byId(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) =>
      axiosInstance.post(endpoints.paymentHistory.base, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
  });

  const filteredData = useMemo(() => {
    const rows = data || [];
    return rows.filter((item: any) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        Object.values(item).some((value: any) =>
          value?.toString().toLowerCase().includes(lowerCaseSearchQuery)
        );
      const matchesGateway =
        filters.gateway === "All" || item.payment_gateway === filters.gateway;
      const matchesPaymentType =
        filters.paymentType === "All" ||
        item.payment_type === filters.paymentType;
      const matchesStatus =
        filters.status === "All" || item.transaction_status === filters.status;
      return (
        matchesSearch && matchesGateway && matchesPaymentType && matchesStatus
      );
    });
  }, [searchQuery, filters, data]);

  const colDefs: ColDef[] = [
    { headerName: "Transaction ID", field: "transaction_id" },
    { headerName: "Invoice ID", field: "invoice_id" },
    { headerName: "User", field: "user_id" },
    { headerName: "Email", field: "user_email" },
    { headerName: "Membership", field: "membership" },
    { headerName: "Gateway", field: "payment_gateway" },
    { headerName: "Type", field: "payment_type" },
    { headerName: "Payer Email", field: "payer_email" },
    {
      headerName: "Status",
      field: "transaction_status",
      cellRenderer: StatusBadge,
    },
    { headerName: "Date", field: "payment_date" },
    { headerName: "Amount", field: "amount" },
    {
      headerName: "Actions",
      filter: false,
      sortable: false,
      cellRenderer: (params: any) => (
        <RowActions
          data={params.data}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen mx-auto max-w-[80rem] bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredData.length} transactions
            </p>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            onClick={() => {
              const transaction_id = prompt("Transaction ID") || "";
              const invoice_id = prompt("Invoice ID") || "";
              const user_id = prompt("User ID (UUID)") || "";
              const plan_id = Number(prompt("Plan ID") || "");
              const payment_gateway = prompt("Gateway") || "";
              const payment_type = prompt("Type") || "";
              const payer_email = prompt("Payer Email") || "";
              const transaction_status = prompt("Status") || "Completed";
              const payment_date = prompt("Payment Date (YYYY-MM-DD)") || "";
              const amount = Number(prompt("Amount") || "0");
              createMutation.mutate({
                transaction_id,
                invoice_id,
                user_id,
                plan_id,
                payment_gateway,
                payment_type,
                payer_email,
                transaction_status,
                payment_date,
                amount,
              });
            }}
          >
            <Plus size={16} />
            <span>Add Manual Payment</span>
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          {/* Add more filters UI here if needed */}
        </div>
        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            theme="legacy"
            rowData={filteredData}
            columnDefs={colDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
