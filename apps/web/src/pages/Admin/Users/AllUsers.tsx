import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { Edit, Trash2 } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Sample data based on the WordPress admin interface
const sampleUsers = [
  { id: 1, username: '124.kushal@gmail.com', name: 'Kushal Kashinat', email: '124.kushal@gmail.com', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 2, username: '2017sharpnetdesign@gmail.com', name: 'Chanpreet Sablan', email: '2017sharpnetdesign@gmail.com', role: 'Customer', posts: 0, wpAccount: false },
  { id: 3, username: '7mountainfinanceservice@gmail.com', name: 'Dulip T Mehta', email: '7mountainfinanceservice@gmail.com', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 4, username: 'abhinav@kalsfifinancial.in', name: 'Abhinav Kumar', email: 'abhinav@kalsfifinancial.in', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 5, username: 'abhinavsindhi1@gmail.com', name: 'Abhinav Sindhi', email: 'abhinavsindhi1@gmail.com', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 6, username: 'abundantx2035', name: 'ASHISH SAHU', email: 'abundantx2035@gmail.com', role: 'Customer', posts: 0, wpAccount: false },
  { id: 7, username: 'admin', name: '—', email: 'team.bapticovereserch@gmail.com', role: 'Administrator', posts: 259, wpAccount: true },
  { id: 8, username: 'agnelson@gmail.com', name: 'Agnel Ron', email: 'agnelson@gmail.com', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 9, username: 'aj30908@gmail.com', name: 'Anurag Joshi', email: 'aj30908@gmail.com', role: 'Administrator', posts: 0, wpAccount: true },
  { id: 10, username: 'ajinkya@kriii.in', name: 'Ajinkya Jadhav', email: 'ajinkya@kriii.in', role: 'Administrator', posts: 0, wpAccount: true },
];

// Custom cell renderer for actions
const ActionsCellRenderer = ({ data }) => {
  const [showActions, setShowActions] = useState(false);

  const actions = [
    { icon: Eye, name: 'View', color: 'text-blue-600 hover:text-blue-800' },
    { icon: Edit, name: 'Edit', color: 'text-green-600 hover:text-green-800' },
    { icon: Trash2, name: 'Delete', color: 'text-red-600 hover:text-red-800' },
    { icon: Key, name: 'Send Password Reset', color: 'text-purple-600 hover:text-purple-800' },
  ];

  return (
    <div 
      className="relative h-full flex items-center"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex space-x-1 bg-blue-100 rounded-md p-1 shadow-md z-10 border border-blue-200">
          {actions.map((action, index) => (
            <div key={index} className="relative group">
              <button
                className={`p-1 rounded hover:bg-blue-200 transition-colors ${action.color}`}
                onClick={() => console.log(`${action.name} user:`, data.username)}
              >
                <action.icon size={16} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom cell renderer for username with avatar
const UsernameCellRenderer = ({ data }) => (
  <div className="flex items-center space-x-2 h-full">
    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
      <User size={16} className="text-gray-600" />
    </div>
    <span className="text-blue-600 hover:underline cursor-pointer">{data.username}</span>
  </div>
);

// Custom cell renderer for email
const EmailCellRenderer = ({ data }) => (
  <span className="text-blue-600 hover:underline cursor-pointer">{data.email}</span>
);

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
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          headerHeight={40}
          rowHeight={50}
          animateRows={true}
          pagination={false}
          className="text-sm"
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div>
          {filteredUsers.length} items
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded">
            {currentPage}
          </span>
          <span>of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;