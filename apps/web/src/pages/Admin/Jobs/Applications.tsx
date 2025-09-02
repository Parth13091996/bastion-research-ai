import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';

const Applications = () => {
  // Mock data based on the first image
  const mockData = [
    { id: 1, applicant_name: 'SHIVTIKA GAKKERA', job_id: 14830, job_title: 'Research Analyst Trainee', applied_on: '4 hours ago' },
    { id: 2, applicant_name: 'Navya Raju', job_id: 14839, job_title: 'Research Analyst Trainee', applied_on: '22 hours ago' },
    { id: 3, applicant_name: 'Nandani Jain', job_id: 14879, job_title: 'Research Analyst Trainee', applied_on: '1 day ago' },
    { id: 4, applicant_name: 'Shah Ashish', job_id: 14879, job_title: 'Research Analyst Trainee', applied_on: '1 day ago' },
    { id: 5, applicant_name: 'Shreya Agarwal', job_id: 14871, job_title: 'Research Analyst Trainee', applied_on: '3 days ago' },
    { id: 6, applicant_name: 'VISHAL CHANDRA', job_id: 14834, job_title: 'Research Analyst Trainee', applied_on: '4 days ago' },
    { id: 7, applicant_name: 'Yashvee Kaith', job_id: 14844, job_title: 'Research Analyst Trainee', applied_on: '1 week ago' },
    { id: 8, applicant_name: 'Anirudh Mishra', job_id: 14825, job_title: 'Research Analyst Trainee', applied_on: '1 week ago' },
    { id: 9, applicant_name: 'Chetan Gauniya', job_id: 14826, job_title: 'Research Analyst Trainee', applied_on: '1 week ago' },
    { id: 10, applicant_name: 'Bhargav Shah', job_id: 14877, job_title: 'Research Analyst Trainee', applied_on: '2 weeks ago' },
    { id: 11, applicant_name: 'Sahara Ganesh Rohtak', job_id: 14877, job_title: 'Research Analyst Trainee', applied_on: '2 weeks ago' },
    { id: 12, applicant_name: 'Abhishek Thakur', job_id: 14810, job_title: 'Research Analyst Trainee', applied_on: '3 weeks ago' },
    { id: 13, applicant_name: 'Roshan Phyul', job_id: 14816, job_title: 'Healthcare System Developer', applied_on: '3 weeks ago' },
    { id: 14, applicant_name: 'Rajkiran purohit', job_id: 14819, job_title: 'Research Analyst Trainee', applied_on: '4 weeks ago' },
    { id: 15, applicant_name: 'Anup B Hegde', job_id: 14888, job_title: 'Healthcare System Developer', applied_on: '4 weeks ago' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [jobFilter, setJobFilter] = useState('All Jobs');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      const matchesSearch = item.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.job_id.toString().includes(searchTerm);
      const matchesJob = jobFilter === 'All Jobs' || item.job_title === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [searchTerm, jobFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(paginatedData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const uniqueJobTitles = [...new Set(mockData.map(item => item.job_title))];

  const handleEdit = (item) => {
    console.log('Edit:', item);
    setActiveDropdown(null);
  };

  const handleDelete = (item) => {
    console.log('Delete:', item);
    setActiveDropdown(null);
  };

  const handleView = (item) => {
    console.log('View:', item);
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6" onClick={() => setActiveDropdown(null)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Applications</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              + Add Application
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              + Bulk Create
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 lg:items-center">
              {/* Bulk Actions */}
              <div className="relative">
                <select 
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                >
                  <option value="">Bulk Actions</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button 
                onClick={() => console.log('Go clicked')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Go
              </button>

              {/* Job Filter */}
              <div className="relative">
                <select 
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                >
                  <option value="All Jobs">All Jobs</option>
                  {uniqueJobTitles.map(job => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Applications"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 transition-colors group relative"
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {item.applicant_name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{item.applicant_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{item.job_id}</td>
                    <td className="px-6 py-4 text-gray-700">{item.job_title}</td>
                    <td className="px-6 py-4 text-gray-500">{item.applied_on}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 transition-opacity duration-200 ${hoveredRow === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                          onClick={() => handleView(item)}
                          className="p-2 text-white hover:text-black bg-blue-600 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-white hover:text-green-600 bg-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-white hover:text-red-600 bg-blue-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {paginatedData.map((item) => (
              <div key={item.id} className="border-b border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {item.applicant_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.applicant_name}</p>
                      <p className="text-sm text-blue-600 font-medium">ID: {item.job_id}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeDropdown === item.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleView(item)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-11">
                  <p className="text-sm text-gray-700 mb-1">{item.job_title}</p>
                  <p className="text-sm text-gray-500">Applied {item.applied_on}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">entries</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center lg:justify-end">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {totalPages <= 7 ? (
                    // Show all pages if 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))
                  ) : (
                    // Show truncated pagination for more than 7 pages
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        1
                      </button>
                      {currentPage > 3 && <span className="px-2 text-gray-400">...</span>}
                      {Array.from({ length: 3 }, (_, i) => {
                        const page = Math.max(2, Math.min(totalPages - 1, currentPage + i - 1));
                        return page <= totalPages - 1 && page >= 2 ? (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ) : null;
                      })}
                      {currentPage < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                      {totalPages > 1 && (
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === totalPages
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;