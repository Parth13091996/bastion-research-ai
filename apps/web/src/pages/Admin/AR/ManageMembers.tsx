import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../../styles/ag-grid-custom.css";
import EditRowModal from "@/components/admin/EditRowModal";
import AddMemberModal from "../../../components/admin/AddMemberModal";

// Avatar Renderer
const AvatarRenderer = (params: any) => {
  const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "U");
  return (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
      {getInitial(params.data.first_name || params.data.username)}
    </div>
  );
};

// Status Badge Renderer
const StatusBadgeRenderer = (params: any) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {params.value || "Active"}
  </span>
);

// Actions Renderer
const ActionsRenderer = (params: any) => (
  <div className="flex items-center space-x-1">
    <button
      className="p-1 text-gray-600 hover:text-blue-600 rounded"
      title="Edit"
      onClick={() => params.context?.openEdit?.(params.data)}
    >
      <Edit size={16} />
    </button>
    <button
      className="p-1 text-gray-600 hover:text-red-600 rounded"
      title="Delete"
      onClick={() => params.context?.deleteUser?.(params.data.id)}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const MemberManagementDashboard = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading: loading } = useQuery({
    queryKey: ["users"],
    queryFn: () => axiosInstance.get("/api/users").then((res) => res.data),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      axiosInstance.put(`/api/users/${payload.id}`, payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/api/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const [colDefs] = useState<ColDef[]>([
    {
      headerName: "",
      field: "select",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
    },
    { headerName: "Avatar", field: "avatar", cellRenderer: AvatarRenderer, width: 80, sortable: false, filter: false },
    { headerName: "Username", field: "username", flex: 2 },
    { headerName: "Email Address", field: "email", flex: 3 },
    { headerName: "Role", field: "role", flex: 1 },
    { headerName: "Status", field: "status", cellRenderer: StatusBadgeRenderer, flex: 1 },
    { headerName: "First Name", field: "first_name", flex: 1 },
    { headerName: "Last Name", field: "last_name", flex: 1 },
    { headerName: "Actions", field: "actions", cellRenderer: ActionsRenderer, width: 120, sortable: false, filter: false },
  ]);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const openEdit = (row: any) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const saveEdit = (values: any) => {
    if (!editRow) return;
    updateMutation.mutate({
      id: editRow.id,
      body: {
        username: values.username,
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
      },
    });
    setEditOpen(false);
  };

  const deleteUser = (id: string) => deleteMutation.mutate(id);

  const onGridReady = (params: GridReadyEvent) => {
    gridRef.current = params;
  };

  useEffect(() => {
    if (gridRef.current?.api) {
      const statusFilter =
        selectedStatus !== "Select Status"
          ? {
              status: { filterType: "text", type: "equals", filter: selectedStatus },
            }
          : null;
      const combinedFilter = { ...statusFilter };
      gridRef.current.api.setFilterModel(combinedFilter);
      gridRef.current.api.onFilterChanged();
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(searchTerm);
    }
  }, [searchTerm]);

  const onPageSizeChanged = (newPageSize: number) => {
    if (gridRef.current?.api) {
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
      <div className="bg-white rounded-lg shadow-sm max-w-[90rem] mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Members</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>

        <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 w-full md:w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option>Select Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <div className="ag-theme-alpine w-full" style={{ height: 600 }}>
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
              rowHeight={65} // Increased row height
              headerHeight={50} // Increased header height
              onGridReady={onGridReady}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              context={{ openEdit, deleteUser }}
              domLayout="autoHeight"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              onChange={(e) => onPageSizeChanged(Number(e.target.value))}
              defaultValue={10}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>members</span>
          </div>
        </div>

        <EditRowModal
          open={editOpen}
          title="Edit Member"
          fields={[
            { name: "username", label: "Username" },
            { name: "email", label: "Email", type: "email" },
            { name: "first_name", label: "First Name" },
            { name: "last_name", label: "Last Name" },
          ]}
          initialValues={editRow}
          onClose={() => setEditOpen(false)}
          onSave={saveEdit}
          saving={updateMutation.isPending}
        />
      </div>
    </div>
  );
};

export default MemberManagementDashboard;
