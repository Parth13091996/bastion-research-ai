import axiosInstance from "./axios";

// Types
export interface Newsletter {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  created_at: string;
}

export interface Webinar {
  id: string;
  title: string;
  video_url?: string;
  created_at: string;
}

export interface Podcast {
  id: string;
  title: string;
  html_content?: string;
  video_url?: string;
  created_at: string;
}

// Centralized API endpoint paths used across the app
// Grouped by domain for clarity; values remain the same to avoid breaking behavior
export const endpoints = {
  auth: {
    session: "/api/auth/session",
    signin: "/api/auth/signin",
    logout: "/api/auth/logout",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    onboard: "/api/auth/onboard",
  },
  users: {
    base: "/api/users",
    byId: (id: string | number) => `/api/users/${id}`,
  },
  jobs: {
    base: "/api/jobs",
    byId: (id: string | number) => `/api/jobs/${id}`,
  },
  applications: {
    base: "/api/applications",
    byId: (id: string | number) => `/api/applications/${id}`,
  },
  membershipPlans: {
    base: "/api/membership-plans",
    byId: (id: string | number) => `/api/membership-plans/${id}`,
  },
  subscriptions: {
    base: "/api/subscriptions",
    byId: (id: string | number) => `/api/subscriptions/${id}`,
  },
  paymentHistory: {
    base: "/api/payment-history",
    me: "/api/payment-history/me",
    byId: (id: string | number) => `/api/payment-history/${id}`,
  },
  coupons: {
    base: "/api/coupons",
  },
  otp: {
    send: "/api/otp/send",
    verify: "/api/otp/verify",
  },
  cashfree: {
    plans: "/api/cashfree/plans",
    orders: "/api/cashfree/orders",
    orderById: (id: string | number) => `/api/cashfree/orders/${id}`,
    subscription: "/api/cashfree/subscription",
  },
  digio: {
    uploadJson: "/api/digio/esign/uploadjson",
  },
  contact: {
    send: "/api/contact",
  },
  settings: {
    contactEmail: {
      get: "/api/admin/settings/contact-email",
      update: "/api/admin/settings/contact-email",
    },
  },
  content: {
    newsletters: {
      base: "/content/newsletters",
      byId: (id: string) => `/content/newsletters/${id}`,
      admin: {
        base: "/api/admin/content/newsletters",
        byId: (id: string) => `/api/admin/content/newsletters/${id}`,
      },
    },
    webinars: {
      base: "/content/webinars",
      byId: (id: string) => `/content/webinars/${id}`,
      admin: {
        base: "/api/admin/content/webinars",
        byId: (id: string) => `/api/admin/content/webinars/${id}`,
      },
    },
    podcasts: {
      base: "/content/podcasts",
      byId: (id: string) => `/content/podcasts/${id}`,
      admin: {
        base: "/api/admin/content/podcasts",
        byId: (id: string) => `/api/admin/content/podcasts/${id}`,
      },
    },
  },
} as const;

export type Endpoints = typeof endpoints;
