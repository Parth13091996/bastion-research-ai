import { AppRoutes } from "../routes/app-routes";
import type { ColDef } from "ag-grid-community";

import { PersonIcon } from "@radix-ui/react-icons";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Newspaper,
  Play,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SiSubstack } from "react-icons/si";
import axiosInstance from "@/api/axios";

const useConstants = () => {
  const formatDate = (v?: string | null) => {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString();
  };
  const StatusBadge = ({ value }: { value?: string }) => {
    const v = (value || "").toLowerCase();
    const classes =
      TransactionHistoryConstants.statusBadge.success.values.includes(v)
        ? TransactionHistoryConstants.statusBadge.success.classes
        : TransactionHistoryConstants.statusBadge.error.values.includes(v)
          ? TransactionHistoryConstants.statusBadge.error.classes
          : TransactionHistoryConstants.statusBadge.default.classes;
    return (
      <span
        className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium ${classes}`}
      >
        {value || "-"}
      </span>
    );
  };

  const TransactionHistoryCurrency = (
    v?: number | string | null,
    currencyConfig?: { locale: string; currency: string }
  ) => {
    const defaultConfig = { locale: "en-IN", currency: "INR" };
    const config = currencyConfig || defaultConfig;
    if (v == null || v === "") return "-";
    const n = typeof v === "string" ? Number(v) : v;
    if (isNaN(n as number)) return String(v);
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
    }).format(n as number);
  };

  const BrandColors = {
    red: "#C00000",
    blue: "#1C2852",
    beige: "#C4B696",
    light: "#E6E6E6",
  };

  const navItems = [
    {
      key: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      path: AppRoutes.dashboard,
    },
    {
      key: "recommendation",
      name: "Recommendation",
      icon: TrendingUp,
      path: "/user/app/recommendation",
    },
    {
      key: "premium_webinars",
      name: "Premium Webinars",
      icon: Play,
      path: "/user/app/premium-webinars",
    },
    {
      key: "scratch_pad_newsletter",
      name: "Scratch Pad Newsletter",
      icon: Newspaper,
      path: AppRoutes.scratch_pad_newsletter,
    },
    {
      key: "my_account",
      name: "My Account",
      icon: User,
      path: "/user/app/account/edit-profile", // assuming the base path is for editing
      subItems: [
        {
          key: "edit_profile",
          name: "Edit Profile",
          path: "/user/app/account/edit-profile",
          icon: Settings,
        },
        {
          key: "show_subscription",
          name: "Show Subscription",
          path: "/user/app/account/subscription",
          icon: CreditCard,
        },
        {
          key: "transaction_history",
          name: "Transaction History",
          path: "/user/app/account/transactions",
          icon: BarChart3,
        },
      ],
    },
    // WhatsApp group access: free vs paid
    // Free users: channel link; paid users: existing group link
    // The actual gating happens in the sidebar using subscription data.
    {
      key: "subscribe_substack",
      name: "Subscribe to Substack",
      icon: SiSubstack,
      path: "https://substack.com/@bastionresearch?utm_campaign=profile&utm_medium=profile-page",
    },
    {
      key: "admin_panel",
      name: "Admin Panel",
      icon: PersonIcon,
      path: AppRoutes.adminDashboard,
    },
  ];

  const TransactionHistoryConstants = {
    pageTitle: "Transaction History",
    pageDescription: "View your payments and subscription transactions.",
    labels: {
      totalRecords: "Total Records",
      totalAmount: "Total Amount",
    },
    search: {
      placeholder: "Search transactions, invoice, gateway...",
    },
    messages: {
      loadError: "Failed to load transactions.",
    },
    statusBadge: {
      success: {
        classes: "bg-green-100 text-green-800",
        values: ["success", "completed"],
      },
      error: {
        classes: "bg-red-100 text-red-800",
        values: ["failed", "cancelled"],
      },
      default: {
        classes: "bg-blue-100 text-blue-800",
      },
    },
    columns: {
      date: "Date",
      invoice: "Invoice",
      transaction: "Transaction",
      membership: "Membership",
      gateway: "Gateway",
      type: "Type",
      status: "Status",
      amount: "Amount",
    },
    currency: {
      locale: "en-IN",
      currency: "INR",
    },
    grid: {
      height: 400,
      rowHeight: 40,
      headerHeight: 40,
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
      },
    },
  };

  const TransactionHistoryColDefs: ColDef<PaymentRow>[] = [
    {
      headerName: TransactionHistoryConstants.columns.date,
      field: "payment_date",
      valueFormatter: (p) => formatDate(p.value as string),
      minWidth: 100,
      maxWidth: 120,
    },
    {
      headerName: TransactionHistoryConstants.columns.invoice,
      field: "invoice_id",
      minWidth: 100,
      maxWidth: 150,
      cellRenderer: (params: any) => {
        const row = params.data as PaymentRow;
        const transactionId = row?.transaction_id;
        const planCode = (row?.plan_code || "").toLowerCase();
        const isFree =
          planCode === "freemium" ||
          (row?.amount != null &&
            Number(row.amount) === 0 &&
            !planCode);
        if (!transactionId || isFree) {
          return params.value || "";
        }
        const href = `${import.meta.env.VITE_API_BASE_URL}/api/payment-history/${encodeURIComponent(
          transactionId
        )}/invoice-pdf`;
        const label = params.value || "Download";
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {label}
          </a>
        );
      },
    },
    {
      headerName: TransactionHistoryConstants.columns.transaction,
      field: "transaction_id",
      minWidth: 120,
      maxWidth: 180,
    },
    {
      headerName: TransactionHistoryConstants.columns.membership,
      field: "membership",
      minWidth: 100,
      maxWidth: 150,
    },
    {
      headerName: TransactionHistoryConstants.columns.gateway,
      field: "payment_gateway",
      minWidth: 100,
      maxWidth: 120,
    },
    {
      headerName: TransactionHistoryConstants.columns.type,
      field: "payment_type",
      minWidth: 80,
      maxWidth: 120,
    },
    {
      headerName: TransactionHistoryConstants.columns.status,
      field: "transaction_status",
      cellRenderer: StatusBadge,
      minWidth: 100,
      maxWidth: 120,
    },
    {
      headerName: TransactionHistoryConstants.columns.amount,
      field: "amount",
      valueFormatter: (p) =>
        TransactionHistoryCurrency(
          p.value as any,
          TransactionHistoryConstants.currency
        ),
      minWidth: 100,
      maxWidth: 120,
    },
  ];

  return {
    BrandColors,
    navItems,
    TransactionHistoryConstants,
    TransactionHistoryColDefs,
    TransactionHistoryCurrency,
  };
};

export default useConstants;
