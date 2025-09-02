import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../../styles/ag-grid-custom.css";

const plansData = [
    {
      id: 5,
      name: "Freemium",
      type: "Free",
      priceAmount: 0,
      currency: "INR",
      duration: "-",
      members: 166,
      role: "ARMember",
    },
    {
      id: 4,
      name: "Bastion Research Core",
      type: "Paid",
      priceAmount: 4000,
      currency: "INR",
      duration: "3 months x 12 installments",
      members: 5,
      role: "ARMember",
    },
    {
      id: 2,
      name: "Annual Plan",
      type: "Paid",
      priceAmount: 15890,
      currency: "INR",
      duration: "12 months (One-time)",
      members: 49,
      role: "ARMember",
    },
];

const ActionsRenderer = (params: any) => {
    const handleEdit = () => console.log(`Edit plan ID: ${params.data.id}`);
    const handleDelete = () => console.log(`Delete plan ID: ${params.data.id}`);

    return (
        <div className="flex items-center space-x-2">
            <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-l transition-colors"
            title="Edit"
            >
            <Edit2 size={14} />
            </button>
            <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 rounded-r transition-colors"
            title="Delete"
            >
            <Trash2 size={14} />
            </button>
        </div>
    );
};

const PlanTypeRenderer = (params: any) => {
    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
                params.value === "Free"
                ? "bg-gray-100 text-gray-800"
                : "bg-blue-100 text-blue-800"
            }`}
        >
            {params.value}
        </span>
    );
};


const MembershipPlans = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        { headerName: "Plan ID", field: "id" },
        { headerName: "Plan Name", field: "name" },
        { headerName: "Plan Type", field: "type", cellRenderer: PlanTypeRenderer },
        { headerName: "Members", field: "members" },
        { headerName: "Wp Role", field: "role" },
        { headerName: "Price Amount", field: "priceAmount" },
        { headerName: "Currency", field: "currency" },
        { headerName: "Duration", field: "duration" },
        { headerName: "Actions", field: "actions", cellRenderer: ActionsRenderer, sortable: false, filter: false },
    ]);

    useEffect(() => {
        if(gridRef.current?.api) {
            gridRef.current.api.setQuickFilter(searchTerm);
        }
    }, [searchTerm]);

    const onGridReady = (params: GridReadyEvent) => {
        gridRef.current = params;
    };

    return (
        <div className="bg-gray-50 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[80rem] bg-white rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Manage Membership Plans
                </h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus size={16} />
                Add New Plan
                </button>
            </div>

            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-end">
                <div className="relative w-full sm:w-80">
                    <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                </div>
            </div>

            <div className="p-1 ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={plansData}
                    columnDefs={colDefs}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                        flex: 1,
                    }}
                    pagination={true}
                    paginationPageSize={10}
                    onGridReady={onGridReady}
                />
            </div>
            </div>
        </div>
    );
};

export default MembershipPlans;
