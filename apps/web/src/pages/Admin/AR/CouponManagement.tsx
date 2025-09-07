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
    <div>
      <h1 className="text-2xl font-bold mb-4">Coupon Management</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};

export default CouponsManagement;
