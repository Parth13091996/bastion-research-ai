import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { confirmDelete } from "@/utils/confirm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Eye, FileText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
  <div className="flex items-center space-x-2">
    <button
      className="text-blue-600 hover:text-blue-800 p-1"
      title="View Invoice"
    >
      <FileText size={16} />
    </button>
    <button
      className="text-blue-600 hover:text-blue-800 p-1"
      title="View Details"
    >
      <Eye size={16} />
    </button>
    <button
      className="text-red-600 hover:text-red-800 p-1"
      onClick={async () => {
        const ok = await confirmDelete(`transaction ${data.transaction_id}`);
        if (ok) onDelete(data.transaction_id);
      }}
      title="Delete"
    >
      <Trash2 size={16} />
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
    <div className="min-h-screen mx-auto bg-gray-100 p-6">
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
        <div
          className="rounded-md border bg-white ag-theme-alpine"
          style={{ height: 600, width: "100%" }}
        >
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
