type ApiPlan = {
  code: string; // plan_id as string
  name: string;
  amount: number;
  currency: string;
  plan_code?: "core" | "core_annual" | "research_hub" | string;
  tier?: number;
};

type UpgradeFormState = {
  panCard: string;
  agreeToTerms: boolean;
  agreementSignatureUrl?: string;
  agreementSignaturePath?: string;
  agreementSignedAt?: string;
};

interface SubscriptionData {
  is_premium: boolean;
  currentPlan: string | null;
  subscription: {
    name: string;
    startDate: string;
    expireNextRenewal: string | null;
    amount: number;
    transactionId: string;
    plan_code?: string | null;
    tier?: number | null;
  } | null;
  lastPayment: {
    amount: number | null;
    status: string;
    email: string | null;
    date: string;
    plan_code?: string | null;
  } | null;
}

interface AuthContextType {
  user: User;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<User>;
  refetchUserAfterAgreement: () => Promise<User>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isStaff: boolean;
  isLoading: boolean;
}
