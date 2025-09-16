export const atomKeys = {
  loader: "loader",
  project: "project.info",
  modal: {
    projectInfo: "modal.projectInfo",
  },
  query: {
    authSession: "query.authSession",
    subscription: "query.subscription",
    users: "query.users",
    membershipPlans: "query.membershipPlans",
    jobs: "query.jobs",
    applications: "query.applications",
    coupons: "query.coupons",
    paymentHistory: "query.paymentHistory",
    myPaymentHistory: "query.myPaymentHistory",
    publicJobs: "query.publicJobs",
    cashfreePlans: "query.cashfreePlans",
    subscriptions: "query.subscriptions",
    session: "query.session",
    user: "query.user",
  },
} as const;

type NestedValues<T> = T extends object ? NestedValues<T[keyof T]> : T;
export type AtomKey = NestedValues<typeof atomKeys>;
