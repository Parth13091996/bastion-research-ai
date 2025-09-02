import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { Search, Edit, Trash2, Eye, Key, ChevronLeft, ChevronRight, User } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridApi, setGridApi] = useState<GridApi>();

  const itemsPerPage = 20;

  // Filter users based on search term and role
  const filteredUsers = useMemo(() => {
    return sampleUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, selectedRole]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const columnDefs: ColDef[] = [
    {
      headerName: '',
      field: 'select',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
    },
    {
      headerName: 'Username',
      field: 'username',
      cellRenderer: UsernameCellRenderer,
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Email',
      field: 'email',
      cellRenderer: EmailCellRenderer,
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Role',
      field: 'role',
      width: 120,
    },
    {
      headerName: 'Posts',
      field: 'posts',
      width: 80,
      cellClass: 'text-center',
    },
    {
      headerName: 'WordPress.com Account',
      field: 'wpAccount',
      width: 150,
      cellRenderer: ({ value }) => value ? '✓' : '—',
      cellClass: 'text-center',
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionsCellRenderer,
      width: 120,
      sortable: false,
      filter: false,
    },
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