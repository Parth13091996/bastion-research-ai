import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Applications = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => axiosInstance.get('/api/applications').then((res) => res.data),
  });

  const [form, setForm] = useState({ job_id: '', applicant_name: '', status: 'Pending' });

  const createMutation = useMutation({
    mutationFn: () => axiosInstance.post('/api/applications', {
      job_id: Number(form.job_id),
      applicant_name: form.applicant_name,
      status: form.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setForm({ job_id: '', applicant_name: '', status: 'Pending' });
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

  const ActionsRenderer = (params: any) => {
    const current = params.data;
    const onEdit = () => {
      const status = window.prompt('Status', current.status) ?? current.status;
      const applicant_name = window.prompt('Applicant Name', current.applicant_name) ?? current.applicant_name;
      const job_id = Number(window.prompt('Job ID', String(current.job_id)) ?? current.job_id);
      updateMutation.mutate({ id: current.application_id, body: { job_id, applicant_name, status } });
    };
    const onDelete = () => {
      if (window.confirm('Delete this application?')) deleteMutation.mutate(current.application_id);
    };
    return (
      <div className="flex gap-2">
        <button className="p-1 text-gray-600 hover:text-blue-600" title="Edit" onClick={onEdit}><Edit size={16} /></button>
        <button className="p-1 text-gray-600 hover:text-red-600" title="Delete" onClick={onDelete}><Trash2 size={16} /></button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'application_id' },
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Applicant Name', field: 'applicant_name' },
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
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm mb-1">Job ID</label>
            <Input value={form.job_id} onChange={(e) => setForm({ ...form, job_id: e.target.value })} placeholder="e.g. 1" />
          </div>
          <div>
            <label className="block text-sm mb-1">Applicant Name</label>
            <Input value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} placeholder="John Doe" />
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
        <AgGridReact rowData={rowData} columnDefs={columnDefs} />
      </div>
    </div>
  );
};

export default Applications;