import React, { useState, useMemo } from "react";
import { formatAdminDate } from "@/lib/utils";
import { Search, Plus, Eye, FileText, Trash2, X, Edit } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confirm } from "@/utils/confirm";
import { getSubscriptions, getPaymentHistory, getMembershipPlans, cancelSubscription } from "@/api/membership-api";
import { ICellRendererParams } from "ag-grid-community";

interface SubscriptionRow {
  membership: string;
  user: string;
  name: string;
  startDate: string;
  expiryNextRenewal: string;
  amount: string | number;
  paymentType: string;
  transactionId: string;
  status: string;
  membership_id: string | number;
  user_role?: string | null;
}

interface ActivityRow {
  invoiceId: string;
  membership: string;
  username: string;
  name: string;
  paymentDate: string;
  amount: string | number;
  paymentType: string;
  status: string;
}

interface RawPlan {
  plan_id: string | number;
  plan_name: string;
}

interface RawSubscriptionRow {
  membership_id: string | number;
  user_id: string;
  name?: string;
  start_date?: string;
  expire_next_renewal?: string;
  amount: string | number;
  currency?: string;
  payment_type?: string;
  transaction_id: string;
  status?: string;
  user_role?: string;
}

interface RawActivityRow {
  invoice_id?: string;
  plan_id?: string | number;
  user_email?: string;
  payer_email?: string;
  user_id?: string;
  payment_date?: string;
  created_at?: string;
  amount: string | number;
  currency?: string;
  payment_type?: string;
  payment_gateway?: string;
  transaction_status?: string;
}

const SubscriptionGrid = ({
  rowData,
  columnDefs,
}: {
  rowData: SubscriptionRow[] | ActivityRow[];
  columnDefs: ColDef[];
}) => {
  return (
    <div
      className="rounded-md border bg-white ag-theme-alpine"
      style={{ height: 600, width: "100%" }}
    >
      <AgGridReact
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
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
  );
};

const SubscriptionsActionsRenderer = (params: ICellRendererParams<SubscriptionRow>) => (
  <div className="flex items-center space-x-2">
    <button
      className="text-blue-600 hover:text-blue-800 p-1"
      title="Edit"
      onClick={() => params?.context?.edit?.(params?.data)}
    >
      <Edit size={16} className="text-blue-600" />
    </button>
    <button
      className="text-red-600 hover:text-red-800 p-1"
      title="Cancel"
      onClick={() => params?.context?.cancel?.(params?.data)}
    >
      <X size={16} />
    </button>
  </div>
);

const ActivitiesActionsRenderer = (params: ICellRendererParams<ActivityRow>) => (
  <div className="flex items-center space-x-2">
    <button
      className="text-blue-600 hover:text-blue-800 p-1"
      title="Edit"
      onClick={() => params?.context?.edit?.(params?.data)}
    >
      <Edit size={16} className="text-blue-600" />
    </button>
    <button
      title="View Invoice"
      className="text-blue-600 hover:text-blue-800 p-1"
    >
      <Eye size={16} />
    </button>
    <button
      title="View Details"
      className="text-blue-600 hover:text-blue-800 p-1"
    >
      <FileText size={16} />
    </button>
    <button title="Delete" className="text-red-600 hover:text-red-800 p-1">
      <Trash2 size={16} />
    </button>
  </div>
);


const StatusCellRenderer = ({ value }: { value: string }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs ${
      value === "Success" || value === "Active"
        ? "bg-green-100 text-green-800"
        : value === "Failed"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {value}
  </span>
);

const ManageSubscriptions = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const queryClient = useQueryClient();
  const { data: subsRaw } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => getSubscriptions(),
  });
  const { data: activitiesRaw } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => getPaymentHistory(),
  });
  const { data: plansRaw } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => getMembershipPlans(),
  });



  const planMap: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    ((plansRaw as RawPlan[]) || []).forEach((p) => {
      m[String(p.plan_id)] = p.plan_name;
    });
    return m;
  }, [plansRaw]);

  const cancelMutation = useMutation({
    mutationFn: (payload: SubscriptionRow) =>
      cancelSubscription(String(payload.membership_id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  const mapSubscriptions = (rows: RawSubscriptionRow[]): SubscriptionRow[] => {
    return (rows || []).map((r) => ({
      membership:
        planMap[String(r.membership_id)] || r.name || String(r.membership_id),
      user: r.user_id,
      name: r.name || "",
      startDate: r.start_date ? formatAdminDate(r.start_date) : "",
      expiryNextRenewal: r.expire_next_renewal ? formatAdminDate(r.expire_next_renewal) : "",
      amount:
        typeof r.amount === "number"
          ? new Intl.NumberFormat("en-IN", {
              maximumFractionDigits: 2,
            }).format(r.amount) +
            (r.currency ? ` ${r.currency}` : "")
          : r.amount,
      paymentType: r.payment_type || "",
      transactionId: r.transaction_id || "",
      status: r.status || "Active",
      membership_id: r.membership_id,
      user_role: r.user_role,
    }));
  };

  const mapActivities = (rows: RawActivityRow[]): ActivityRow[] => {
    return (rows || []).map((r) => ({
      invoiceId: r.invoice_id || "",
      membership: planMap[String(r.plan_id)] || String(r.plan_id || ""),
      username: r.user_email || r.payer_email || r.user_id || "",
      name: r.payer_email || "",
      paymentDate: r.payment_date
        ? formatAdminDate(r.payment_date)
        : r.created_at
          ? formatAdminDate(r.created_at)
          : "",
      amount:
        typeof r.amount === "number"
          ? new Intl.NumberFormat("en-IN", {
              maximumFractionDigits: 2,
            }).format(r.amount) +
            (r.currency ? ` ${r.currency}` : "")
          : r.amount,
      paymentType: r.payment_type || r.payment_gateway || "",
      status: r.transaction_status || "",
    }));
  };

  const subscriptionsData = mapSubscriptions(subsRaw || []);
  const dropOffData = subscriptionsData.filter((r) => r.user_role === "drop_off");
  const activeSubscriptionsData = subscriptionsData.filter((r) => r.user_role !== "drop_off");

  const allActivitiesData = mapActivities(activitiesRaw || []);
  const upcomingSubscriptionsData = activeSubscriptionsData.filter((r) => {
    if (!r.expiryNextRenewal) return false;
    const d = new Date(r.expiryNextRenewal);
    return d.getTime() > Date.now();
  });

  const subscriptionsColDefs: ColDef[] = [
    { headerName: "Membership", field: "membership" },
    { headerName: "User ID", field: "user" },
    { headerName: "Name", field: "name" },
    { headerName: "Start Date", field: "startDate" },
    { headerName: "Expiry/Next Renewal", field: "expiryNextRenewal" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Payment Type", field: "paymentType" },
    { headerName: "Transaction ID", field: "transactionId" },
    { headerName: "Status", field: "status", cellRenderer: StatusCellRenderer },
    {
      headerName: "Actions",
      cellRenderer: SubscriptionsActionsRenderer,
      filter: false,
      sortable: false,
    },
  ];

  const activitiesColDefs: ColDef[] = [
    { headerName: "Invoice ID", field: "invoiceId" },
    { headerName: "Membership", field: "membership" },
    { headerName: "Username", field: "username" },
    { headerName: "Name", field: "name" },
    { headerName: "Payment Date", field: "paymentDate" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Payment Type", field: "paymentType" },
    { headerName: "Status", field: "status", cellRenderer: StatusCellRenderer },
    {
      headerName: "Actions",
      cellRenderer: ActivitiesActionsRenderer,
      filter: false,
      sortable: false,
    },
  ];

  const upcomingColDefs: ColDef[] = [
    { headerName: "Membership", field: "membership" },
    { headerName: "User ID", field: "user" },
    { headerName: "Name", field: "name" },
    { headerName: "Start Date", field: "startDate" },
    { headerName: "Expiry/Next Renewal", field: "expiryNextRenewal" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Payment Type", field: "paymentType" },
  ];

  const filteredData = useMemo(() => {
    let data: unknown[] =
      activeTab === "subscriptions"
        ? activeSubscriptionsData
        : activeTab === "drop_off"
          ? dropOffData
          : activeTab === "activities"
            ? allActivitiesData
            : upcomingSubscriptionsData;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      data = data.filter((item) =>
        Object.values(item as object).some((value) =>
          value?.toString().toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
    if (membershipFilter)
      data = (data as SubscriptionRow[]).filter((item) => item.membership === membershipFilter);
    if (statusFilter && activeTab !== "upcoming")
      data = (data as SubscriptionRow[]).filter((item) => item.status === statusFilter);
    return data as (SubscriptionRow[] | ActivityRow[]);
  }, [
    activeTab,
    searchTerm,
    membershipFilter,
    statusFilter,
    activeSubscriptionsData,
    dropOffData,
    allActivitiesData,
    upcomingSubscriptionsData,
  ]);

  const cancel = async (row: SubscriptionRow) => {
    const ok = await confirm({
      title: "Cancel subscription?",
      description: `This will cancel membership ${row?.membership || ""}.`,
      confirmText: "Cancel",
      tone: "danger",
    });
    if (ok) cancelMutation.mutate(row);
  };

  const edit = (row: SubscriptionRow | ActivityRow) => {
    // TODO: Implement edit functionality - could open a modal or navigate to edit page
    // For now, just log the row data for demonstration
  };

  const renderCurrentTable = () => {
    switch (activeTab) {
      case "subscriptions":
        return (
          <SubscriptionGrid
            rowData={filteredData as SubscriptionRow[]}
            columnDefs={subscriptionsColDefs}
          />
        );
      case "drop_off":
        return (
          <SubscriptionGrid
            rowData={filteredData as SubscriptionRow[]}
            columnDefs={subscriptionsColDefs}
          />
        );
      case "activities":
        return (
          <SubscriptionGrid
            rowData={filteredData as ActivityRow[]}
            columnDefs={activitiesColDefs}
          />
        );
      case "upcoming":
        return (
          <SubscriptionGrid
            rowData={filteredData as SubscriptionRow[]}
            columnDefs={upcomingColDefs}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className=" mx-auto bg-gray-50 min-h-screen">
      <div className="flex p-6 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Subscriptions
        </h1>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Memberships</option>
            <option value="Bastion CORE Plan">Bastion CORE Plan</option>
            <option value="Bastion CORE Annual Plan">
              Bastion CORE Annual Plan
            </option>
            <option value="Research Hub Plan">Research Hub Plan</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg mb-6">
        <div className="flex justify-center p-6 border-b">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${activeTab === "subscriptions" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("drop_off")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-l border-gray-300 ${activeTab === "drop_off" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Drop Off
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-l border-r border-gray-300 ${activeTab === "activities" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              All Activities
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${activeTab === "upcoming" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Upcoming Subscriptions
            </button>
          </div>
        </div>
        <div className="p-4">
          <div
            className="rounded-md border bg-white ag-theme-alpine"
            style={{ height: 600, width: "100%" }}
          >
            <AgGridReact
              theme="legacy"
              rowData={filteredData}
              columnDefs={
                activeTab === "subscriptions"
                  ? subscriptionsColDefs
                  : activeTab === "activities"
                    ? activitiesColDefs
                    : upcomingColDefs
              }
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
              }}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              context={{ cancel, edit }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptions;
