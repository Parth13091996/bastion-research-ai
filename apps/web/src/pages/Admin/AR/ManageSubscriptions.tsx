import React, { useState, useMemo } from "react";
import { Search, Plus, Eye, FileText, Trash2, X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";

const SubscriptionGrid = ({ rowData, columnDefs }: { rowData: any[], columnDefs: ColDef[] }) => {
    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
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

const SubscriptionsActionsRenderer = (params: any) => (
    <button
      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center gap-1"
      onClick={() => params?.context?.cancel?.(params?.data)}
    >
      <X size={12} />
      Cancel
    </button>
);

const ActivitiesActionsRenderer = () => (
    <div className="flex space-x-1">
        <button title="View Invoice" className="p-1 text-gray-600 hover:text-blue-600"><Eye size={14} /></button>
        <button title="View Details" className="p-1 text-gray-600 hover:text-blue-600"><FileText size={14} /></button>
        <button title="Delete" className="p-1 text-gray-600 hover:text-red-600"><Trash2 size={14} /></button>
    </div>
);

const StatusCellRenderer = ({ value }: { value: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs ${
        value === "Success" || value === "Active" ? "bg-green-100 text-green-800"
        : value === "Failed" ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800"
    }`}>
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
        queryFn: () => axiosInstance.get('/api/subscriptions').then(res => res.data)
    });
    const { data: activitiesRaw } = useQuery({
        queryKey: ["payment-history"],
        queryFn: () => axiosInstance.get('/api/payment-history').then(res => res.data)
    });
    const { data: plansRaw } = useQuery({
        queryKey: ["membership-plans"],
        queryFn: () => axiosInstance.get('/api/membership-plans').then(res => res.data)
    });

    const planMap: Record<string, string> = useMemo(() => {
        const m: Record<string, string> = {};
        (plansRaw || []).forEach((p: any) => { m[String(p.plan_id)] = p.plan_name; });
        return m;
    }, [plansRaw]);

    const cancelMutation = useMutation({
        mutationFn: (payload: any) => axiosInstance.delete(`/api/subscriptions/${payload.membership_id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
    });

    const mapSubscriptions = (rows: any[]) => {
        return (rows || []).map((r: any) => ({
            membership: planMap[String(r.membership_id)] || r.name || String(r.membership_id),
            user: r.user_id,
            name: r.name || "",
            startDate: r.start_date ? new Date(r.start_date).toLocaleDateString() : "",
            expiryNextRenewal: r.expire_next_renewal ? new Date(r.expire_next_renewal).toLocaleDateString() : "",
            amount: typeof r.amount === 'number' ? `${r.amount} ${r.currency || ''}`.trim() : r.amount,
            paymentType: r.payment_type || "",
            transactionId: r.transaction_id || "",
            status: r.status || "Active",
            membership_id: r.membership_id,
        }));
    };

    const mapActivities = (rows: any[]) => {
        return (rows || []).map((r: any) => ({
            invoiceId: r.invoice_id || "",
            membership: planMap[String(r.plan_id)] || String(r.plan_id || ""),
            username: r.user_email || r.payer_email || r.user_id || "",
            name: r.payer_email || "",
            paymentDate: r.payment_date ? new Date(r.payment_date).toLocaleDateString() : (r.created_at ? new Date(r.created_at).toLocaleDateString() : ""),
            amount: typeof r.amount === 'number' ? `${r.amount} ${r.currency || ''}`.trim() : r.amount,
            paymentType: r.payment_type || r.payment_gateway || "",
            status: r.transaction_status || "",
        }));
    };

    const subscriptionsData = mapSubscriptions(subsRaw || []);
    const allActivitiesData = mapActivities(activitiesRaw || []);
    const upcomingSubscriptionsData = subscriptionsData.filter((r: any) => {
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
        { headerName: "Actions", cellRenderer: SubscriptionsActionsRenderer, filter: false, sortable: false },
    ];

    const activitiesColDefs: ColDef[] = [
        { headerName: "Invoice ID", field: "invoiceId" }, { headerName: "Membership", field: "membership" },
        { headerName: "Username", field: "username" }, { headerName: "Name", field: "name" },
        { headerName: "Payment Date", field: "paymentDate" }, { headerName: "Amount", field: "amount" },
        { headerName: "Payment Type", field: "paymentType" },
        { headerName: "Status", field: "status", cellRenderer: StatusCellRenderer },
        { headerName: "Actions", cellRenderer: ActivitiesActionsRenderer, filter: false, sortable: false },
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
        let data = activeTab === 'subscriptions' ? subscriptionsData : activeTab === 'activities' ? allActivitiesData : upcomingSubscriptionsData;
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            data = data.filter((item: any) => Object.values(item).some((value: any) => value?.toString().toLowerCase().includes(lowerCaseSearchTerm)));
        }
        if (membershipFilter) data = data.filter((item: any) => item.membership === membershipFilter);
        if (statusFilter && activeTab !== "upcoming") data = data.filter((item: any) => item.status === statusFilter);
        return data;
    }, [activeTab, searchTerm, membershipFilter, statusFilter, subscriptionsData, allActivitiesData, upcomingSubscriptionsData]);

    const cancel = (row: any) => cancelMutation.mutate(row);

    const renderCurrentTable = () => {
        switch (activeTab) {
            case "subscriptions": return <SubscriptionGrid rowData={filteredData} columnDefs={subscriptionsColDefs} />;
            case "activities": return <SubscriptionGrid rowData={filteredData} columnDefs={activitiesColDefs} />;
            case "upcoming": return <SubscriptionGrid rowData={filteredData} columnDefs={upcomingColDefs} />;
            default: return null;
        }
    };

    return (
        <div className=" mx-auto max-w-[80rem]  bg-gray-50 min-h-screen">
            <div className="flex p-6 justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Subscriptions</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={16} /> Add Subscription
                </button>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                    </div>
                    <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Memberships</option>
                        <option value="Freemium">Freemium</option>
                        <option value="Annual Plan">Annual Plan</option>
                        <option value="Bastion Research Core">Bastion Research Core</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                        <button onClick={() => setActiveTab("subscriptions")} className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${activeTab === "subscriptions" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                            Subscriptions
                        </button>
                        <button onClick={() => setActiveTab("activities")} className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-l border-r border-gray-300 ${activeTab === "activities" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                            All Activities
                        </button>
                        <button onClick={() => setActiveTab("upcoming")} className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${activeTab === "upcoming" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                            Upcoming Subscriptions
                        </button>
                    </div>
                </div>
                <div className="p-4">
                  <div className="ag-theme-alpine">
                    <AgGridReact
                      theme="legacy"
                      rowData={filteredData}
                      columnDefs={activeTab === 'subscriptions' ? subscriptionsColDefs : activeTab === 'activities' ? activitiesColDefs : upcomingColDefs}
                      defaultColDef={{ sortable: true, filter: true, resizable: true, flex: 1 }}
                      pagination={true}
                      paginationPageSize={10}
                      paginationPageSizeSelector={[10,25,50,100]}
                      context={{ cancel }}
                    />
                  </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSubscriptions;
