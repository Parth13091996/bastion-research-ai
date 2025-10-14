import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { DataTable } from "@/components/ui/data-table";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { Plus, Trash2, UserPlus, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { queryKeys } from "@/api/queryKeys";

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

const RoleRenderer = (params: any) => {
  const role = params.value || "employee";
  const roleColors = {
    admin: "bg-red-100 text-red-800",
    employee: "bg-blue-100 text-blue-800",
    core_subscriber: "bg-green-100 text-green-800",
    ipo_subscriber: "bg-purple-100 text-purple-800",
    research_ally_subscriber: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || "bg-gray-100 text-gray-800"}`}
    >
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

const MemberManagementDashboard = () => {
  const queryClient = useQueryClient();
  const {
    data: rowData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: [queryKeys.users],
    queryFn: () =>
      axiosInstance.get(endpoints.users.base).then((res) => res.data),
  });

  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const setIsModalOpen = useModalStore((s) => s.set);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      axiosInstance.put(endpoints.users.byId(payload.id), payload.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.users.byId(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] }),
  });

  const columns: ColDef[] = [
    {
      headerName: "Avatar",
      field: "avatar",
      cellRenderer: AvatarRenderer,
      width: 80,
      sortable: false,
      filter: false,
    },
    {
      headerName: "Username",
      field: "username",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Email",
      field: "email",
      flex: 2,
      cellRenderer: EmailRenderer,
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
      minWidth: 120,
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      minWidth: 100,
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
          {params.value ? "Yes" : "No"}
        </span>
      ),
      width: 100,
      sortable: false,
      filter: false,
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

  const openEditMember = useEditMemberStore((s) => s.open);

  const handleEdit = (row: any) => {
    openEditMember(row);
  };

  const handleDelete = (row: any) => {
    const setModalOpen = useModalStore.getState().set;
    const setModalProps = useModalStore.getState().setProps;

    setModalProps("confirm", {
      title: "Delete member?",
      description: `This action cannot be undone. This will permanently delete ${row.first_name || row.username || "this user"}.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
      isLoading: deleteMutation.isPending,
      onConfirm: () => {
        deleteMutation.mutate(row.id, {
          onSettled: () => {
            setModalOpen("confirm", false);
            setModalProps("confirm", undefined);
            toast.success("Member deleted successfully");
          },
        });
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
      title: `Delete ${selected.length} members?`,
      description:
        "This action cannot be undone. This will permanently delete all selected members.",
      confirmText: "Delete All",
      cancelText: "Cancel",
      tone: "danger",
      isLoading: deleteMutation.isPending,
      onConfirm: async () => {
        try {
          await Promise.all(
            selected.map((member) =>
              axiosInstance.delete(endpoints.users.byId(member.id))
            )
          );
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast.success(`${selected.length} members deleted successfully`);
        } catch (error) {
          toast.error("Failed to delete some members");
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
    const emails = selected.map((member) => member.email).join(", ");
    window.open(`mailto:${emails}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Members</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen("addMember", true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={rowData || []}
        columns={columns}
        loading={loading}
        error={error?.message}
        onSelectionChange={setSelectedMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={bulkActions}
        searchPlaceholder="Search members by name, email, or username..."
        title="Members"
        description={`${rowData?.length || 0} total members`}
      />
    </div>
  );
};

export default MemberManagementDashboard;
