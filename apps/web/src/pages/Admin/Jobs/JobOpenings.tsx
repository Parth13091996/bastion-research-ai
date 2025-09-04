import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Edit, Trash2 } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
    mutationFn: (payload: { id: number | string; job_title: string; author: string; expiry: string }) =>
      axiosInstance.put(`/api/jobs/${payload.id}`, {
        job_title: payload.job_title,
        author: payload.author,
        expiry: payload.expiry,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const ActionsRenderer = (params: any) => {
    const onEdit = () => {
      const current = params.data;
      const job_title = window.prompt('Job Title', current.job_title) ?? current.job_title;
      const author = window.prompt('Author', current.author) ?? current.author;
      const expiry = window.prompt('Expiry (YYYY-MM-DD)', current.expiry) ?? current.expiry;
      updateMutation.mutate({ id: current.job_id, job_title, author, expiry });
    };
    const onDelete = () => {
      if (window.confirm('Delete this job?')) {
        deleteMutation.mutate(params.data.job_id);
      }
    };
    return (
      <div className="flex gap-2">
        <button className="p-1 text-gray-600 hover:text-blue-600" onClick={onEdit} title="Edit"><Edit size={16} /></button>
        <button className="p-1 text-gray-600 hover:text-red-600" onClick={onDelete} title="Delete"><Trash2 size={16} /></button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Job Title', field: 'job_title' },
    { headerName: 'Author', field: 'author' },
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
        />
      </div>
    </div>
  );
};

export default JobOpenings;
