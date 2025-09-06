import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Edit, Trash2 } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AllUsers = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => axiosInstance.get('/api/users').then((res) => res.data),
  });
  
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) => axiosInstance.put(`/api/users/${payload.id}`, payload.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/api/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const ActionsRenderer = (params: any) => {
    const current = params.data;
    const onEdit = () => {
      const username = window.prompt('Username', current.username) ?? current.username;
      const email = window.prompt('Email', current.email) ?? current.email;
      const first_name = window.prompt('First Name', current.first_name) ?? current.first_name;
      const last_name = window.prompt('Last Name', current.last_name) ?? current.last_name;
      updateMutation.mutate({ id: current.id, body: { username, email, first_name, last_name } });
    };
    const onDelete = () => {
      if (window.confirm('Delete this user?')) deleteMutation.mutate(current.id);
    };
    return (
      <div className="flex gap-2">
        <button className="p-1 text-gray-600 hover:text-blue-600" onClick={onEdit} title="Edit"><Edit size={16} /></button>
        <button className="p-1 text-gray-600 hover:text-red-600" onClick={onDelete} title="Delete"><Trash2 size={16} /></button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id' },
    { headerName: 'Username', field: 'username' },
    { headerName: 'First Name', field: 'first_name' },
    { headerName: 'Last Name', field: 'last_name' },
    { headerName: 'Email', field: 'email' },
    { headerName: 'Role', field: 'role' },
    { headerName: 'Premium', field: 'isPremium' },
    { headerName: 'OAuth', field: 'cameFromOAuth' },
    { headerName: 'Actions', cellRenderer: ActionsRenderer, sortable: false, filter: false, width: 120 },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
};

export default AllUsers;
