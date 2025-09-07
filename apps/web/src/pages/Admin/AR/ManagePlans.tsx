import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../../styles/ag-grid-custom.css";

// Replaced static data with API-driven content

const ActionsRenderer = (params: any) => {
  const current = params.data;
  const onEdit = () => {
    const plan_name = window.prompt('Plan Name', current.plan_name) ?? current.plan_name;
    const plan_type = window.prompt('Plan Type (Subscription/Free)', current.plan_type) ?? current.plan_type;
    const price_amount = Number(window.prompt('Price Amount', String(current.price_amount)) ?? current.price_amount);
    const currency = window.prompt('Currency', current.currency) ?? current.currency;
    const duration_months = Number(window.prompt('Duration (months)', String(current.duration_months)) ?? current.duration_months);
    const wp_role = window.prompt('WP Role', current.wp_role) ?? current.wp_role;
    params.context?.updatePlan?.(current.plan_id, { plan_name, plan_type, price_amount, currency, duration_months, wp_role });
  };
  const onDelete = () => {
    if (window.confirm('Delete this plan?')) params.context?.deletePlan?.(current.plan_id);
  };
  return (
    <div className="flex items-center space-x-2">
      <button onClick={onEdit} className="p-2 text-gray-600 hover:text-blue-600" title="Edit"><Edit2 size={14} /></button>
      <button onClick={onDelete} className="p-2 text-gray-600 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
    </div>
  );
};

const PlanTypeRenderer = (params: any) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${params.value === "Free"
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
  const [form, setForm] = useState({ plan_name: "", plan_type: "Subscription", price_amount: 0, currency: "INR", duration_months: 12, wp_role: "" });

  const createPlan = () => {
    createMutation.mutate(form);
    setShowForm(false);
    setForm({ plan_name: "", plan_type: "Subscription", price_amount: 0, currency: "INR", duration_months: 12, wp_role: "" });
  };
  const updatePlan = (id: number | string, body: any) => updateMutation.mutate({ id, body });
  const deletePlan = (id: number | string) => deleteMutation.mutate(id);
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef<AgGridReact>(null);
  const queryClient = useQueryClient();
  const { data: plans } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => axiosInstance.get('/api/membership-plans').then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => axiosInstance.post('/api/membership-plans', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-plans'] }),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number | string; body: any }) => axiosInstance.put(`/api/membership-plans/${payload.id}`, payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-plans'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => axiosInstance.delete(`/api/membership-plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-plans'] }),
  });

  const [colDefs] = useState<ColDef[]>([
    { headerName: "Plan ID", field: "plan_id" },
    { headerName: "Plan Name", field: "plan_name" },
    { headerName: "Plan Type", field: "plan_type", cellRenderer: PlanTypeRenderer },
    { headerName: "Members", field: "members" },
    { headerName: "Wp Role", field: "wp_role" },
    { headerName: "Price Amount", field: "price_amount" },
    { headerName: "Currency", field: "currency" },
    { headerName: "Duration (months)", field: "duration_months" },
    { headerName: "Actions", field: "actions", cellRenderer: ActionsRenderer, sortable: false, filter: false },
  ]);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(searchTerm);
    }
  }, [searchTerm]);

  const onGridReady = (params: GridReadyEvent) => {
    gridRef.current = params;
  };

  return (
    <div className="bg-gray-50 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[80rem] bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Manage Membership Plans
          </h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border p-2 rounded" placeholder="Plan Name" value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Plan Type" value={form.plan_type} onChange={(e) => setForm({ ...form, plan_type: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Price Amount" type="number" value={form.price_amount} onChange={(e) => setForm({ ...form, price_amount: Number(e.target.value) })} />
              <input className="border p-2 rounded" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Duration (months)" type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })} />
              <input className="border p-2 rounded" placeholder="WP Role" value={form.wp_role} onChange={(e) => setForm({ ...form, wp_role: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={createPlan}>Save Plan</button>
              <button className="px-4 py-2 rounded border" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="p-1 ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={plans}
            columnDefs={colDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            pagination={true}
            paginationPageSize={10}
            onGridReady={onGridReady}
            context={{ updatePlan, deletePlan }}
          />
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
