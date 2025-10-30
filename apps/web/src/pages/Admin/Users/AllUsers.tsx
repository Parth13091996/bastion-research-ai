import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { Trash2, Mail, Shield, User } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useModalStore } from "@/stores/modal-store";
import { toast } from "sonner";

const RoleRenderer = (params: any) => {
  const role = params.value || "employee";
  const roleConfig = {
    admin: { color: "bg-red-100 text-red-800", icon: Shield },
    employee: { color: "bg-blue-100 text-blue-800", icon: User },
    core_subscriber: { color: "bg-green-100 text-green-800", icon: User },
    ipo_subscriber: { color: "bg-purple-100 text-purple-800", icon: User },
    research_ally_subscriber: {
      color: "bg-orange-100 text-orange-800",
      icon: User,
    },
  };

  const config = roleConfig[role] || roleConfig.employee;
  const Icon = config.icon;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.color}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

const EmailRenderer = (params: any) => (
  <a
    href={`mailto:${params.value}`}
    className="text-blue-600 hover:underline flex items-center"
  >
    <Mail className="mr-1 h-3 w-3" />
    {params.value}
  </a>
);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.users.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
  });

  const columns: ColDef[] = [
    {
      headerName: "Username",
      field: "username",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Email",
      field: "email",
      cellRenderer: EmailRenderer,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Name",
      field: "full_name",
      valueGetter: (params) =>
        `${params.data.first_name || ""} ${params.data.last_name || ""}`.trim(),
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Role",
      field: "role",
      cellRenderer: RoleRenderer,
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "Premium",
      field: "is_premium",
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value ? "Premium" : "Free"}
        </span>
      ),
      width: 100,
    },
    {
      headerName: "OAuth",
      field: "cameFromOAuth",
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value ? "OAuth" : "Email"}
        </span>
      ),
      width: 100,
    },
    {
      headerName: "Created",
      field: "created_at",
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      },
      flex: 1,
      minWidth: 120,
    },
  ];

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      action: (selected: any[]) => handleBulkDelete(selected),
      variant: "destructive" as const,
    },
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      action: (selected: any[]) => handleBulkEmail(selected),
    },
  ];

  const handleEdit = (row: any) => {
    // Navigate to edit user page or open edit modal
  };

  const handleDelete = (row: any) => {
    const setModalOpen = useModalStore.getState().set;
    const setModalProps = useModalStore.getState().setProps;

    setModalProps("confirm", {
      title: "Delete user?",
      description: `This will permanently delete ${row.first_name || row.username || "this user"}.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
      onConfirm: () => {
        deleteMutation.mutate(row.id);
        setModalOpen("confirm", false);
        setModalProps("confirm", undefined);
      },
      onCancel: () => {
        setModalProps("confirm", undefined);
      },
    });
    setModalOpen("confirm", true);
  };

  const handleBulkDelete = (selected: any[]) => {
    const setModalOpen = useModalStore.getState().set;
    const setModalProps = useModalStore.getState().setProps;

    setModalProps("confirm", {
      title: `Delete ${selected.length} users?`,
      description: "This action cannot be undone.",
      confirmText: "Delete All",
      cancelText: "Cancel",
      tone: "danger",
      onConfirm: async () => {
        try {
          await Promise.all(
            selected.map((user) =>
              axiosInstance.delete(endpoints.users.byId(user.id))
            )
          );
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast.success(`${selected.length} users deleted successfully`);
        } catch (error) {
          toast.error("Failed to delete some users");
        } finally {
          setModalOpen("confirm", false);
          setModalProps("confirm", undefined);
        }
      },
      onCancel: () => {
        setModalProps("confirm", undefined);
      },
    });
    setModalOpen("confirm", true);
  };

  const handleBulkEmail = (selected: any[]) => {
    const emails = selected.map((user) => user.email).join(", ");
    window.open(`mailto:${emails}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
        <p className="text-muted-foreground">
          Manage all registered users and their permissions
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        data={rowData || []}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={bulkActions}
        searchPlaceholder="Search users by name, email, or username..."
        title="Users"
        description={`${rowData?.length || 0} total users`}
      />
    </div>
  );
};

export default AllUsers;
