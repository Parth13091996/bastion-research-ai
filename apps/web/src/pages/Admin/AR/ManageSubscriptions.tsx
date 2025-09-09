import React, { useState, useMemo } from "react";
import { Search, Plus, Eye, FileText, Trash2, X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

// Mock Data
const subscriptionsData = [
    { id: 658, membership: "Freemium", username: "tharmamgmail.com", name: "RAJESH KANNATHARA", startDate: "August 24, 2024", expiryNextRenewal: "", amount: "0.00 INR", paymentType: "Manual", transactionId: "0", status: "Active" },
    { id: 657, membership: "Freemium", username: "learningappbgcmail.com", name: "Learning App", startDate: "August 24, 2024", expiryNextRenewal: "", amount: "0.00 INR", paymentType: "Manual", transactionId: "0", status: "Active" },
    { id: 656, membership: "Annual Plan", username: "shreyaanshacademylist@gmail.com", name: "Shreyaansh Limbachiya", startDate: "August 22, 2024", expiryNextRenewal: "August 22, 2025", amount: "15,890.00 INR", paymentType: "Manual", transactionId: "", status: "Active" },
    { id: 655, membership: "Freemium", username: "kuleshdeekshit190@gmail.com", name: "Kulesh Swami", startDate: "August 20, 2024", expiryNextRenewal: "", amount: "0.00 INR", paymentType: "Manual", transactionId: "0", status: "Active" },
];
const allActivitiesData = [
    { invoiceId: "BIL-205", membership: "Annual Plan", username: "shreyaanshacademylist@gmail.com", name: "Shreyaansh Limbachiya", paymentDate: "August 22, 2024", amount: "18,750.20 INR", paymentType: "Manual Semi Automatic", status: "Success" },
    { invoiceId: "BIL-204", membership: "Annual Plan", username: "Sudheena", name: "Sudheen Reddy", paymentDate: "August 17, 2024", amount: "18,750.20 INR", paymentType: "Razorpay Semi Automatic", status: "Success" },
    { invoiceId: "BIL-204", membership: "Bastion Research Core", username: "khalfasolutions@gmail.com", name: "Khalfaso Hryanshi", paymentDate: "August 11, 2024", amount: "4,000.00 INR", paymentType: "Razorpay Auto Debit", status: "Failed" },
];
const upcomingSubscriptionsData = [
    { id: 194, membership: "Annual Plan", username: "Cabochan", name: "Anuj Bhartiya", startDate: "August 30, 2024", expiryNextRenewal: "August 30, 2025", amount: "15,890.00 INR", paymentType: "Razorpay Semi Automatic" },
    { id: 195, membership: "Annual Plan", username: "Jeegat", name: "Naveen Rawat", startDate: "August 30, 2024", expiryNextRenewal: "August 30, 2025", amount: "15,890.00 INR", paymentType: "Razorpay Semi Automatic" },
    { id: 196, membership: "Annual Plan", username: "Atuj", name: "Atuj Mehra", startDate: "September 3, 2024", expiryNextRenewal: "September 3, 2025", amount: "15,890.00 INR", paymentType: "Manual" },
];

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

const SubscriptionsActionsRenderer = () => (
    <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center gap-1">
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

    const subscriptionsColDefs: ColDef[] = [
        { headerName: "ID", field: "id" }, { headerName: "Membership", field: "membership" },
        { headerName: "Username", field: "username" }, { headerName: "Name", field: "name" },
        { headerName: "Start Date", field: "startDate" }, { headerName: "Expiry/Next Renewal", field: "expiryNextRenewal" },
        { headerName: "Amount", field: "amount" }, { headerName: "Payment Type", field: "paymentType" },
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
        { headerName: "ID", field: "id" }, { headerName: "Membership", field: "membership" },
        { headerName: "Username", field: "username" }, { headerName: "Name", field: "name" },
        { headerName: "Start Date", field: "startDate" }, { headerName: "Expiry/Next Renewal", field: "expiryNextRenewal" },
        { headerName: "Amount", field: "amount" }, { headerName: "Payment Type", field: "paymentType" },
    ];

    const filteredData = useMemo(() => {
        let data = activeTab === 'subscriptions' ? subscriptionsData : activeTab === 'activities' ? allActivitiesData : upcomingSubscriptionsData;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            data = data.filter(item => Object.values(item).some(value => value?.toString().toLowerCase().includes(lowerCaseSearchTerm)));
        }
        if (membershipFilter) data = data.filter(item => item.membership === membershipFilter);
        if (statusFilter && activeTab !== "upcoming") data = data.filter(item => item.status === statusFilter);

        return data;
    }, [activeTab, searchTerm, membershipFilter, statusFilter]);

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
                <div className="p-4">{renderCurrentTable()}</div>
            </div>
        </div>
    );
};

export default ManageSubscriptions;
