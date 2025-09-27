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
  cashfreeVerification: {
    verifyPan: "/api/cashfree/verification/pan",
    panStatus: (referenceId: string | number) =>
      `/api/cashfree/verification/pan/${referenceId}`,
  },
  files: {
    upload: "/api/files/upload",
    signatures: "/api/files/signatures",
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
    research: {
      base: "/content/research",
      byId: (id: string) => `/content/research/${id}`,
      admin: {
        base: "/api/admin/content/research",
        byId: (id: string) => `/api/admin/content/research/${id}`,
      },
    },
    newsletters: {
      base: "/content/newsletters",
      byId: (id: string) => `/content/newsletters/${id}`,
      admin: {
        base: "/api/admin/content/newsletters",
        byId: (id: string) => `/api/admin/content/newsletters/${id}`,
      },
    },
    mailchimp: {
      newsletters: {
        base: "/content/mailchimp/newsletters",
        byId: (id: string) => `/content/mailchimp/newsletters/${id}`,
        admin: {
          base: "/api/admin/content/mailchimp/newsletters",
          byId: (id: string) => `/api/admin/content/mailchimp/newsletters/${id}`,
        },
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
