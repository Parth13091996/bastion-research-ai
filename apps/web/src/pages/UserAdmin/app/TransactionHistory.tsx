import React, { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyPaymentHistory } from "@/api/membership-api";
import { useAuth } from "@/contexts/AuthContext";
import useConstants from "@/hooks/use-constants";

const TransactionHistory: React.FC = () => {
  const {
    TransactionHistoryConstants,
    TransactionHistoryColDefs,
    TransactionHistoryCurrency,
  } = useConstants();
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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen mx-auto max-w-[80rem] bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {TransactionHistoryConstants.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {TransactionHistoryConstants.pageDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <p className="text-xs text-gray-500">
            {TransactionHistoryConstants.labels.totalRecords}
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
            {filtered?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <p className="text-xs text-gray-500">
            {TransactionHistoryConstants.labels.totalAmount}
          </p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
            {TransactionHistoryCurrency(
              totalAmount,
              TransactionHistoryConstants.currency
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder={TransactionHistoryConstants.search.placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 lg:w-96 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div
          className="ag-theme-alpine overflow-hidden"
          style={{
            height: TransactionHistoryConstants.grid.height,
            width: "100%",
          }}
        >
          <AgGridReact
            theme="legacy"
            rowData={filtered}
            columnDefs={TransactionHistoryColDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
              minWidth: 100,
              maxWidth: 200,
            }}
            pagination={true}
            paginationPageSize={
              TransactionHistoryConstants.grid.pagination.defaultPageSize
            }
            paginationPageSizeSelector={
              TransactionHistoryConstants.grid.pagination.pageSizeOptions
            }
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center"><span class="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span></span>'
            }
            loadingOverlayComponentParams={{}}
            suppressCellFocus={true}
            domLayout="normal"
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={false}
            suppressRowVirtualisation={false}
            rowHeight={TransactionHistoryConstants.grid.rowHeight}
            headerHeight={TransactionHistoryConstants.grid.headerHeight}
          />
        </div>
        {isLoading && (
          <div className="p-3 text-xs sm:text-sm text-gray-600">
            <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isError && (
          <div className="p-3 text-xs sm:text-sm text-red-600">
            {TransactionHistoryConstants.messages.loadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
