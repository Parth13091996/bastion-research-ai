import { adminListEmployeesSectionEditAccess, adminSetEmployeeSectionEditAccess } from "@/api/section-edit-access-api";
import { queryKeys } from "@/api/queryKeys";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";
import { ADMIN_EDIT_SECTIONS, type AdminEditSectionKey } from "@/utils/admin-sections";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  status?: string;
} & Record<AdminEditSectionKey, boolean>;

const SwitchRenderer = (
  params: any
) => {
  const { updateCell, isUpdating } = params.context as {
    updateCell: (args: {
      userId: string;
      sectionKey: AdminEditSectionKey;
      canEdit: boolean;
    }) => void;
    isUpdating: boolean;
  };

  const sectionKey = params.colDef.field as AdminEditSectionKey;
  const userId = params.data?.id;
  const checked = Boolean(params.value);

  if (!userId || !sectionKey) return null;

  return (
    <Switch
      checked={checked}
      disabled={isUpdating}
      onCheckedChange={(next) =>
        updateCell({ userId, sectionKey, canEdit: next })
      }
    />
  );
};

const SectionEditAccessSettings = () => {
  const { isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading: loadingEmployees, error } = useQuery({
    queryKey: [queryKeys.admin_staff_section_edit_access],
    queryFn: adminListEmployeesSectionEditAccess,
    enabled: isAdmin,
  });

  const mutation = useMutation({
    mutationFn: adminSetEmployeeSectionEditAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.admin_staff_section_edit_access],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update";
      toast.error(msg);
    },
  });

  const rows: Row[] = useMemo(() => {
    const employees = data?.employees || [];
    const q = search.trim().toLowerCase();

    return employees
      .map((e) => {
        const editable = new Set(e.editable_sections || []);
        const base: any = {
          id: e.id,
          username: e.username,
          email: e.email,
          status: e.status,
          name:
            `${e.first_name || ""} ${e.last_name || ""}`.trim() ||
            e.username ||
            e.email ||
            e.id,
        };

        for (const section of ADMIN_EDIT_SECTIONS) {
          base[section.key] = editable.has(section.key);
        }

        return base as Row;
      })
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.username || "").toLowerCase().includes(q)
        );
      });
  }, [data?.employees, search]);

  const columns: ColDef<Row>[] = useMemo(() => {
    const cols: ColDef<Row>[] = [
      { headerName: "Employee", field: "name", pinned: "left", minWidth: 220 },
      { headerName: "Email", field: "email", pinned: "left", minWidth: 240 },
    ];

    for (const section of ADMIN_EDIT_SECTIONS) {
      cols.push({
        headerName: section.label,
        field: section.key,
        minWidth: 170,
        cellRenderer: SwitchRenderer,
        sortable: false,
        filter: false,
      });
    }

    return cols;
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={AppRoutes.adminDashboard} replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AR Members • Settings
        </h1>
        <p className="text-muted-foreground">
          Toggle per-employee edit access for each admin section. Employees can
          always view sections, but can only create/update/delete when enabled.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees by name, email, username…"
          className="w-full max-w-lg p-2 border border-gray-300 rounded-lg bg-white"
        />
      </div>

      <div className="rounded-md border bg-white">
        {loadingEmployees ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.message || "Failed to load employees"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="ag-theme-alpine"
            style={{ height: 650, width: "100%" }}
          >
            <AgGridReact<Row>
              rowData={rows}
              columnDefs={columns}
              defaultColDef={{
                resizable: true,
                sortable: true,
                flex: 1,
              }}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              suppressRowClickSelection={true}
              context={{
                isUpdating: mutation.isPending,
                updateCell: (args) => mutation.mutate(args),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionEditAccessSettings;
