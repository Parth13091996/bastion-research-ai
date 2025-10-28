import React, { useEffect, useMemo, useState } from "react";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { confirm, confirmDelete } from "@/utils/confirm";
import Modal from "@/components/core/Modal";

type ApiCoupon = {
  coupon_id: number;
  coupon_code: string;
  discount_type: "percentage" | "fixed" | string;
  discount_value: number;
  expiry_date: string | null;
  active: boolean | null;
  max_uses: number | null;
  used_count: number | null;
  created_at?: string;
  updated_at?: string;
};

type RowCoupon = {
  id: number;
  code: string;
  label: string;
  discount: string;
  startDate: string;
  expireDate: string | null;
  active: boolean;
  used: number;
  allowedUses: string;
  _raw: ApiCoupon;
};

const fmtDate = (v?: string | null) => (!v ? "" : new Date(v).toLocaleDateString());
const fmtDiscount = (t: string, n: number) =>
  t === "percentage"
    ? `${Number(n).toFixed(2)}%`
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
        Number(n)
      );

const CouponsManagement = () => {
  const [rows, setRows] = useState<RowCoupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCoupon | null>(null);
  const [form, setForm] = useState<Partial<ApiCoupon>>({
    coupon_code: "",
    discount_type: "percentage",
    discount_value: 0,
    expiry_date: null,
    active: true,
    max_uses: null,
  });

  const mapToRow = (c: ApiCoupon): RowCoupon => ({
    id: c.coupon_id,
    code: c.coupon_code,
    label: "-",
    discount: fmtDiscount(String(c.discount_type), Number(c.discount_value)),
    startDate: fmtDate(c.created_at),
    expireDate: c.expiry_date,
    active: Boolean(c.active),
    used: Number(c.used_count || 0),
    allowedUses: c.max_uses == null ? "Unlimited" : String(c.max_uses),
    _raw: c,
  });

  const load = async () => {
    const { data } = await axiosInstance.get(endpoints.coupons.base);
    const arr = (data || []) as ApiCoupon[];
    setRows(arr.map(mapToRow));
  };
  useEffect(() => {
    load();
  }, []);

  const isExpired = (d: string | null) => {
    if (!d) return false;
    const t = new Date(d);
    if (isNaN(t.getTime())) return false;
    const now = new Date();
    t.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return t < now;
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q || r.code.toLowerCase().includes(q);
      const matchesActive =
        activeFilter === "all" || (activeFilter === "active" && r.active) || (activeFilter === "inactive" && !r.active);
      const matchesValidity =
        validityFilter === "all" ||
        (validityFilter === "expired" && isExpired(r.expireDate)) ||
        (validityFilter === "valid" && !isExpired(r.expireDate)) ||
        (validityFilter === "unlimited" && !r.expireDate);
      return matchesQ && matchesActive && matchesValidity;
    });
  }, [rows, searchTerm, activeFilter, validityFilter]);

  const onAdd = () => {
    setEditing(null);
    setForm({ coupon_code: "", discount_type: "percentage", discount_value: 0, expiry_date: null, active: true, max_uses: null });
    setModalOpen(true);
  };
  const onEdit = (r: RowCoupon) => {
    setEditing(r._raw);
    setForm({
      coupon_code: r._raw.coupon_code,
      discount_type: r._raw.discount_type,
      discount_value: r._raw.discount_value,
      expiry_date: r._raw.expiry_date,
      active: r._raw.active ?? true,
      max_uses: r._raw.max_uses,
    });
    setModalOpen(true);
  };
  const save = async () => {
    const payload = {
      coupon_code: form.coupon_code?.trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value || 0),
      expiry_date: form.expiry_date || null,
      active: Boolean(form.active),
      max_uses: form.max_uses == null || (form.max_uses as any) === "" ? null : Number(form.max_uses),
    } as any;
    if (editing?.coupon_id) {
      await axiosInstance.put(`${endpoints.coupons.base}/${editing.coupon_id}`, payload);
    } else {
      await axiosInstance.post(endpoints.coupons.base, payload);
    }
    setModalOpen(false);
    await load();
  };
  const onDelete = async (r: RowCoupon) => {
    const ok = await confirmDelete(r.code);
    if (!ok) return;
    await axiosInstance.delete(`${endpoints.coupons.base}/${r.id}`);
    await load();
  };

  const CheckboxRenderer = (p: any) => (
    <input
      type="checkbox"
      checked={selectedIds.includes(p.data.id)}
      onChange={(e) =>
        setSelectedIds((prev) => (e.target.checked ? [...prev, p.data.id] : prev.filter((x) => x !== p.data.id)))
      }
    />
  );
  const CodeRenderer = (p: any) => <div className="font-mono text-sm">{p.value}</div>;
  const StatusRenderer = (p: any) => (
    <span className={p.value ? "px-2 py-1 rounded text-green-700 bg-green-100" : "px-2 py-1 rounded text-gray-700 bg-gray-100"}>
      {p.value ? "Active" : "Inactive"}
    </span>
  );
  const ExpireRenderer = (p: any) => {
    if (!p.value) return <span>Unlimited</span>;
    const expired = isExpired(p.value);
    return <span className={expired ? "text-red-600" : ""}>{fmtDate(p.value)}</span>;
  };
  const ActionsRenderer = (p: any) => (
    <div className="flex items-center space-x-1">
      <button className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800" title="Edit" onClick={() => onEdit(p.data)}>
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Delete"
        onClick={() => onDelete(p.data)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: "", field: "id", width: 50, cellRenderer: CheckboxRenderer, sortable: false, filter: false },
    { headerName: "Code", field: "code", cellRenderer: CodeRenderer },
    { headerName: "Label", field: "label" },
    { headerName: "Discount", field: "discount" },
    { headerName: "Start Date", field: "startDate" },
    { headerName: "Expire Date", field: "expireDate", cellRenderer: ExpireRenderer },
    { headerName: "Status", field: "active", cellRenderer: StatusRenderer },
    { headerName: "Used", field: "used", valueFormatter: (p) => `${p.value} / ${p.data.allowedUses}` },
    { headerName: "Actions", field: "actions", cellRenderer: ActionsRenderer, sortable: false, filter: false, width: 120 },
  ];

  const handleBulk = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedIds.length === 0) return;
    if (action === "delete") {
      const ok = await confirm({ title: `Delete ${selectedIds.length} coupon(s)?`, confirmText: "Delete All", tone: "danger" });
      if (!ok) return;
      await Promise.all(selectedIds.map((id) => axiosInstance.delete(`${endpoints.coupons.base}/${id}`)));
    } else {
      await Promise.all(
        selectedIds.map((id) => axiosInstance.put(`${endpoints.coupons.base}/${id}`, { active: action === "activate" }))
      );
    }
    setSelectedIds([]);
    await load();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus size={20} className="mr-2" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={validityFilter}
            onChange={(e) => setValidityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Validity</option>
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <select onChange={(e) => e.target.value && handleBulk(e.target.value as any)} className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="rounded-md border bg-white ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            theme="legacy"
            rowData={filtered}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, filter: true, resizable: true, flex: 1 }}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            suppressCellFocus={true}
          />
        </div>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Edit Coupon" : "Add Coupon"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm">Code</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={form.coupon_code || ""}
              onChange={(e) => setForm((f) => ({ ...f, coupon_code: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Discount Type</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={(form.discount_type as any) || "percentage"}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Discount Value</label>
              <input
                type="number"
                className="mt-1 w-full border rounded p-2"
                value={Number(form.discount_value || 0)}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Expiry Date</label>
              <input
                type="date"
                className="mt-1 w-full border rounded p-2"
                value={form.expiry_date ? String(form.expiry_date).substring(0, 10) : ""}
                onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value ? e.target.value : null }))}
              />
            </div>
            <div>
              <label className="text-sm">Max Uses (optional)</label>
              <input
                type="number"
                className="mt-1 w-full border rounded p-2"
                placeholder="Unlimited if empty"
                value={form.max_uses == null ? "" : String(form.max_uses)}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, max_uses: val === "" ? null : Number(val) }));
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="coupon-active"
              type="checkbox"
              checked={Boolean(form.active)}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <label htmlFor="coupon-active">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="px-4 py-2 border rounded" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CouponsManagement;

