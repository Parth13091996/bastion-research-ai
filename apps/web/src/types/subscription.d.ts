interface SubscriptionData {
  is_premium: boolean;
  currentPlan: string;
  subscription: {
    name: string;
    startDate: string;
    expireDate: string | null;
    amount: number;
    transactionId: string;
    plan_code?: string | null;
    tier?: number | null;
  } | null;
  lastPayment: {
    amount: number;
    status: string;
    planId: number;
    email: string;
    date: string;
    plan_code?: string | null;
  } | null;
}

interface AuthContextType {
  user: any;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<User>;
  refetchUserAfterAgreement: () => Promise<User>;
  refetchSubscription: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  subscription: SubscriptionData | null;
  isSubscriptionLoading: boolean;
}
