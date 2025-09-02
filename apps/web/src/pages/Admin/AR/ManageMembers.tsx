import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../../styles/ag-grid-custom.css";

const mockMembers = [
  {
    id: 1,
    username: "kushalsolanki.001@gmail.com",
    email: "kushalsolanki.001@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Kushal",
    profileDisplayName: "Kushal Solanki",
    joinedDate: "August 20, 2025",
    avatar: null,
  },
  {
    id: 2,
    username: "Sudheerksr",
    email: "sudheerksr234@gmail.com",
    memberPlan: "AP",
    status: "Active",
    firstName: "Sudheer",
    profileDisplayName: "Sudheer Reddy",
    joinedDate: "August 17, 2025",
    avatar: null,
  },
  {
    id: 3,
    username: "edisonrenu@gmail.com",
    email: "edisonrenu@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Renu",
    profileDisplayName: "Renu Edison",
    joinedDate: "August 16, 2025",
    avatar: null,
  },
  {
    id: 4,
    username: "girishp.iitb@gmail.com",
    email: "girishp.iitb@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Girish",
    profileDisplayName: "Girish",
    joinedDate: "August 13, 2025",
    avatar: null,
  },
  {
    id: 5,
    username: "vaibhavs@orowealth.com",
    email: "vaibhavs@orowealth.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vaibhav",
    profileDisplayName: "Vaibhav Shah",
    joinedDate: "August 13, 2025",
    avatar: null,
  },
  {
    id: 6,
    username: "vinayagarwal88@gmail.com",
    email: "vinayagarwal88@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vinay",
    profileDisplayName: "Vinay Agarwal",
    joinedDate: "August 9, 2025",
    avatar: null,
  },
  {
    id: 7,
    username: "lkbansal00@gmail.com",
    email: "lkbansal00@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Laxmi Kant",
    profileDisplayName: "Laxmi Kant Bansal",
    joinedDate: "August 8, 2025",
    avatar: null,
  },
  {
    id: 8,
    username: "vishalsethia23@gmail.com",
    email: "vishalsethia23@gmail.com",
    memberPlan: "AP",
    status: "Active",
    firstName: "Vishal",
    profileDisplayName: "Vishal sethia",
    joinedDate: "August 7, 2025",
    avatar: null,
  },
  {
    id: 9,
    username: "vedantmaheshwaricima@gmail.com",
    email: "vedantmaheshwaricima@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vedant",
    profileDisplayName: "Vedant Maheswari",
    joinedDate: "August 5, 2025",
    avatar: null,
  },
  {
    id: 10,
    username: "ranjeetsingh.crpf@gmail.com",
    email: "ranjeetsingh.crpf@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Ranjeet",
    profileDisplayName: "Ranjeet Singh",
    joinedDate: "August 4, 2025",
    avatar: null,
  },
  {
    id: 11,
    username: "ranjeetsingh.crpf@gmail.com",
    email: "ranjeetsingh.crpf@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Ranjeet",
    profileDisplayName: "Ranjeet Singh",
    joinedDate: "August 4, 2025",
    avatar: null,
  },
];

const AvatarRenderer = (params: any) => {
  const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "U");
  return (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
      {getInitial(params.data.firstName)}
    </div>
  );
};

const PlanBadgeRenderer = (params: any) => {
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "F": return "bg-pink-500";
      case "AP": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  return (
    <div className={`w-8 h-8 rounded-full ${getPlanColor(params.value)} flex items-center justify-center text-white text-xs font-medium`}>
      {params.value}
    </div>
  );
};

const StatusBadgeRenderer = (params: any) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {params.value}
  </span>
);

const ActionsRenderer = () => {
  return (
    <div className="flex items-center space-x-1">
      <button className="p-1 text-gray-600 hover:text-blue-600 rounded" title="View Details"><Eye size={16} /></button>
      <button className="p-1 text-gray-600 hover:text-blue-600 rounded" title="Edit"><Edit size={16} /></button>
      <button className="p-1 text-gray-600 hover:text-blue-600 rounded" title="Delete"><Trash2 size={16} /></button>
    </div>
  );
};

import AddMemberModal from "../../../components/admin/AddMemberModal";

const MemberManagementDashboard = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Select Plans");
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const [colDefs] = useState<ColDef[]>([
    { headerName: "", field: "select", checkboxSelection: true, headerCheckboxSelection: true, width: 50 },
    { headerName: "Avatar", field: "avatar", cellRenderer: AvatarRenderer, width: 80, sortable: false, filter: false },
    { headerName: "Username", field: "username", flex: 2 },
    { headerName: "Email Address", field: "email", flex: 3 },
    { headerName: "Member Plan", field: "memberPlan", cellRenderer: PlanBadgeRenderer, flex: 1 },
    { headerName: "Status", field: "status", cellRenderer: StatusBadgeRenderer, flex: 1 },
    { headerName: "First Name", field: "firstName", flex: 1 },
    { headerName: "Profile Display Name", field: "profileDisplayName", flex: 2 },
    { headerName: "Joined Date", field: "joinedDate", flex: 2 },
    { headerName: "Actions", field: "actions", cellRenderer: ActionsRenderer, width: 120, sortable: false, filter: false },
  ]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRowData(mockMembers);
      setLoading(false);
    }, 500);
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    gridRef.current = params;
  };

  useEffect(() => {
    if (gridRef.current?.api) {
      const planFilter = selectedPlan !== "Select Plans" ? {
        memberPlan: {
          filterType: 'text',
          type: 'equals',
          filter: selectedPlan,
        }
      } : null;

      const statusFilter = selectedStatus !== "Select Status" ? {
        status: {
          filterType: 'text',
          type: 'equals',
          filter: selectedStatus,
        }
      } : null;

      const combinedFilter = { ...planFilter, ...statusFilter };
      gridRef.current.api.setFilterModel(combinedFilter);
      gridRef.current.api.onFilterChanged();
    }
  }, [selectedPlan, selectedStatus]);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(searchTerm);
    }
  }, [searchTerm]);

  const onPageSizeChanged = (newPageSize: number) => {
    if(gridRef.current?.api){
        gridRef.current.api.paginationSetPageSize(newPageSize);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm max-w-[80rem] mx-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage Members
          </h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>

        <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Select Plans</option>
              <option>F</option>
              <option>AP</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            pagination={true}
            paginationPageSize={10}
            onGridReady={onGridReady}
            rowSelection="multiple"
            suppressRowClickSelection={true}
          />
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                onChange={(e) => onPageSizeChanged(Number(e.target.value))}
                defaultValue={10}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">members</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementDashboard;
