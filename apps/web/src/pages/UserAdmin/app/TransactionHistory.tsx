import React, { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyPaymentHistory } from "@/api/membership-api";
import { useAuth } from "@/contexts/AuthContext";

type PaymentRow = {
  transaction_id: string;
  invoice_id?: string;
  payment_gateway?: string;
  payment_type?: string;
  payer_email?: string;
  transaction_status?: string;
  user_id?: string;
  plan_id?: number;
  payment_date?: string | null;
  amount?: number | string | null;
  membership?: string | null;
};

const StatusBadge = ({ value }: { value?: string }) => {
  const v = (value || "").toLowerCase();
  const classes =
    v === "success" || v === "completed"
      ? "bg-green-100 text-green-800"
      : v === "failed" || v === "cancelled"
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800";
  return (
    <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium ${classes}`}>
      {value || "-"}
    </span>
  );
};

const currency = (v?: number | string | null) => {
  if (v == null || v === "") return "-";
  const n = typeof v === "string" ? Number(v) : v;
  if (isNaN(n as number)) return String(v);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
  }).format(n as number);
};

const formatDate = (v?: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString();
};

const TransactionHistory: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data, isLoading, isError } = useQuery<PaymentRow[]>({
    queryKey: ["my-payment-history"],
    queryFn: async () => {
      const res = await getMyPaymentHistory();
      return res as PaymentRow[];
    },
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const filtered = useMemo(() => {
    const rows = data || [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((val) =>
        (val == null ? "" : String(val)).toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  const totalAmount = useMemo(() => {
    return (filtered || []).reduce((sum, r) => {
      const n = typeof r.amount === "string" ? Number(r.amount) : r.amount || 0;
      return sum + (isNaN(n as number) ? 0 : (n as number));
    }, 0);
  }, [filtered]);

  const colDefs: ColDef<PaymentRow>[] = [
    {
      headerName: "Date",
      field: "payment_date",
      valueFormatter: (p) => formatDate(p.value as string),
      minWidth: 100,
      maxWidth: 120,
    },
    { 
      headerName: "Invoice", 
      field: "invoice_id",
      minWidth: 100,
      maxWidth: 150,
    },
    { 
      headerName: "Transaction", 
      field: "transaction_id",
      minWidth: 120,
      maxWidth: 180,
    },
    { 
      headerName: "Membership", 
      field: "membership",
      minWidth: 100,
      maxWidth: 150,
    },
    { 
      headerName: "Gateway", 
      field: "payment_gateway",
      minWidth: 100,
      maxWidth: 120,
    },
    { 
      headerName: "Type", 
      field: "payment_type",
      minWidth: 80,
      maxWidth: 120,
    },
    {
      headerName: "Status",
      field: "transaction_status",
      cellRenderer: StatusBadge,
      minWidth: 100,
      maxWidth: 120,
    },
    {
      headerName: "Amount",
      field: "amount",
      valueFormatter: (p) => currency(p.value as any),
      minWidth: 100,
      maxWidth: 120,
    },
  ];

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen mx-auto max-w-[80rem] bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Transaction History
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          View your payments and subscription transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <p className="text-xs text-gray-500">Total Records</p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
            {filtered?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
            {currency(totalAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500">Status Overview</p>
          <p className="text-xs sm:text-sm text-gray-700">Filtered by your account</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search transactions, invoice, gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 lg:w-96 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="ag-theme-alpine overflow-hidden" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            theme="legacy"
            rowData={filtered}
            columnDefs={colDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
              minWidth: 100,
              maxWidth: 200,
            }}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            overlayLoadingTemplate={'<span class="ag-overlay-loading-center"><span class="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span></span>'}
            loadingOverlayComponentParams={{}}
            suppressCellFocus={true}
            domLayout="normal"
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={false}
            suppressRowVirtualisation={false}
            rowHeight={40}
            headerHeight={40}
          />
        </div>
        {isLoading && (
          <div className="p-3 text-xs sm:text-sm text-gray-600">
            <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isError && (
          <div className="p-3 text-xs sm:text-sm text-red-600">
            Failed to load transactions.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
