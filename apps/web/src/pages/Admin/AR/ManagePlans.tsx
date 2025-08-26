import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const MembershipPlans = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);

  const plansData = [
    {
      id: 5,
      name: "Freemium",
      type: "Free",
      priceAmount: 0,
      currency: "INR",
      duration: "-",
      members: 166,
      role: "ARMember",
    },
    {
      id: 4,
      name: "Bastion Research Core",
      type: "Paid",
      priceAmount: 4000,
      currency: "INR",
      duration: "3 months x 12 installments",
      members: 5,
      role: "ARMember",
    },
    {
      id: 2,
      name: "Annual Plan",
      type: "Paid",
      priceAmount: 15890,
      currency: "INR",
      duration: "12 months (One-time)",
      members: 49,
      role: "ARMember",
    },
  ];

  const filteredPlans = useMemo(() => {
    return plansData.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.id.toString().includes(searchTerm) ||
        plan.members.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  const totalEntries = filteredPlans.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredPlans.slice(startIndex, endIndex);

  const handlePlanClick = (planId) => console.log(`Clicked plan ID: ${planId}`);
  const handleMemberClick = (members) =>
    console.log(`Clicked members: ${members}`);
  const handleEdit = (planId) => console.log(`Edit plan ID: ${planId}`);
  const handleDelete = (planId) => console.log(`Delete plan ID: ${planId}`);
  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="bg-gray-50 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[80rem] bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Manage Membership Plans
          </h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Add New Plan
          </button>
        </div>

        {/* Search */}
        <div className="p-2">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-1">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Plan ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Plan Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Plan Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Members
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Wp Role
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Price Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Currency
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-gray-100 hover:bg-gray-50 group relative"
                    onMouseEnter={() => setHoveredRow(plan.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handlePlanClick(plan.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {plan.id}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handlePlanClick(plan.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {plan.name}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium w-fit ${
                          plan.type === "Free"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {plan.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleMemberClick(plan.members)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {plan.members}
                      </button>
                    </td>
                    <td className="py-3 px-4">{plan.role}</td>
                    <td className="py-3 px-4">{plan.priceAmount}</td>
                    <td className="py-3 px-4">{plan.currency}</td>
                    <td className="py-3 px-4">{plan.duration}</td>
                    <td className="py-3 px-4 relative">
                      {hoveredRow === plan.id && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex bg-blue-600 rounded shadow-lg">
                          <button
                            onClick={() => handleEdit(plan.id)}
                            className="p-2 text-white hover:bg-blue-700 rounded-l transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-2 text-white hover:bg-blue-700 rounded-r transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <span className="text-sm text-gray-700 mx-2">
                  of {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
