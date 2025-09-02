import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);

  // New: filters
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [validityFilter, setValidityFilter] = useState('all'); // 'all' | 'valid' | 'expired' | 'unlimited'

  // Dummy data
  const dummyData = [
    {
      id: 1,
      label: '',
      code: '101%',
      discount: '15,390.00 INR',
      startDate: 'May 8, 2025',
      expireDate: 'Unlimited',
      active: true,
      subscription: 'All Membership Plans and paid posts',
      used: 0,
      allowedUses: 'Unlimited'
    },
    {
      id: 2,
      label: '',
      code: '100%',
      discount: '15,889.15 INR',
      startDate: 'May 8, 2025',
      expireDate: 'Unlimited',
      active: true,
      subscription: 'All Membership Plans and paid posts',
      used: 6,
      allowedUses: 'Unlimited'
    },
    {
      id: 3,
      label: '',
      code: 'BASTION15',
      discount: '15.00%',
      startDate: 'December 9, 2024',
      expireDate: 'December 14, 2024',
      active: true,
      subscription: 'Annual Plan\nAll Paid Posts',
      used: 0,
      allowedUses: '1'
    },
    {
      id: 4,
      label: 'Puzzle Promo Code',
      code: 'YOUDIDIT',
      discount: '20.00%',
      startDate: 'November 2, 2024',
      expireDate: 'Unlimited',
      active: true,
      subscription: 'Annual Plan\nAll Paid Posts',
      used: 2,
      allowedUses: '200'
    },
    {
      id: 5,
      label: 'Discount to ISB Alumnus',
      code: 'ISBALUM',
      discount: '15.00%',
      startDate: 'October 4, 2024',
      expireDate: 'Unlimited',
      active: true,
      subscription: 'Annual Plan\nAll Paid Posts',
      used: 1,
      allowedUses: 'Unlimited'
    },
    {
      id: 6,
      label: 'Discount to Close Friends',
      code: 'INNERCIRCLE',
      discount: '25.00%',
      startDate: 'June 3, 2024',
      expireDate: 'December 31, 2024',
      active: true,
      subscription: 'Annual Plan\nAll Paid Posts',
      used: 1,
      allowedUses: 'Unlimited'
    }
  ];

  // helpers
  const isUnlimited = (d) => (d || '').toLowerCase() === 'unlimited';

  const isExpired = (d) => {
    if (!d || isUnlimited(d)) return false;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return false; // if not parseable, treat as not expired
    const today = new Date();
    // compare date-only to avoid time edge-cases
    parsed.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return parsed < today;
  };

  const isValidNow = (d) => isUnlimited(d) || !isExpired(d);

  useEffect(() => {
    setCoupons(dummyData);
  }, []);

  // Derived filtered list (search + filters)
  const filteredCoupons = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();

    return coupons.filter((c) => {
      // search across label, code, subscription
      const label = (c.label || '').toLowerCase();
      const code = (c.code || '').toLowerCase();
      const subscription = (c.subscription || '').toLowerCase();
      const matchesSearch =
        !term || label.includes(term) || code.includes(term) || subscription.includes(term);

      // active filter
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && c.active) ||
        (activeFilter === 'inactive' && !c.active);

      // validity filter
      const matchesValidity =
        validityFilter === 'all' ||
        (validityFilter === 'valid' && isValidNow(c.expireDate)) ||
        (validityFilter === 'expired' && isExpired(c.expireDate)) ||
        (validityFilter === 'unlimited' && isUnlimited(c.expireDate));

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
    setSelectedCoupons((prev) => prev.filter((id) => filteredCoupons.some((c) => c.id === id)));
  }, [searchTerm, activeFilter, validityFilter, itemsPerPage, coupons]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleBulkActionChange = (e) => setBulkAction(e.target.value);

  const handleBulkActionGo = () => {
    if (!bulkAction || selectedCoupons.length === 0) return;

    setCoupons((prev) => {
      if (bulkAction === 'delete') {
        return prev.filter((c) => !selectedCoupons.includes(c.id));
      }
      if (bulkAction === 'activate') {
        return prev.map((c) => (selectedCoupons.includes(c.id) ? { ...c, active: true } : c));
      }
      if (bulkAction === 'deactivate') {
        return prev.map((c) => (selectedCoupons.includes(c.id) ? { ...c, active: false } : c));
      }
      return prev;
    });

    setSelectedCoupons([]);
    setBulkAction('');
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
      setSelectedCoupons((prev) => prev.filter((id) => !currentPageIds.has(id)));
    }
  };

  const handleSelectCoupon = (couponId) => {
    setSelectedCoupons((prev) =>
      prev.includes(couponId) ? prev.filter((id) => id !== couponId) : [...prev, couponId]
    );
  };

  const handleEdit = (couponId) => {
    console.log('Edit coupon:', couponId);
    // add your modal / navigation here
  };

  const handleDelete = (couponId) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    setSelectedCoupons((prev) => prev.filter((id) => id !== couponId));
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const formatExpireDate = (date) => {
    if (isUnlimited(date)) return 'Unlimited';
    if (isExpired(date)) {
      return <span className="text-red-500">{date}</span>;
    }
    return date;
    };

  const renderSubscription = (subscription) => {
    return (subscription || '').split('\n').map((line, index) => (
      <div key={index} className="text-sm text-gray-600">
        {line}
      </div>
    ));
  };

  // select-all checkbox checked state only for the current page slice
  const currentPageIds = new Set(getCurrentPageCoupons().map((c) => c.id));
  const allCurrentSelected =
    getCurrentPageCoupons().length > 0 &&
    getCurrentPageCoupons().every((c) => selectedCoupons.includes(c.id));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">+</span>
              Add Coupon
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">+</span>
              Bulk Create
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <select
              value={bulkAction}
              onChange={handleBulkActionChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
            </select>
            <button
              onClick={handleBulkActionGo}
              disabled={!bulkAction || selectedCoupons.length === 0}
              className={`px-4 py-2 rounded text-sm font-medium text-white ${
                !bulkAction || selectedCoupons.length === 0
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Go
            </button>

            {/* New: Active filter */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* New: Validity filter */}
            <select
              value={validityFilter}
              onChange={(e) => setValidityFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Validity</option>
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search label, code or subscription"
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 rounded px-4 py-2 pr-10 text-sm w-72"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 p-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={allCurrentSelected}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Coupon Label</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Coupon Code</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Discount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Start Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Expire Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Active</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Subscription</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Used</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Allowed Uses</th>
                <th className="w-24 p-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageCoupons().map((coupon, index) => (
                <tr
                  key={coupon.id}
                  className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  onMouseEnter={() => setHoveredRow(coupon.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedCoupons.includes(coupon.id)}
                      onChange={() => handleSelectCoupon(coupon.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-900">{coupon.label}</td>
                  <td className="p-4 text-sm text-blue-600 font-medium underline cursor-pointer">
                    {coupon.code}
                  </td>
                  <td className="p-4 text-sm text-gray-900">{coupon.discount}</td>
                  <td className="p-4 text-sm text-gray-900">{coupon.startDate}</td>
                  <td className="p-4 text-sm text-gray-900">{formatExpireDate(coupon.expireDate)}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${coupon.active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${coupon.active ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900">{renderSubscription(coupon.subscription)}</td>
                  <td className="p-4 text-sm text-gray-900">{coupon.used}</td>
                  <td className="p-4 text-sm text-gray-900">{coupon.allowedUses}</td>
                  <td className="p-4 relative text-right">
                    <div
                      className={`flex gap-2 justify-end absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
                        hoveredRow === coupon.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button
                        onClick={() => handleEdit(coupon.id)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-sm text-gray-500">
                    No coupons found for the selected filters/search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-6 border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredCoupons.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length} entries
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded">
                {currentPage}
              </span>
              <span className="text-sm text-gray-600">of {totalPages}</span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || filteredCoupons.length === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orange Help Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg">
          <span className="text-xl font-bold">?</span>
        </button>
      </div>
    </div>
  );
};

export default CouponsManagement;
