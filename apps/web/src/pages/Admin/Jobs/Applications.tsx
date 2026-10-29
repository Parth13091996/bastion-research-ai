import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  deleteApplication as deleteApplicationApi,
  getApplications,
  updateApplication,
} from "@/api/applications-api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Search, Trash2 } from "lucide-react";
import { filterApplications, getJobProfileCounts } from "./application-filters";
import { confirmDelete } from "@/utils/confirm";
import EditRowModal from "@/components/core/common/Modals/EditRowModal";
import { queryKeys } from "@/api/queryKeys";
import ExpandableCell from "@/components/admin/ExpandableCell";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";

const Applications = () => {
  const gridRef = useRef<AgGridReact>(null);
  const queryClient = useQueryClient();
  const { canEdit } = useSectionEditAccess("jobs_applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobProfile, setSelectedJobProfile] = useState<string | null>(null);
  const { data: rowData, isLoading } = useQuery({
    queryKey: [queryKeys.applications],
    queryFn: async () => {
      const response = await getApplications();
      return response.map(({ job_openings, ...rest }: any) => ({
        ...rest,
        job_title: job_openings?.job_title?.trim() || "Unspecified job profile",
      }));
    },
  });

  const jobProfiles = useMemo(() => getJobProfileCounts(rowData ?? []), [rowData]);
  const filteredApplications = useMemo(
    () => filterApplications(rowData ?? [], searchQuery, selectedJobProfile),
    [rowData, searchQuery, selectedJobProfile]
  );

  useEffect(() => {
    if (selectedJobProfile !== null && !jobProfiles.some((job) => job.title === selectedJobProfile)) {
      setSelectedJobProfile(null);
    }
  }, [jobProfiles, selectedJobProfile]);

  useEffect(() => {
    gridRef.current?.api?.paginationGoToFirstPage();
  }, [searchQuery, selectedJobProfile]);

  const [form, setForm] = useState({
    job_id: "",
    job_title: "",
    applicant_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    comments: "",
    status: "Pending",
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createApplication({
        job_id: Number(form.job_id),
        applicant_name: form.applicant_name,
        email: form.email,
        phone: form.phone,
        cover_letter: form.cover_letter,
        comments: form.comments,
        status: form.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.applications] });
      setForm({
        job_id: "",
        job_title: "",
        applicant_name: "",
        email: "",
        phone: "",
        cover_letter: "",
        comments: "",
        status: "Pending",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      updateApplication(payload.id, payload.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.applications] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteApplicationApi(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.applications] }),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const openEdit = (row: any) => {
    if (!canEdit) return;
    setEditRow(row);
    setEditOpen(true);
  };

  const saveEdit = (values: any) => {
    if (!editRow) return;
    if (!canEdit) return;
    const body = {
      job_id: Number(values.job_id),
      applicant_name: values.applicant_name,
      email: values.email,
      phone: values.phone,
      cover_letter: values.cover_letter,
      comments: values.comments,
      status: values.status,
    };
    updateMutation.mutate({ id: editRow.application_id, body });
    setEditOpen(false);
  };

  const deleteApplication = async (id: number | string, label?: string) => {
    if (!canEdit) return;
    const ok = await confirmDelete(label);
    if (ok) deleteMutation.mutate(id);
  };

  const ActionsRenderer = (params: any) => (
    <div className="flex gap-2">
      {canEdit && (
        <button
          className="p-1 text-gray-600 hover:text-blue-600"
          title="Edit"
          onClick={() => params.context.openEdit(params.data)}
        >
          <Edit size={16} />
        </button>
      )}
      {canEdit && (
        <button
          className="p-1 text-gray-600 hover:text-red-600"
          title="Delete"
          onClick={() =>
            params.context.deleteApplication(
              params.data.application_id,
              params.data.applicant_name
            )
          }
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: "ID", field: "application_id" },
    { headerName: "Job Title", field: "job_title" },
    { headerName: "Applicant Name", field: "applicant_name" },
    { headerName: "Email", field: "email" },
    { headerName: "Phone", field: "phone" },
    {
      headerName: "Resume",
      field: "resume_url",
      cellRenderer: (p: any) => {
        const url = p.value as string | undefined;
        if (!url) return "—";
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View
          </a>
        );
      },
      minWidth: 110,
    },
    {
      headerName: "Cover Letter",
      field: "cover_letter",
      flex: 2,
      minWidth: 240,
      cellRenderer: (params: any) => (
        <ExpandableCell value={params.value} limit={120} title="Cover Letter" />
      ),
    },
    {
      headerName: "Comments",
      field: "comments",
      editable: canEdit,
      cellRenderer: (params: any) => (
        <ExpandableCell value={params.value} limit={50} title="Comments" />
      ),
    },
    { headerName: "Date Applied", field: "date_applied" },
    { headerName: "Status", field: "status" },
    {
      headerName: "Actions",
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
      width: 120,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (gridRef.current?.api) {
                gridRef.current.api.exportDataAsCsv({ fileName: "applications-export.csv" });
              }
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 mb-6 bg-muted/50 rounded-lg border" role="group" aria-label="Filter applications by job profile">
        {[{ title: null, count: rowData?.length ?? 0 }, ...jobProfiles].map((job) => {
          const isSelected = selectedJobProfile === job.title;
          return (
            <button
              key={job.title ?? "all-applications"}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedJobProfile(job.title)}
              className={`relative flex items-center px-3 py-1.5 text-sm font-medium transition-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "bg-white text-foreground shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <span>{job.title ?? "All Applications"}</span>
              <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {job.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input
              type="search"
              aria-label="Search candidates by name, email or phone"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground" role="status">
            {filteredApplications.length} of {rowData?.length ?? 0} applications
          </span>
        </div>
        <div className="rounded-md border bg-white ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            ref={gridRef as any}
            theme="legacy"
            rowData={filteredApplications}
            overlayNoRowsTemplate="No applications match your search or job profile."
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
            singleClickEdit={canEdit}
            onCellValueChanged={
              canEdit
                ? (e) => {
                    if (e.colDef.field === "comments") {
                      const row: any = e.data;
                      const newVal = (e.newValue ?? "").toString();
                      if (newVal !== (e.oldValue ?? "")) {
                        updateMutation.mutate({
                          id: row.application_id,
                          body: { comments: newVal },
                        });
                      }
                    }
                  }
                : undefined
            }
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            context={{
              openEdit: canEdit ? openEdit : undefined,
              deleteApplication: canEdit ? deleteApplication : undefined,
            }}
            enableCellTextSelection={true}
            ensureDomOrder={true}
            suppressRowClickSelection={true}
          />
        </div>
      </div>
      <EditRowModal
        open={editOpen}
        title="Edit Application"
        fields={[
          { name: "job_id", label: "Job ID", type: "number" },
          { name: "applicant_name", label: "Applicant Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "tel" },
          {
            name: "cover_letter",
            label: "Cover Letter",
            multiline: true,
            rows: 6,
          },
          {
            name: "comments",
            label: "Comments",
            multiline: true,
            rows: 4,
          },
          { name: "status", label: "Status" },
        ]}
        initialValues={editRow}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
        saving={updateMutation.isPending}
      />
    </div>
  );
};

export default Applications;
