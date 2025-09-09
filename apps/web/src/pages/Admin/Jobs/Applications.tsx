import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus } from 'lucide-react';
import EditRowModal from '@/components/admin/EditRowModal';

const Applications = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => axiosInstance.get('/api/applications').then((res) => res.data),
  });

  const [form, setForm] = useState({ job_id: '', applicant_name: '', email: '', phone: '', cover_letter: '', status: 'Pending' });

  const createMutation = useMutation({
    mutationFn: () => axiosInstance.post('/api/applications', {
      job_id: Number(form.job_id),
      applicant_name: form.applicant_name,
      email: form.email,
      phone: form.phone,
      cover_letter: form.cover_letter,
      status: form.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setForm({ job_id: '', applicant_name: '', email: '', phone: '', cover_letter: '', status: 'Pending' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => axiosInstance.put(`/api/applications/${payload.id}`, payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => axiosInstance.delete(`/api/applications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const openEdit = (row: any) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const saveEdit = (values: any) => {
    if (!editRow) return;
    const body = {
      job_id: Number(values.job_id),
      applicant_name: values.applicant_name,
      email: values.email,
      phone: values.phone,
      cover_letter: values.cover_letter,
      status: values.status,
    };
    updateMutation.mutate({ id: editRow.application_id, body });
    setEditOpen(false);
  };

  const deleteApplication = (id: number | string) => deleteMutation.mutate(id);

  const ActionsRenderer = (params: any) => (
    <div className="flex gap-2">
      <button className="p-1 text-gray-600 hover:text-blue-600" title="Edit" onClick={() => params.context.openEdit(params.data)}><Edit size={16} /></button>
      <button className="p-1 text-gray-600 hover:text-red-600" title="Delete" onClick={() => params.context.deleteApplication(params.data.application_id)}><Trash2 size={16} /></button>
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'application_id' },
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Applicant Name', field: 'applicant_name' },
    { headerName: 'Email', field: 'email' },
    { headerName: 'Phone', field: 'phone' },
    { headerName: 'Date Applied', field: 'date_applied' },
    { headerName: 'Status', field: 'status' },
    { headerName: 'Actions', cellRenderer: ActionsRenderer, sortable: false, filter: false, width: 120 },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <div className="bg-white p-4 rounded shadow mb-4 flex items-end gap-2">
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-sm mb-1">Job ID</label>
            <Input value={form.job_id} onChange={(e) => setForm({ ...form, job_id: e.target.value })} placeholder="e.g. 1" />
          </div>
          <div>
            <label className="block text-sm mb-1">Applicant Name</label>
            <Input value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9999999999" />
          </div>
          <div className="min-w-[280px]">
            <label className="block text-sm mb-1">Cover Letter</label>
            <Input value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="Pending" />
          </div>
        </div>
        <Button className="ml-auto" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="mr-1" size={16} /> Add Application
        </Button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          context={{ openEdit, deleteApplication }}
        />
      </div>
      <EditRowModal
        open={editOpen}
        title="Edit Application"
        fields={[
          { name: 'job_id', label: 'Job ID', type: 'number' },
          { name: 'applicant_name', label: 'Applicant Name' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'cover_letter', label: 'Cover Letter' },
          { name: 'status', label: 'Status' },
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
