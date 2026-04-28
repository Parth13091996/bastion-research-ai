export const endpoints = {
  auth: {
    session: '/api/auth/session',
    signin: '/api/auth/signin',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    onboardingDropOffStart: '/api/auth/onboarding-dropoff/start',
    onboard: '/api/auth/onboard',
    zeroAmountPayment: '/api/auth/zero-amount-payment',
  },
  users: {
    base: '/api/users',
    byId: (id: string | number) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
  },
  jobs: {
    base: '/api/jobs',
    byId: (id: string | number) => `/api/jobs/${id}`,
  },
  applications: {
    base: '/api/applications',
    byId: (id: string | number) => `/api/applications/${id}`,
  },
  leads: {
    base: '/api/leads',
    byId: (id: string | number) => `/api/leads/${id}`,
  },
  webinarRegistrations: {
    base: '/api/webinar-registrations',
    admin: {
      base: '/api/admin/webinar-registrations',
      byId: (id: string | number) => `/api/admin/webinar-registrations/${id}`,
    },
  },
  membershipPlans: {
    base: '/api/membership-plans',
    byId: (id: string | number) => `/api/membership-plans/${id}`,
  },
  paymentHistory: {
    base: '/api/payment-history',
    me: '/api/payment-history/me',
    byId: (id: string | number) => `/api/payment-history/${id}`,
  },
  coupons: {
    base: '/api/coupons',
  },
  otp: {
    send: '/api/otp/send',
    sendEmail: '/api/otp/send-email',
    verify: '/api/otp/verify',
  },
  cashfree: {
    plans: '/api/cashfree/plans',
    orders: '/api/cashfree/orders',
    orderById: (id: string | number) => `/api/cashfree/orders/${id}`,
  },
  cashfreeVerification: {
    verifyPan: '/api/cashfree/verification/pan',
    panStatus: (referenceId: string | number) =>
      `/api/cashfree/verification/pan/${referenceId}`,
  },
  files: {
    upload: '/api/files/upload',
  },
  digio: {
    esignUpload: '/api/digio/esign/upload',
    esignUploadJson: '/api/digio/esign/uploadjson',
    documentById: (id: string) => `/api/digio/esign/${id}`,
    downloadById: (id: string) => `/api/digio/esign/${id}/download`,
    cancelById: (id: string) => `/api/digio/esign/${id}/cancel`,
  },
  contact: {
    send: '/api/contact',
  },
  settings: {
    contactEmail: {
      get: '/api/admin/settings/contact-email',
      update: '/api/admin/settings/contact-email',
    },
    admin: {
      get: '/api/admin/settings',
      update: '/api/admin/settings',
    },
    public: {
      get: '/api/settings',
    },
  },
  content: {
    research: {
      base: '/content/research',
      byId: (id: string) => `/content/research/${id}`,
      admin: {
        base: '/api/admin/content/research',
        byId: (id: string) => `/api/admin/content/research/${id}`,
      },
    },
    newsletters: {
      base: '/content/newsletters',
      byId: (id: string) => `/content/newsletters/${id}`,
      admin: {
        base: '/api/admin/content/newsletters',
        byId: (id: string) => `/api/admin/content/newsletters/${id}`,
      },
    },
    mailchimp: {
      subscribe: '/api/mailchimp/newsletters/subscribe',
      newsletters: {
        base: '/api/mailchimp/newsletters',
        byId: (id: string) => `/api/mailchimp/newsletters/${id}`,
        admin: {
          base: '/api/admin/mailchimp/newsletters',
          byId: (id: string) => `/api/admin/mailchimp/newsletters/${id}`,
          setHidden: (id: string) =>
            `/api/admin/mailchimp/newsletters/${id}/hide`,
        },
      },
    },
    webinars: {
      base: '/content/webinars',
      byId: (id: string) => `/content/webinars/${id}`,
      admin: {
        base: '/api/admin/content/webinars',
        byId: (id: string) => `/api/admin/content/webinars/${id}`,
      },
    },
    scratchPad: {
      base: '/api/scratch-pad-newsletters',
      byId: (id: string) => `/api/scratch-pad-newsletters/${id}`,
      bySlug: (slug: string) => `/api/scratch-pad-newsletters/slug/${slug}`,
      admin: {
        base: '/api/admin/scratch-pad-newsletters',
        byId: (id: string) => `/api/admin/scratch-pad-newsletters/${id}`,
      },
    },
    podcasts: {
      base: '/content/podcasts',
      byId: (id: string) => `/content/podcasts/${id}`,
      admin: {
        base: '/api/admin/content/podcasts',
        byId: (id: string) => `/api/admin/content/podcasts/${id}`,
      },
    },
    testimonials: {
      base: '/content/testimonials',
      byId: (id: string) => `/content/testimonials/${id}`,
      admin: {
        base: '/api/admin/content/testimonials',
        byId: (id: string) => `/api/admin/content/testimonials/${id}`,
      },
    },
  },
  recommendations: {
    base: '/api/recommendations/',
    sheet: '/api/recommendations/sheet',
    liveDashboard: '/api/recommendations/live-dashboard',
    bySymbol: (symbol: string) => `/api/recommendations/company/${symbol}`,
    bySymbolAnalytics: (symbol: string, userId: string) =>
      `/api/recommendations/company/analytics/${symbol}?id=${userId}`,
  },
  redFlags: {
    companies: '/api/red-flags/companies',
    submissions: '/api/red-flags/submissions',
    companyStats: (companyId: string) =>
      `/api/red-flags/companies/${companyId}/stats`,
    admin: {
      companies: '/api/admin/red-flags/companies',
      stats: '/api/admin/red-flags/stats',
      // New endpoint for deleting red-flag companies
      deleteCompany: (id: string) => `/api/admin/red-flags/companies/${id}`,
      clearStats: (id: string) => `/api/admin/red-flags/stats/${id}`,
    },
  },
  staff: {
    sectionEditAccess: "/api/staff/section-edit-access",
  },
  admin: {
    staff: {
      sectionEditAccess: "/api/admin/staff/section-edit-access",
    },
  },
} as const

export type Endpoints = typeof endpoints
