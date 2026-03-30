import { deleteUserById, getUsers, updateUserById } from "@/api/users-api";
import { queryKeys } from "@/api/queryKeys";
import { UserActivityDropdown } from "@/components/admin/UserActivityDropdown";
import { Button } from "@/components/ui/button";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { useViewMemberStore } from "@/stores/view-member-store";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Edit, Eye, Mail, Shield, Trash2, User, UserPlus } from "lucide-react";
import { ICellRendererParams } from "ag-grid-community";
import { useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";
import ViewMemberModal from "@/components/core/common/Modals/ViewMemberModal";
import { differenceInDays } from "date-fns";
import { confirm } from "@/utils/confirm";

interface MemberData {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  subscription_end_date?: string | null;
  digio_documents?: { document_id: string }[];
}

interface UserActivity {
  login_count: number;
  pageviews_count: number;
  recommendations_count: number;
}

interface RoleStyle {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Reuse UI patterns from All Users table
const RoleRenderer = (params: ICellRendererParams<MemberData>) => {
  const role = (params.value as string) || "free_subscriber";
  const roleConfig: Record<string, RoleStyle> = {
    admin: { color: "bg-red-100 text-red-800", icon: Shield },
    employee: { color: "bg-blue-100 text-blue-800", icon: User },
    free_subscriber: { color: "bg-gray-100 text-gray-800", icon: User },
    core_subscriber: { color: "bg-green-100 text-green-800", icon: User },
    ipo_subscriber: { color: "bg-purple-100 text-purple-800", icon: User },
    research_ally_subscriber: {
      color: "bg-orange-100 text-orange-800",
      icon: User,
    },
    drop_off: {
      color: "bg-red-50 text-red-700 border border-red-200",
      icon: User,
    },
  };

  const config = roleConfig[role] || roleConfig.free_subscriber;
  const Icon = config.icon;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${config.color}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

const EmailRenderer = (params: ICellRendererParams<MemberData>) => (
  <a
    href={`mailto:${String(params.value)}`}
    className="text-blue-600 hover:underline flex items-center"
  >
    <Mail className="mr-1 h-3 w-3" />
    {params.value}
  </a>
);

const PhoneRenderer = (params: ICellRendererParams<MemberData>) => {
  const phone = params.value as string;
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

const ActivityRenderer = (params: ICellRendererParams<MemberData>, activityMap: Record<string, UserActivity>) => {
  const userId = params.data?.id;
  if (!userId) return null;
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
  const gridRef = useRef<AgGridReact>(null);
  const queryClient = useQueryClient();
  const {
    data: rowData,
    isLoading: loading,
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

  const AgreementRenderer = (params: ICellRendererParams<MemberData>) => {
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
        className="h-8"
      >
        Download
      </Button>
    );
  };

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const setIsModalOpen = useModalStore((s) => s.set);
  const openEditMember = useEditMemberStore((s) => s.open);
  const openViewMember = useViewMemberStore((s) => s.open);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserById(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] }),
  });

  const handleEdit = (row: MemberData) => {
    openEditMember(row);
  };

  const handleView = (row: MemberData) => {
    openViewMember(row);
  };

  const handleDelete = (row: MemberData) => {
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

  const handleBulkDelete = async () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes() || [];
    const selectedData = selectedNodes.map(node => node.data);

    if (selectedData.length === 0) return;

    const ok = await confirm({
      title: `Delete ${selectedData.length} members?`,
      description: "This action cannot be undone. This will permanently delete all selected members.",
      confirmText: "Delete All",
      tone: "danger",
    });

    if (!ok) return;

    try {
      await Promise.all(
        selectedData.map((member) => deleteUserById(member.id))
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${selectedData.length} members deleted successfully`);
      gridRef.current?.api.deselectAll();
    } catch (error) {
      toast.error("Failed to delete some members");
    }
  };

  const handleBulkEmail = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes() || [];
    const selectedData = selectedNodes.map(node => node.data);

    if (selectedData.length === 0) return;

    const emails = selectedData.map((member) => member.email).join(", ");
    window.open(`mailto:${emails}`, "_blank");
  };

  const ActionRenderer = (params: ICellRendererParams<MemberData>) => (
    <div className="flex items-center space-x-1">
      <button
        className="p-1 text-gray-600 hover:text-blue-600"
        title="View"
        onClick={() => params.data && handleView(params.data)}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-gray-600 hover:text-blue-600"
        title="Edit"
        onClick={() => params.data && handleEdit(params.data)}
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-gray-600 hover:text-red-600"
        title="Delete"
        onClick={() => params.data && handleDelete(params.data)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )

  const columns: ColDef[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      filter: false,
      sortable: false,
      pinned: 'left',
    },
    {
      headerName: "Username",
      field: "username",
      minWidth: 150,
    },
    {
      headerName: "Name",
      field: "full_name",
      valueGetter: (params) =>
        `${params.data.first_name || ""} ${params.data.last_name || ""}`.trim(),
      minWidth: 150,
    },
    {
      headerName: "Role",
      field: "role",
      cellRenderer: RoleRenderer,
      minWidth: 180,
    },
    {
      headerName: "Email",
      field: "email",
      cellRenderer: EmailRenderer,
      minWidth: 200,
    },
    {
      headerName: "Phone Number",
      field: "phone",
      cellRenderer: PhoneRenderer,
      minWidth: 200,
    },
    {
      headerName: "Created",
      field: "created_at",
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString();
      },
      minWidth: 120,
    },
    {
      headerName: "Expires In",
      field: "subscription_end_date",
      width: 140,
      cellRenderer: (params: ICellRendererParams<MemberData>) => {
        const endDate = params.value as string | null | undefined;
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
      field: "id", // Using ID but displaying count from map
      colId: "logins",
      width: 100,
      valueGetter: (params) => activityMap[params.data.id]?.login_count ?? 0,
    },
    {
      headerName: "Recs Accessed",
      field: "id", // Using ID but displaying count from map
      colId: "recs_accessed",
      width: 140,
      valueGetter: (params) =>
        activityMap[params.data.id]?.recommendations_count ?? 0,
    },
    {
      headerName: "Analytics",
      field: "id", // Using ID but displaying count from map
      colId: "analytics",
      width: 140,
      cellRenderer: (params: ICellRendererParams<MemberData>) => ActivityRenderer(params, activityMap),
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
    {
      headerName: "Actions",
      cellRenderer: ActionRenderer,
      width: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
    }
  ];

  // Logic for counts and filtering
  const users = useMemo(() => rowData || [], [rowData]);

  const roleCounts: Record<string, number> = useMemo(() => {
    const counts = {
      all: users.length,
      admin: 0,
      employee: 0,
      free_subscriber: 0,
      core_subscriber: 0,
      ipo_subscriber: 0,
      research_ally_subscriber: 0,
      drop_off: 0,
    };

    users.forEach((u: MemberData) => {
      let role = (u.role || "free_subscriber").toLowerCase().trim();
      role = role.replace(/[\s-]/g, "_");

      if (Object.prototype.hasOwnProperty.call(counts, role)) {
        (counts as Record<string, number>)[role]++;
      } else {
        if (role.includes("core") && role.includes("sub")) counts.core_subscriber++;
        else if (role.includes("ipo") && role.includes("sub")) counts.ipo_subscriber++;
        else if (role.includes("research") && role.includes("ally")) counts.research_ally_subscriber++;
        else if (role === "admin" || role === "administrator") counts.admin++;
        else if (role === "employee") counts.employee++;
        else counts.free_subscriber++;
      }
    });
    return counts;
  }, [users]);

  const filteredData = useMemo(() => {
    // 1. Filter by Role
    let data = selectedRole
      ? users.filter((u: MemberData) => (u.role || "free_subscriber") === selectedRole)
      : users;

    // 2. Filter by Search Query
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      data = data.filter((u: MemberData) =>
        u.username?.toLowerCase().includes(lowerQ) ||
        u.email?.toLowerCase().includes(lowerQ) ||
        (u.first_name && u.first_name.toLowerCase().includes(lowerQ)) ||
        (u.last_name && u.last_name.toLowerCase().includes(lowerQ))
      );
    }
    return data;
  }, [selectedRole, searchQuery, users]);

  const roleFilterButtons = [
    { label: "All Users", value: null, count: roleCounts.all },
    { label: "Free Subs", value: "free_subscriber", count: roleCounts.free_subscriber },
    { label: "Core Subs", value: "core_subscriber", count: roleCounts.core_subscriber },
    { label: "IPO Subs", value: "ipo_subscriber", count: roleCounts.ipo_subscriber },
    { label: "Research Ally", value: "research_ally_subscriber", count: roleCounts.research_ally_subscriber },
    { label: "Employees", value: "employee", count: roleCounts.employee },
    { label: "Admins", value: "admin", count: roleCounts.admin },
    { label: "Drop Off", value: "drop_off", count: roleCounts.drop_off },
  ];

  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <div className="space-y-6 p-6">
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
          {/* Can put additional summary stats here if needed */}
        </div>
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

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-sm p-2 border border-gray-300 rounded-lg"
          />

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedCount} selected</span>
              <Button variant="outline" size="sm" onClick={handleBulkEmail}>
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div
          className="rounded-md border bg-white ag-theme-alpine"
          style={{ height: 600, width: "100%" }}
        >
          <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={filteredData}
            columnDefs={columns}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            rowSelection="multiple"
            onSelectionChanged={() => {
              const count = gridRef.current?.api.getSelectedNodes().length || 0;
              setSelectedCount(count);
            }}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[20, 50, 100]}
            suppressCellFocus={true}
            enableCellTextSelection={true}
            ensureDomOrder={true}
          />
        </div>
      </div>

      <ViewMemberModal />
    </div>
  );
};

export default MemberManagementDashboard;
