import { deleteLead, getLeads, updateLead } from "@/api/leads-api";
import { queryKeys } from "@/api/queryKeys";
import { DataTable } from "@/components/ui/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import { useState } from "react";
import EditRowModal from "@/components/core/common/Modals/EditRowModal";
import ExpandableCell from "@/components/admin/ExpandableCell";

type Lead = {
  lead_id: number;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  message: string;
  status?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
};

const LeadsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.leads],
    queryFn: async () => getLeads(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; body: Partial<Lead> }) =>
      updateLead(payload.id, payload.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads] }),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Lead | null>(null);

  const openEdit = (row: Lead) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const saveEdit = (values: Partial<Lead>) => {
    if (!editRow) return;
    updateMutation.mutate({ id: editRow.lead_id, body: values });
    setEditOpen(false);
  };

  const handleDeleteLead = (row: Lead) => deleteMutation.mutate(row.lead_id);

  const columns: ColDef<Lead>[] = [
    { headerName: "ID", field: "lead_id", width: 90 },
    { headerName: "Name", field: "name", flex: 1, minWidth: 140 },
    { headerName: "Email", field: "email", flex: 1.2, minWidth: 200 },
    { headerName: "Phone", field: "phone", minWidth: 140 },
    { headerName: "Category", field: "category", minWidth: 130 },
    {
      headerName: "Message",
      field: "message",
      flex: 2,
      minWidth: 240,
      cellRenderer: (params: any) => (
        <ExpandableCell value={params.value} limit={40} title="Message" />
      ),
    },
    { headerName: "Status", field: "status", minWidth: 120 },
    {
      headerName: "Comments",
      field: "comments",
      flex: 1.2,
      minWidth: 180,
      editable: true,
      cellRenderer: (params: any) => (
        <ExpandableCell value={params.value} limit={40} title="Comments" />
      ),
    },
    {
      headerName: "Created",
      field: "created_at",
      minWidth: 140,
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : "",
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable<Lead>
        data={data || []}
        columns={columns}
        loading={isLoading}
        error={(error as any)?.message}
        onEdit={openEdit}
        onDelete={handleDeleteLead}
        singleClickEdit
        onCellValueChanged={(e) => {
          const row = e.data as Lead;
          if (e.colDef.field === "comments" && row?.lead_id != null) {
            const newVal = (e.newValue ?? "").toString();
            if (newVal !== (e.oldValue ?? "")) {
              updateMutation.mutate({
                id: row.lead_id,
                body: { comments: newVal },
              });
            }
          }
        }}
        searchPlaceholder="Search leads by name, email, phone, category..."
        title="Leads"
        description={`Inbound leads from the Contact form. ${data?.length || 0} total leads`}
      />
      <EditRowModal
        open={editOpen}
        title="Edit Lead"
        fields={[
          { name: "name", label: "Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone" },
          { name: "category", label: "Category" },
          { name: "status", label: "Status" },
          { name: "comments", label: "Comments" },
        ]}
        initialValues={editRow || undefined}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
        saving={updateMutation.isPending}
      />
    </div>
  );
};

export default LeadsPage;
