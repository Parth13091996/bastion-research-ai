import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import EditRowModal from '@/components/admin/EditRowModal';

const JobOpenings = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => axiosInstance.get('/api/jobs').then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => axiosInstance.delete(`/api/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      axiosInstance.put(`/api/jobs/${payload.id}`, payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const [editOpen, setEditOpen] = useState(false as any);
  const [editRow, setEditRow] = useState<any | null>(null);

  const openEdit = (row: any) => { setEditRow(row); setEditOpen(true); };

  const saveEdit = (values: any) => {
    if (!editRow) return;
    updateMutation.mutate({ id: editRow.job_id, body: {
      job_title: values.job_title,
      author: values.author,
      expiry: values.expiry,
      team: values.team,
      experience: values.experience,
      commitment: values.commitment,
      job_type: values.job_type,
      location: values.location,
    }});
    setEditOpen(false);
  };

  const removeJob = (id: number | string) => deleteMutation.mutate(id);

  const ActionsRenderer = (params: any) => (
    <div className="flex gap-2">
      <button className="p-1 text-gray-600 hover:text-blue-600" onClick={() => params.context.openEdit(params.data)} title="Edit"><Edit size={16} /></button>
      <button className="p-1 text-gray-600 hover:text-red-600" onClick={() => params.context.removeJob(params.data.job_id)} title="Delete"><Trash2 size={16} /></button>
    </div>
  );

  const columnDefs: ColDef[] = [
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Job Title', field: 'job_title' },
    { headerName: 'Author', field: 'author' },
    { headerName: 'Team', field: 'team' },
    { headerName: 'Experience', field: 'experience' },
    { headerName: 'Commitment', field: 'commitment' },
    { headerName: 'Type', field: 'job_type' },
    { headerName: 'Location', field: 'location' },
    { headerName: 'Applications', field: 'applications' },
    { headerName: 'Expiry', field: 'expiry' },
    { headerName: 'Views', field: 'views' },
    { headerName: 'Conversion', field: 'conversion' },
    { headerName: 'Actions', field: 'actions', cellRenderer: ActionsRenderer, sortable: false, filter: false, width: 120 },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Job Openings</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
          context={{ openEdit, removeJob }}
        />
      </div>
      <EditRowModal
        open={editOpen}
        title="Edit Job"
        fields={[
          { name: 'job_title', label: 'Job Title' },
          { name: 'author', label: 'Author' },
          { name: 'expiry', label: 'Expiry', type: 'date' },
          { name: 'team', label: 'Team' },
          { name: 'experience', label: 'Experience' },
          { name: 'commitment', label: 'Commitment' },
          { name: 'job_type', label: 'Job Type' },
          { name: 'location', label: 'Location' },
        ]}
        initialValues={editRow}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
        saving={updateMutation.isPending}
      />
    </div>
  );
};

export default JobOpenings;
