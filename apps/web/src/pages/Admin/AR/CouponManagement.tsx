import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import ConfirmationModal from "@/components/core/common/Modals/ConfirmationModal";

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null);

  // New: filters
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [validityFilter, setValidityFilter] = useState("all"); // 'all' | 'valid' | 'expired' | 'unlimited'

  // Dummy data
  const dummyData = [
    {
      id: 1,
      label: "",
      code: "101%",
      discount: "15,390.00 INR",
      startDate: "May 8, 2025",
      expireDate: "Unlimited",
      active: true,
      subscription: "All Membership Plans and paid posts",
      used: 0,
      allowedUses: "Unlimited",
    },
    {
      id: 2,
      label: "",
      code: "100%",
      discount: "15,889.15 INR",
      startDate: "May 8, 2025",
      expireDate: "Unlimited",
      active: true,
      subscription: "All Membership Plans and paid posts",
      used: 6,
      allowedUses: "Unlimited",
    },
    {
      id: 3,
      label: "",
      code: "BASTION15",
      discount: "15.00%",
      startDate: "December 9, 2024",
      expireDate: "December 14, 2024",
      active: true,
      subscription: "Annual Plan\nAll Paid Posts",
      used: 0,
      allowedUses: "1",
    },
    {
      id: 4,
      label: "Puzzle Promo Code",
      code: "YOUDIDIT",
      discount: "20.00%",
      startDate: "November 2, 2024",
      expireDate: "Unlimited",
      active: true,
      subscription: "Annual Plan\nAll Paid Posts",
      used: 2,
      allowedUses: "200",
    },
    {
      id: 5,
      label: "Discount to ISB Alumnus",
      code: "ISBALUM",
      discount: "15.00%",
      startDate: "October 4, 2024",
      expireDate: "Unlimited",
      active: true,
      subscription: "Annual Plan\nAll Paid Posts",
      used: 1,
      allowedUses: "Unlimited",
    },
    {
      id: 6,
      label: "Discount to Close Friends",
      code: "INNERCIRCLE",
      discount: "25.00%",
      startDate: "June 3, 2024",
      expireDate: "December 31, 2024",
      active: true,
      subscription: "Annual Plan\nAll Paid Posts",
      used: 1,
      allowedUses: "Unlimited",
    },
  ];

  const handleDelete = async (couponId) => {
    setCouponToDelete(couponId);
    setIsConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (couponToDelete === null) return;
    try {
      await axiosInstance.delete(`${endpoints.coupons.base}/${couponToDelete}`);
      await fetchCoupons(); // Refresh the list
      setSelectedCoupons((prev) => prev.filter((id) => id !== couponToDelete));
    } catch (error) {
      console.error("Failed to delete coupon:", error);
    } finally {
      setIsConfirmationOpen(false);
      setCouponToDelete(null);
    }
  };

  // helpers
  const isUnlimited = (d) => (d || "").toLowerCase() === "unlimited";

  const isExpired = (d) => {
    if (!d || isUnlimited(d)) return false;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return false; // if not parseable, treat as not expired
    const today = new Date();
    // compare date-only to avoid time edge-cases
    parsed.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return parsed < today;
  };

  const isValidNow = (d) => isUnlimited(d) || !isExpired(d);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get(endpoints.coupons.base);
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      // Fallback to dummy data if API fails
      setCoupons(dummyData);
    }
  };

  // Derived filtered list (search + filters)
  const filteredCoupons = useMemo(() => {
    const term = (searchTerm || "").toLowerCase().trim();

    return coupons.filter((c) => {
      // search across label, code, subscription
      const label = (c.label || "").toLowerCase();
      const code = (c.code || "").toLowerCase();
      const subscription = (c.subscription || "").toLowerCase();
      const matchesSearch =
        !term ||
        label.includes(term) ||
        code.includes(term) ||
        subscription.includes(term);

      // active filter
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && c.active) ||
        (activeFilter === "inactive" && !c.active);

      // validity filter
      const matchesValidity =
        validityFilter === "all" ||
        (validityFilter === "valid" && isValidNow(c.expireDate)) ||
        (validityFilter === "expired" && isExpired(c.expireDate)) ||
        (validityFilter === "unlimited" && isUnlimited(c.expireDate));

      return matchesSearch && matchesActive && matchesValidity;
    });
  }, [coupons, searchTerm, activeFilter, validityFilter]);

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;

  const getCurrentPageCoupons = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCoupons.slice(startIndex, endIndex);
  };

  // reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
    // also clear select-all state when data slice changes
    setSelectedCoupons((prev) =>
      prev.filter((id) => filteredCoupons.some((c) => c.id === id))
    );
  }, [searchTerm, activeFilter, validityFilter, itemsPerPage, coupons]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleBulkActionChange = (e) => setBulkAction(e.target.value);

  const handleBulkActionGo = async () => {
    if (!bulkAction || selectedCoupons.length === 0) return;

    try {
      if (bulkAction === "delete") {
        // Delete coupons one by one
        await Promise.all(
          selectedCoupons.map((id) =>
            axiosInstance.delete(`${endpoints.coupons.base}/${id}`)
          )
        );
        await fetchCoupons(); // Refresh the list
      } else if (bulkAction === "activate" || bulkAction === "deactivate") {
        // Update coupons one by one
        await Promise.all(
          selectedCoupons.map((id) =>
            axiosInstance.put(`${endpoints.coupons.base}/${id}`, {
              active: bulkAction === "activate",
            })
          )
        );
        await fetchCoupons(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }

    setSelectedCoupons([]);
    setBulkAction("");
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageIds = getCurrentPageCoupons().map((c) => c.id);
      setSelectedCoupons((prev) => {
        // union with current page ids
        const set = new Set([...prev, ...currentPageIds]);
        return Array.from(set);
      });
    } else {
      const currentPageIds = new Set(getCurrentPageCoupons().map((c) => c.id));
      setSelectedCoupons((prev) =>
        prev.filter((id) => !currentPageIds.has(id))
      );
    }
  };

  const handleSelectCoupon = (couponId) => {
    setSelectedCoupons((prev) =>
      prev.includes(couponId)
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId]
    );
  };

  const handleEdit = (couponId) => {
    // add your modal / navigation here
  };

  // const handleDelete = async (couponId) => {
  //   try {
  //     await axiosInstance.delete(`${endpoints.coupons.base}/${couponId}`);
  //     await fetchCoupons(); // Refresh the list
  //     setSelectedCoupons((prev) => prev.filter((id) => id !== couponId));
  //   } catch (error) {
  //     console.error('Failed to delete coupon:', error);
  //   }
  // };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const formatExpireDate = (date) => {
    if (isUnlimited(date)) return "Unlimited";
    if (isExpired(date)) {
      return <span className="text-red-500">{date}</span>;
    }
    return date;
  };

  const renderSubscription = (subscription) => {
    return (subscription || "").split("\n").map((line, index) => (
      <div key={index} className="text-sm text-gray-600">
        {line}
      </div>
    ));
  };

  // AgGrid Cell Renderers
  const CheckboxRenderer = (params: any) => (
    <input
      type="checkbox"
      checked={selectedCoupons.includes(params.data.id)}
      onChange={() => handleSelectCoupon(params.data.id)}
      className="rounded border-gray-300"
    />
  );

  const CodeRenderer = (params: any) => (
    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
      {params.value}
    </span>
  );

  const StatusRenderer = (params: any) => (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        params.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {params.value ? "Active" : "Inactive"}
    </span>
  );

  const ExpireDateRenderer = (params: any) => {
    const date = params.value;
    if (isUnlimited(date)) return "Unlimited";
    if (isExpired(date)) {
      return <span className="text-red-500">{date}</span>;
    }
    return date;
  };

  const ActionsRenderer = (params: any) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => handleEdit(params.data.id)}
        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(params.data.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  // AgGrid Column Definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "",
      field: "id",
      width: 50,
      checkboxSelection: false,
      headerCheckboxSelection: false,
      cellRenderer: CheckboxRenderer,
      sortable: false,
      filter: false,
    },
    {
      headerName: "Code",
      field: "code",
      cellRenderer: CodeRenderer,
    },
    {
      headerName: "Label",
      field: "label",
      valueFormatter: (params) => params.value || "-",
    },
    {
      headerName: "Discount",
      field: "discount",
    },
    {
      headerName: "Start Date",
      field: "startDate",
    },
    {
      headerName: "Expire Date",
      field: "expireDate",
      cellRenderer: ExpireDateRenderer,
    },
    {
      headerName: "Status",
      field: "active",
      cellRenderer: StatusRenderer,
    },
    {
      headerName: "Used",
      field: "used",
      valueFormatter: (params) =>
        `${params.value} / ${params.data.allowedUses}`,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
      width: 120,
    },
  ];

  // select-all checkbox checked state only for the current page slice
  const currentPageIds = new Set(getCurrentPageCoupons().map((c) => c.id));
  const allCurrentSelected =
    getCurrentPageCoupons().length > 0 &&
    getCurrentPageCoupons().every((c) => selectedCoupons.includes(c.id));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus size={20} className="mr-2" />
          Add Coupon
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={validityFilter}
            onChange={(e) => setValidityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Validity</option>
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedCoupons.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedCoupons.length} selected
            </span>
            <select
              value={bulkAction}
              onChange={handleBulkActionChange}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkActionGo}
              disabled={!bulkAction}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* AgGrid Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div
          className="rounded-md border bg-white ag-theme-alpine"
          style={{ height: 600, width: "100%" }}
        >
          <AgGridReact
            theme="legacy"
            rowData={filteredCoupons}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            pagination={true}
            paginationPageSize={itemsPerPage}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            onGridReady={(params: GridReadyEvent) => {
              // Handle any grid ready logic here if needed
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponsManagement;
