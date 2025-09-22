import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { queryKeys } from "@/api/queryKeys";
import EditRowModal from "@/components/core/common/Modals/EditRowModal";

const ActionsRenderer = (params: any) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => params?.context?.openEdit?.(params?.data)}
      className="text-blue-600 hover:text-blue-800 p-1"
      title="Edit"
      disabled={!params?.context?.openEdit || !params?.data}
    >
      <Edit2 size={16} />
    </button>
    <button
      onClick={() => params?.context?.deletePlan?.(params?.data?.plan_id)}
      className="text-red-600 hover:text-red-800 p-1"
      title="Delete"
      disabled={!params?.context?.deletePlan || !params?.data?.plan_id}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const PlanTypeRenderer = (params: any) => {
  if (!params || !params.value) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
        params.value === "Free"
          ? "bg-gray-100 text-gray-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {params.value}
    </span>
  );
};

const MembershipPlans = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    plan_name: "",
    plan_type: "Subscription",
    price_amount: 0,
    currency: "INR",
    duration_months: 12,
    wp_role: "",
  });

  const createPlan = () => {
    if (!form.plan_name || !form.plan_type || !form.currency || !form.wp_role)
      return;
    createMutation.mutate(form);
    setShowForm(false);
    setForm({
      plan_name: "",
      plan_type: "Subscription",
      price_amount: 0,
      currency: "INR",
      duration_months: 12,
      wp_role: "",
    });
  };
  const updatePlan = (id: number | string, body: any) => {
    if (!id || !body) return;
    updateMutation.mutate({ id, body });
  };
  const deletePlan = (id: number | string) => {
    if (!id) return;
    deleteMutation.mutate(id);
  };
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const openEdit = (row: any) => {
    if (!row) return;
    setEditRow(row);
    setEditOpen(true);
  };
  const saveEdit = (values: any) => {
    if (!editRow || !values) return;
    updatePlan(editRow.plan_id, {
      plan_name: values.plan_name ?? "",
      plan_type: values.plan_type ?? "",
      price_amount: Number(values.price_amount ?? 0),
      currency: values.currency ?? "",
      duration_months: Number(values.duration_months ?? 0),
      wp_role: values.wp_role ?? "",
    });
    setEditOpen(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { data: plans } = useQuery({
    queryKey: [queryKeys.membership_plans],
    queryFn: () =>
      axiosInstance.get("/api/membership-plans").then((res) => res?.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) =>
      axiosInstance.post("/api/membership-plans", body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.membership_plans] }),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number | string; body: any }) =>
      axiosInstance.put(`/api/membership-plans/${payload?.id}`, payload?.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.membership_plans] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) =>
      axiosInstance.delete(`/api/membership-plans/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.membership_plans] }),
  });

  const [colDefs] = useState<ColDef[]>([
    { headerName: "Plan ID", field: "plan_id" },
    { headerName: "Plan Name", field: "plan_name" },
    {
      headerName: "Plan Type",
      field: "plan_type",
      cellRenderer: PlanTypeRenderer,
    },
    { headerName: "Members", field: "members" },
    { headerName: "Wp Role", field: "wp_role" },
    { headerName: "Price Amount", field: "price_amount" },
    { headerName: "Currency", field: "currency" },
    { headerName: "Duration (months)", field: "duration_months" },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
    },
  ]);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", searchTerm);
    }
  }, [searchTerm]);

  const onGridReady = (params: GridReadyEvent) => {
    gridRef.current = params;
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Manage Membership Plans
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add New Plan
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm ?? ""}
                onChange={(e) => setSearchTerm(e?.target?.value ?? "")}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Plan Name"
                value={form?.plan_name ?? ""}
                onChange={(e) =>
                  setForm({ ...form, plan_name: e?.target?.value ?? "" })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Plan Type"
                value={form?.plan_type ?? ""}
                onChange={(e) =>
                  setForm({ ...form, plan_type: e?.target?.value ?? "" })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Price Amount"
                type="number"
                value={form?.price_amount ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_amount: Number(e?.target?.value ?? 0),
                  })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Currency"
                value={form?.currency ?? ""}
                onChange={(e) =>
                  setForm({ ...form, currency: e?.target?.value ?? "" })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Duration (months)"
                type="number"
                value={form?.duration_months ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration_months: Number(e?.target?.value ?? 0),
                  })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="WP Role"
                value={form?.wp_role ?? ""}
                onChange={(e) =>
                  setForm({ ...form, wp_role: e?.target?.value ?? "" })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={createPlan}
              >
                Save Plan
              </button>
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-md border bg-white ag-theme-alpine"
          style={{ height: 600, width: "100%" }}
        >
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            rowData={plans ?? []}
            columnDefs={colDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            onGridReady={onGridReady}
            context={{ openEdit, deletePlan }}
          />
        </div>
        <EditRowModal
          open={!!editOpen}
          title="Edit Plan"
          fields={[
            { name: "plan_name", label: "Plan Name" },
            { name: "plan_type", label: "Plan Type" },
            { name: "price_amount", label: "Price Amount", type: "number" },
            { name: "currency", label: "Currency" },
            {
              name: "duration_months",
              label: "Duration (months)",
              type: "number",
            },
            { name: "wp_role", label: "WP Role" },
          ]}
          initialValues={editRow ?? {}}
          onClose={() => setEditOpen(false)}
          onSave={saveEdit}
          saving={!!updateMutation?.isPending}
        />
      </div>
    </div>
  );
};

export default MembershipPlans;
