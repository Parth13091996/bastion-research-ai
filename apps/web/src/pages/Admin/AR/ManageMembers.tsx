import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { DataTable } from "@/components/ui/data-table";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { Plus, Trash2, UserPlus, Mail, Shield, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { queryKeys } from "@/api/queryKeys";
import { UserActivityDropdown } from "@/components/admin/UserActivityDropdown";

// Reuse UI patterns from All Users table
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
  } as const;

  const config = (roleConfig as any)[role] || roleConfig.employee;
  const Icon = config.icon as any;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.color}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {String(role)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}
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

const ActivityRenderer = (params: any, activityMap: any) => {
  const userId = params.data.id;
  const activity = activityMap[userId] || {
    pageviews_count: 0,
    recommendations_count: 0,
  };

  return (
    <UserActivityDropdown
      userId={userId}
      pageViewsCount={activity.pageviews_count}
      recommendationsCount={activity.recommendations_count}
    />
  );
};

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

  // Fetch per-user activity summary for analytics (login count, pageviews, recs)
  const { data: activity } = useQuery({
    queryKey: ["user-activity-summary"],
    queryFn: () =>
      axiosInstance
        .get("/api/admin/users/activity-summary")
        .then((res) => res.data as Array<{
          user_id: string;
          login_count: number;
          pageviews_count: number;
          recommendations_count: number;
        }>),
  });

  const activityMap = (activity || []).reduce(
    (acc, row) => {
      acc[row.user_id] = row;
      return acc;
    },
    {} as Record<string, { login_count: number; pageviews_count: number; recommendations_count: number }>
  );

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
      headerName: "Username",
      field: "username",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Logins",
      field: "id",
      width: 100,
      valueGetter: (params) => activityMap[params.data.id]?.login_count ?? 0,
    },
    {
      headerName: "Pages Viewed",
      field: "id",
      width: 130,
      valueGetter: (params) => activityMap[params.data.id]?.pageviews_count ?? 0,
    },
    {
      headerName: "Recs Accessed",
      field: "id",
      width: 140,
      valueGetter: (params) => activityMap[params.data.id]?.recommendations_count ?? 0,
    },
    {
      headerName: "Analytics",
      field: "id",
      width: 140,
      cellRenderer: (params: any) => ActivityRenderer(params, activityMap),
      sortable: false,
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
        description={`${rowData?.length || 0} total users`}
      />
    </div>
  );
};

export default MemberManagementDashboard;
