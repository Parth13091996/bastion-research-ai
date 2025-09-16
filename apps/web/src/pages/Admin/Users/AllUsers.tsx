import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import EditRowModal from "@/components/core/common/Modals/EditRowModal";

const AllUsers = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      axiosInstance.get(endpoints.users.base).then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      axiosInstance.put(endpoints.users.byId(payload.id), payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.users.byId(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

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
  const removeUser = (id: string) => deleteMutation.mutate(id);
  const ActionsRenderer = (params: any) => (
    <div className="flex gap-2">
      <button
        className="p-1 text-gray-600 hover:text-blue-600"
        onClick={() => params.context.openEdit(params.data)}
        title="Edit"
      >
        <Edit size={16} />
      </button>
      <button
        className="p-1 text-gray-600 hover:text-red-600"
        onClick={() => params.context.removeUser(params.data.id)}
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: "ID", field: "id" },
    { headerName: "Username", field: "username" },
    { headerName: "First Name", field: "first_name" },
    { headerName: "Last Name", field: "last_name" },
    { headerName: "Email", field: "email" },
    { headerName: "Role", field: "role" },
    { headerName: "Premium", field: "isPremium" },
    { headerName: "OAuth", field: "cameFromOAuth" },
    {
      headerName: "Actions",
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
      width: 120,
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          context={{ openEdit, removeUser }}
        />
      </div>
      <EditRowModal
        open={editOpen}
        title="Edit User"
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
  );
};

export default AllUsers;
