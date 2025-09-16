import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Static mock data removed; using API instead

const AvatarRenderer = (params: any) => {
  const getInitial = (name: string) =>
    name ? name.charAt(0).toUpperCase() : "U";
  // Add null checks for params and params.data
  const displayName = params?.data?.first_name ?? params?.data?.username ?? "";
  return (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
      {getInitial(displayName)}
    </div>
  );
};

// Plan badge removed; role/status will be shown instead

const StatusBadgeRenderer = (params: any) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {params?.value || "active"}
  </span>
);

const ActionsRenderer = (params: any) => (
  <div className="flex items-center space-x-1">
    <button
      className="p-1 text-gray-600 hover:text-blue-600 rounded"
      title="Edit"
      onClick={() => {
        params?.context?.openEdit?.(params?.data);
      }}
      disabled={!params?.context?.openEdit || !params?.data}
    >
      <Edit size={16} />
    </button>
    <button
      className="p-1 text-gray-600 hover:text-red-600 rounded"
      title="Delete"
      onClick={() => params?.context?.deleteUser?.(params?.data?.id)}
      disabled={!params?.context?.deleteUser || !params?.data?.id}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const MemberManagementDashboard = () => {
  const queryClient = useQueryClient();
  const {
    data: rowData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      axiosInstance.get(endpoints.users.base).then((res) => res.data),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const setIsModalOpen = useModalStore((s) => s.set);

  const gridRef = useRef<AgGridReact>(null);
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      axiosInstance.put(endpoints.users.byId(payload.id), payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.users.byId(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const [colDefs] = useState<ColDef[]>([
    { headerName: "", field: "select", width: 50 },
    {
      headerName: "Avatar",
      field: "avatar",
      cellRenderer: AvatarRenderer,
      width: 80,
      sortable: false,
      filter: false,
    },
    { headerName: "Username", field: "username", flex: 2 },
    { headerName: "Email Address", field: "email", flex: 3 },
    { headerName: "Role", field: "role", flex: 1 },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: StatusBadgeRenderer,
      flex: 1,
    },
    { headerName: "First Name", field: "first_name", flex: 1 },
    { headerName: "Last Name", field: "last_name", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionsRenderer,
      width: 120,
      sortable: false,
      filter: false,
    },
  ]);
  const openEditMember = useEditMemberStore((s) => s.open);
  const openEdit = (row: any) => {
    if (row) {
      openEditMember(row);
    }
  };
  // Updates are now handled inside EditMemberModal

  const deleteUser = (id: string) => {
    if (!id) return;
    deleteMutation.mutate(id);
  };

  const onGridReady = (params: GridReadyEvent) => {
    // Store the API reference directly
  };

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      const statusFilter =
        selectedStatus !== "Select Status"
          ? {
              status: {
                filterType: "text",
                type: "equals",
                filter: selectedStatus,
              },
            }
          : null;
      const combinedFilter = { ...statusFilter };
      gridRef.current.api.setFilterModel(combinedFilter);
      gridRef.current.api.onFilterChanged();
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption("quickFilterText", searchTerm);
    }
  }, [searchTerm]);

  const onPageSizeChanged = (newPageSize: number) => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption("paginationPageSize", newPageSize);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Failed to load members.</div>
      </div>
    );
  }

  // Add null check for rowData
  if (!rowData || !Array.isArray(rowData)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No member data available.</div>
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
          <button
            onClick={() => setIsModalOpen("addMember", true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>

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
            rowData={rowData ?? []}
            columnDefs={colDefs}
            theme="legacy"
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            onGridReady={onGridReady}
            rowSelection={{
              mode: "multiRow",
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: false,
            }}
            context={{ openEdit, deleteUser }}
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
      {/* EditMemberModal is rendered in ModalsLayout */}
    </div>
  );
};

export default MemberManagementDashboard;
