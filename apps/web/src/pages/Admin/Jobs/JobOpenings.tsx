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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Openings</h1>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={18} />
            Add New Job
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download size={18} />
            Bulk Create
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Bulk Actions */}
            <div className="relative">
              <select 
                value={bulkAction} 
                onChange={(e) => setBulkAction(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Bulk actions</option>
                <option>Delete Selected</option>
                <option>Archive Selected</option>
                <option>Duplicate Selected</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors">
              Apply
            </button>

            {/* Filters */}
            <div className="relative">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Expired</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select 
                value={seoFilter} 
                onChange={(e) => setSeoFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>All SEO Scores</option>
                <option>Excellent (90+)</option>
                <option>Good (80-89)</option>
                <option>Fair (70-79)</option>
                <option>Poor (&lt;70)</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select 
                value={readabilityFilter} 
                onChange={(e) => setReadabilityFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>All Readability Scores</option>
                <option>Excellent (90+)</option>
                <option>Good (80-89)</option>
                <option>Fair (70-79)</option>
                <option>Poor (&lt;70)</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Job Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Job ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Applications</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Expiry</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Views</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Conversion</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr
                  key={job.job_id}
                  className="hover:bg-gray-50 relative group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job.job_id)}
                      onChange={() => handleSelectJob(job.job_id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">{job.job_title}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.job_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.author}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.applications}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.expiry}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.views}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.conversion}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>

                  {/* Hover Actions */}
                  <td className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
  <button className="p-2 rounded bg-blue-600 text-white hover:text-green-500 transition">
    <Edit size={16} />
  </button>
  <button className="p-2 rounded bg-blue-600 text-white hover:text-red-500 transition">
    <Trash2 size={16} />
  </button>
  <button className="p-2 rounded bg-blue-600 text-white hover:text-yellow-400 transition">
    <Eye size={16} />
  </button>
</div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredJobs.length} of {filteredJobs.length} entries
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOpenings;
