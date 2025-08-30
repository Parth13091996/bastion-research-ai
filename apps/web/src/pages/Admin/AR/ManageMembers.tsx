import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Users,
  Building,
  Trash2,
  Filter,
  Settings,
} from "lucide-react";

// Mock data - replace with actual API calls
const mockMembers = [
  {
    id: 1,
    username: "kushalsolanki.001@gmail.com",
    email: "kushalsolanki.001@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Kushal",
    profileDisplayName: "Kushal Solanki",
    joinedDate: "August 20, 2025",
    avatar: null,
  },
  {
    id: 2,
    username: "Sudheerksr",
    email: "sudheerksr234@gmail.com",
    memberPlan: "AP",
    status: "Active",
    firstName: "Sudheer",
    profileDisplayName: "Sudheer Reddy",
    joinedDate: "August 17, 2025",
    avatar: null,
  },
  {
    id: 3,
    username: "edisonrenu@gmail.com",
    email: "edisonrenu@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Renu",
    profileDisplayName: "Renu Edison",
    joinedDate: "August 16, 2025",
    avatar: null,
  },
  {
    id: 4,
    username: "girishp.iitb@gmail.com",
    email: "girishp.iitb@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Girish",
    profileDisplayName: "Girish",
    joinedDate: "August 13, 2025",
    avatar: null,
  },
  {
    id: 5,
    username: "vaibhavs@orowealth.com",
    email: "vaibhavs@orowealth.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vaibhav",
    profileDisplayName: "Vaibhav Shah",
    joinedDate: "August 13, 2025",
    avatar: null,
  },
  {
    id: 6,
    username: "vinayagarwal88@gmail.com",
    email: "vinayagarwal88@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vinay",
    profileDisplayName: "Vinay Agarwal",
    joinedDate: "August 9, 2025",
    avatar: null,
  },
  {
    id: 7,
    username: "lkbansal00@gmail.com",
    email: "lkbansal00@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Laxmi Kant",
    profileDisplayName: "Laxmi Kant Bansal",
    joinedDate: "August 8, 2025",
    avatar: null,
  },
  {
    id: 8,
    username: "vishalsethia23@gmail.com",
    email: "vishalsethia23@gmail.com",
    memberPlan: "AP",
    status: "Active",
    firstName: "Vishal",
    profileDisplayName: "Vishal sethia",
    joinedDate: "August 7, 2025",
    avatar: null,
  },
  {
    id: 9,
    username: "vedantmaheshwaricima@gmail.com",
    email: "vedantmaheshwaricima@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Vedant",
    profileDisplayName: "Vedant Maheswari",
    joinedDate: "August 5, 2025",
    avatar: null,
  },
  {
    id: 10,
    username: "ranjeetsingh.crpf@gmail.com",
    email: "ranjeetsingh.crpf@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Ranjeet",
    profileDisplayName: "Ranjeet Singh",
    joinedDate: "August 4, 2025",
    avatar: null,
  },
  {
    id: 11,
    username: "ranjeetsingh.crpf@gmail.com",
    email: "ranjeetsingh.crpf@gmail.com",
    memberPlan: "F",
    status: "Active",
    firstName: "Ranjeet",
    profileDisplayName: "Ranjeet Singh",
    joinedDate: "August 4, 2025",
    avatar: null,
  },
];

const MemberManagementDashboard = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("Select field");
  const [selectedPlan, setSelectedPlan] = useState("Select Plans");
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [selectedMemberFilter, setSelectedMemberFilter] =
    useState("All Members");
  const [bulkAction, setBulkAction] = useState("Bulk Actions");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState({});

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Column definitions
  const columns = [
    { key: "select", label: "", width: "50px" },
    { key: "avatar", label: "Avatar", width: "80px" },
    { key: "username", label: "Username", width: "200px" },
    { key: "email", label: "Email Address", width: "280px" },
    { key: "memberPlan", label: "Member Plan", width: "120px" },
    { key: "status", label: "Status", width: "120px" },
    { key: "firstName", label: "First Name", width: "140px" },
    {
      key: "profileDisplayName",
      label: "Profile Display Name",
      width: "200px",
    },
    { key: "joinedDate", label: "Joined Date", width: "160px" },
  ];

  // Simulate API call
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMembers(mockMembers);
      setFilteredMembers(mockMembers);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.profileDisplayName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPlan !== "Select Plans") {
      filtered = filtered.filter(
        (member) => member.memberPlan === selectedPlan
      );
    }

    if (selectedStatus !== "Select Status") {
      filtered = filtered.filter((member) => member.status === selectedStatus);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, searchTerm, selectedPlan, selectedStatus]);

  // Handle row selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(currentMembers.map((member) => member.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Avatar component
  const Avatar = ({ member }) => {
    const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
        {getInitial(member.firstName)}
      </div>
    );
  };

  // Plan badge component
  const PlanBadge = ({ plan }) => {
    const getPlanColor = (plan) => {
      switch (plan) {
        case "F":
          return "bg-pink-500";
        case "AP":
          return "bg-purple-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div
        className={`w-8 h-8 rounded-full ${getPlanColor(plan)} flex items-center justify-center text-white text-xs font-medium`}
      >
        {plan}
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {status}
    </span>
  );

  // Row action menu component
  const RowActionMenu = ({ member }) => (
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 rounded-lg shadow-lg flex items-center space-x-1 px-2 py-1 z-10">
      <button
        className="p-1 text-white hover:bg-blue-700 rounded"
        title="View Details"
      >
        <Eye size={16} />
      </button>
      <button className="p-1 text-white hover:bg-blue-700 rounded" title="Edit">
        <Edit size={16} />
      </button>
      <button
        className="p-1 text-white hover:bg-blue-700 rounded"
        title="Users"
      >
        <Users size={16} />
      </button>
      <button
        className="p-1 text-white hover:bg-blue-700 rounded"
        title="Manage Plans"
      >
        <Building size={16} />
      </button>
      <button
        className="p-1 text-white hover:bg-blue-700 rounded"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredMembers.length)} of{" "}
          {filteredMembers.length} members
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">members</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            >
              ‹
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {page}
              </button>
            ))}

            <span className="text-sm text-gray-500">of {totalPages}</span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            >
              »
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm max-w-[80rem] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage Members
          </h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          {/* Upper filter row */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Member"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Select field</option>
              <option>Username</option>
              <option>Email</option>
              <option>First Name</option>
            </select>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Select Plans</option>
              <option>F</option>
              <option>AP</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Members</option>
              <option>Recent Members</option>
              <option>Premium Members</option>
            </select>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Apply
            </button>
          </div>

          {/* Horizontal divider */}
          <hr className="border-gray-200 mb-4" />

          {/* Lower filter row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Bulk Actions</option>
                <option>Delete Selected</option>
                <option>Export Selected</option>
                <option>Update Status</option>
              </select>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                Go
              </button>
            </div>

            {/* Show/Hide columns dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnOptions(!showColumnOptions)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Filter size={16} />
                <span>Show / Hide columns</span>
                <ChevronDown size={16} />
              </button>

              {showColumnOptions && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      Toggle Columns
                    </div>
                    {columns
                      .filter((col) => col.key !== "select")
                      .map((column) => (
                        <label
                          key={column.key}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <input
                            type="checkbox"
                            checked={!hiddenColumns[column.key]}
                            onChange={(e) =>
                              setHiddenColumns((prev) => ({
                                ...prev,
                                [column.key]: !e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {column.label}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table (flex-based with width applied to all cells) */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="w-full">
              {/* Header */}
              <div className="flex bg-gray-50 border-b border-gray-200">
                {columns.map(
                  (column) =>
                    !hiddenColumns[column.key] && (
                      <div
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        style={{ width: column.width }}
                      >
                        {column.key === "select" ? (
                          <input
                            type="checkbox"
                            checked={
                              selectedRows.length === currentMembers.length &&
                              currentMembers.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        ) : (
                          column.label
                        )}
                      </div>
                    )
                )}
              </div>

              {/* Body */}
              <div className="bg-white divide-y divide-gray-200">
                {currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex hover:bg-gray-50 relative"
                    onMouseEnter={() => setHoveredRow(member.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {!hiddenColumns.select && (
                      <div
                        className="px-4 py-4"
                        style={{
                          width: columns.find((c) => c.key === "select")?.width,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(member.id)}
                          onChange={() => handleSelectRow(member.id)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    )}

                    {!hiddenColumns.avatar && (
                      <div
                        className="px-4 py-4"
                        style={{
                          width: columns.find((c) => c.key === "avatar")?.width,
                        }}
                      >
                        <Avatar member={member} />
                      </div>
                    )}

                    {!hiddenColumns.username && (
                      <div
                        className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap"
                        style={{
                          width: columns.find((c) => c.key === "username")
                            ?.width,
                        }}
                      >
                        {member.username}
                      </div>
                    )}

                    {!hiddenColumns.email && (
                      <div
                        className="px-4 py-4 text-sm whitespace-nowrap"
                        style={{
                          width: columns.find((c) => c.key === "email")?.width,
                        }}
                      >
                        <a
                          href={`mailto:${member.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {member.email}
                        </a>
                      </div>
                    )}

                    {!hiddenColumns.memberPlan && (
                      <div
                        className="px-4 py-4"
                        style={{
                          width: columns.find((c) => c.key === "memberPlan")
                            ?.width,
                        }}
                      >
                        <PlanBadge plan={member.memberPlan} />
                      </div>
                    )}

                    {!hiddenColumns.status && (
                      <div
                        className="px-4 py-4"
                        style={{
                          width: columns.find((c) => c.key === "status")?.width,
                        }}
                      >
                        <StatusBadge status={member.status} />
                      </div>
                    )}

                    {!hiddenColumns.firstName && (
                      <div
                        className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap"
                        style={{
                          width: columns.find((c) => c.key === "firstName")
                            ?.width,
                        }}
                      >
                        {member.firstName}
                      </div>
                    )}

                    {!hiddenColumns.profileDisplayName && (
                      <div
                        className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap"
                        style={{
                          width: columns.find(
                            (c) => c.key === "profileDisplayName"
                          )?.width,
                        }}
                      >
                        {member.profileDisplayName}
                      </div>
                    )}

                    {!hiddenColumns.joinedDate && (
                      <div
                        className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap"
                        style={{
                          width: columns.find((c) => c.key === "joinedDate")
                            ?.width,
                        }}
                      >
                        {member.joinedDate}
                      </div>
                    )}

                    {/* Row action menu on hover */}
                    {hoveredRow === member.id && (
                      <RowActionMenu member={member} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination />
      </div>
    </div>
  );
};

export default MemberManagementDashboard;
