import { deleteUserById, getUsers, updateUserById } from "@/api/users-api";
import { queryKeys } from "@/api/queryKeys";
import { UserActivityDropdown } from "@/components/admin/UserActivityDropdown";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { useViewMemberStore } from "@/stores/view-member-store";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { Mail, Shield, Trash2, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";
import ViewMemberModal from "@/components/core/common/Modals/ViewMemberModal";
import { differenceInDays } from "date-fns";

// Reuse UI patterns from All Users table
const RoleRenderer = (params: any) => {
  const role = params.value || "free_subscriber";
  const roleConfig = {
    admin: { color: "bg-red-100 text-red-800", icon: Shield },
    employee: { color: "bg-blue-100 text-blue-800", icon: User },
    free_subscriber: { color: "bg-gray-100 text-gray-800", icon: User },
    core_subscriber: { color: "bg-green-100 text-green-800", icon: User },
    ipo_subscriber: { color: "bg-purple-100 text-purple-800", icon: User },
    research_ally_subscriber: {
      color: "bg-orange-100 text-orange-800",
      icon: User,
    },
  } as const;

  const config = (roleConfig as any)[role] || roleConfig.free_subscriber;
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

const PhoneRenderer = (params: any) => {
  const phone = params.value;
  if (!phone) return null;
  // Try E.164, otherwise just pass phone as is
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  return (
    <a
      href={telHref}
      className="text-blue-600 hover:underline flex items-center"
      title={phone}
    >
      <UserPlus className="mr-1 h-3 w-3" />
      {phone}
    </a>
  );
};

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
    queryFn: () => getUsers(),
  });

  // Fetch per-user activity summary for analytics (login count, pageviews, recs)
  const { data: activity } = useQuery({
    queryKey: ["user-activity-summary"],
    queryFn: () =>
      axiosInstance.get("/api/admin/users/activity-summary").then(
        (res) =>
          res.data as Array<{
            user_id: string;
            login_count: number;
            pageviews_count: number;
            recommendations_count: number;
          }>
      ),
  });

  const activityMap = (activity || []).reduce(
    (acc, row) => {
      acc[row.user_id] = row;
      return acc;
    },
    {} as Record<
      string,
      {
        login_count: number;
        pageviews_count: number;
        recommendations_count: number;
      }
    >
  );

  // Rewritten downloadDigioDocument to handle file download properly as arrayBuffer/pdf
  const downloadDigioDocument = async (documentId: string) => {
    if (!documentId) return;
    try {
      const response = await axiosInstance.get(
        `/api/digio/esign/${documentId}/download`,
        { responseType: "blob" }
      );
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to download Digio document.");
    }
  };

  const AgreementRenderer = (params: any) => {
    const documents = params.data?.digio_documents;
    const documentId =
      Array.isArray(documents) && documents.length > 0
        ? documents[0]?.document_id
        : null;

    return (
      <Button
        variant="outline"
        size="sm"
        disabled={!documentId}
        onClick={() => documentId && downloadDigioDocument(documentId)}
      >
        Download
      </Button>
    );
  };

  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const setIsModalOpen = useModalStore((s) => s.set);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) =>
      updateUserById(payload.id, payload.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserById(id),
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
      headerName: "Email",
      field: "email",
      cellRenderer: EmailRenderer,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Phone Number",
      field: "phone",
      cellRenderer: PhoneRenderer,
      flex: 2,
      minWidth: 200,
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
      headerName: "Expires In",
      field: "subscription_end_date",
      width: 120,
      cellRenderer: (params: any) => {
        const endDate = params.value;
        if (!endDate) return <span className="text-gray-400">-</span>;

        const daysLeft = differenceInDays(new Date(endDate), new Date());

        if (daysLeft < 0) {
          return <span className="text-red-600 font-medium">Expired</span>;
        }

        if (daysLeft <= 7) {
          return <span className="text-amber-600 font-medium">{daysLeft} days</span>;
        }

        return <span>{daysLeft} days</span>;
      },
    },
    {
      headerName: "Logins",
      field: "id",
      width: 100,
      valueGetter: (params) => activityMap[params.data.id]?.login_count ?? 0,
    },
    {
      headerName: "Recs Accessed",
      field: "id",
      width: 140,
      valueGetter: (params) =>
        activityMap[params.data.id]?.recommendations_count ?? 0,
    },
    {
      headerName: "Analytics",
      field: "id",
      width: 140,
      cellRenderer: (params: any) => ActivityRenderer(params, activityMap),
      sortable: false,
    },
    {
      headerName: "Agreement",
      field: "digio_documents",
      cellRenderer: AgreementRenderer,
      sortable: false,
      filter: false,
      width: 150,
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
  const openViewMember = useViewMemberStore((s) => s.open);

  const handleEdit = (row: any) => {
    openEditMember(row);
  };

  const handleView = (row: any) => {
    openViewMember(row);
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
            selected.map((member) => deleteUserById(member.id))
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

  // Logic for counts and filtering
  const users = rowData || [];
  const roleCounts: Record<string, number> = {
    all: users.length,
    admin: 0,
    employee: 0,
    free_subscriber: 0,
    core_subscriber: 0,
    ipo_subscriber: 0,
    research_ally_subscriber: 0,
  };

  users.forEach((u: any) => {
    let role = (u.role || "free_subscriber").toLowerCase().trim();
    // Normalize: replace spaces/hyphens with underscores to match keys
    role = role.replace(/[\s-]/g, "_");

    if (roleCounts[role] !== undefined) {
      roleCounts[role]++;
    } else {
      // Check specific role types and count appropriately
      if (role.includes("core") && role.includes("sub")) roleCounts.core_subscriber++;
      else if (role.includes("ipo") && role.includes("sub")) roleCounts.ipo_subscriber++;
      else if (role.includes("research") && role.includes("ally")) roleCounts.research_ally_subscriber++;
      else if (role === "admin" || role === "administrator") roleCounts.admin++;
      else if (role === "employee") roleCounts.employee++;
      else roleCounts.free_subscriber++; // Default fallback to free subscriber
    }
  });

  const filteredData = selectedRole
    ? users.filter((u: any) => (u.role || "free_subscriber") === selectedRole)
    : users;

  const roleFilterButtons = [
    { label: "All Users", value: null, count: roleCounts.all },
    { label: "Free Subs", value: "free_subscriber", count: roleCounts.free_subscriber },
    { label: "Core Subs", value: "core_subscriber", count: roleCounts.core_subscriber },
    { label: "IPO Subs", value: "ipo_subscriber", count: roleCounts.ipo_subscriber },
    { label: "Research Ally", value: "research_ally_subscriber", count: roleCounts.research_ally_subscriber },
    { label: "Employees", value: "employee", count: roleCounts.employee },
    { label: "Admins", value: "admin", count: roleCounts.admin },
  ];

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

      {/* Role Filters & Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground text-sm">
            {rowData?.length || 0} total users
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/50 rounded-lg border">
          {roleFilterButtons.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.label}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  relative flex items-center px-3 py-1.5 text-sm font-medium transition-all rounded-md
                  ${isSelected
                    ? "bg-white text-foreground shadow-sm ring-1 ring-black/5"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <span>{role.label}</span>
                <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {role.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        loading={loading}
        error={error?.message}
        onSelectionChange={setSelectedMembers}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        bulkActions={bulkActions}
        searchPlaceholder="Search members by name, email, or username..."
      // Title and description handled externally now
      />
      <ViewMemberModal />
    </div>
  );
};

export default MemberManagementDashboard;
