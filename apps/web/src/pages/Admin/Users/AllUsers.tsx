import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import EditRowModal from '@/components/admin/EditRowModal';

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

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const openEdit = (row: any) => { setEditRow(row); setEditOpen(true); };
  const saveEdit = (values: any) => {
    if (!editRow) return;
    updateMutation.mutate({ id: editRow.id, body: { username: values.username, email: values.email, first_name: values.first_name, last_name: values.last_name } });
    setEditOpen(false);
  };
  const removeUser = (id: string) => deleteMutation.mutate(id);
  const ActionsRenderer = (params: any) => (
    <div className="flex gap-2">
      <button className="p-1 text-gray-600 hover:text-blue-600" onClick={() => params.context.openEdit(params.data)} title="Edit"><Edit size={16} /></button>
      <button className="p-1 text-gray-600 hover:text-red-600" onClick={() => params.context.removeUser(params.data.id)} title="Delete"><Trash2 size={16} /></button>
    </div>
  );

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

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes();
      setSelectedUsers(selectedNodes.map(node => node.data));
    }
  }, [gridApi]);

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedUsers.length > 0) {
      console.log(`Performing ${bulkAction} on users:`, selectedUsers);
      alert(`${bulkAction} action performed on ${selectedUsers.length} users`);
    }
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
          Add User
        </button>
      </div>

      {/* Notification Bar */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-sm">
        <span className="text-blue-800">
          This theme recommends the following plugins: 
          <a href="#" className="text-blue-600 underline ml-1">ABC Pricing Table</a>,
          <a href="#" className="text-blue-600 underline ml-1">Image Gallery</a>,
          <a href="#" className="text-blue-600 underline ml-1">Lightbox Gallery</a>,
          <a href="#" className="text-blue-600 underline ml-1">Responsive Gallery</a> and
          <a href="#" className="text-blue-600 underline ml-1">Team Builder Member Showcase</a>.
        </span>
        <button className="float-right text-blue-600 hover:text-blue-800">×</button>
      </div>

      {/* Role Filter Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: `All (${sampleUsers.length})`, count: sampleUsers.length },
            { key: 'administrator', label: `Administrator (${sampleUsers.filter(u => u.role === 'Administrator').length})` },
            { key: 'customer', label: `Customer (${sampleUsers.filter(u => u.role === 'Customer').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleRoleFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedRole === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-40"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
              <option value="change-role">Change role to...</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedUsers.length === 0}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 px-4 py-2 text-sm rounded transition-colors"
            >
              Apply
            </button>
          </div>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
            <option>Change role to...</option>
            <option>Administrator</option>
            <option>Customer</option>
            <option>Subscriber</option>
          </select>
          <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 text-sm rounded transition-colors">
            Change
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="border border-gray-300 rounded pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded transition-colors"
          >
            Search Users
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ag-theme-alpine border border-gray-300 rounded" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={paginatedUsers}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
          context={{ openEdit, removeUser }}
        />
      </div>
      <EditRowModal
        open={editOpen}
        title="Edit User"
        fields={[
          { name: 'username', label: 'Username' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'first_name', label: 'First Name' },
          { name: 'last_name', label: 'Last Name' },
        ]}
        initialValues={editRow}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
        saving={updateMutation.isPending}
      />
    </div>
  );
};

export default AllUsers;