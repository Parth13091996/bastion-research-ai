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
} as const;

export type Endpoints = typeof endpoints;
