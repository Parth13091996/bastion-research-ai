import axios from "./axios";

export interface AnalyticsSummary {
  rangeDays: number;
  visitsByDay: {
    date: string;
    totalViews: number;
    uniqueIPs: number;
    uniqueUsers: number;
  }[];
  usersByDay: { date: string; uniqueUsers: number }[];
  topPaths: {
    path: string;
    views: number;
    uniqueIPs: number;
    uniqueUsers: number;
  }[];
  activeNow: { ips: number; users: number };
  totals: { uniqueIPs: number; uniqueUsers: number };
  subscribers?: {
    totalActive: number;
    totalPaidActive: number;
    newPaid: { last7: number; last30: number; last90: number };
    renewalPct: number; // percentage 0-100
    nonRenewalPct: number; // percentage 0-100
    churnRateMonthly: number; // percentage 0-100
    nearingRenewal: {
      userId: string;
      membershipId: number | string | null;
      planCode: string | null;
      expiresAt: string;
    }[];
  };
  revenue?: {
    month: number;
    quarter: number;
    YTD: number;
    byProduct: { product: string; revenue: number }[];
  };
  generatedAt?: string;
}

export async function fetchAnalyticsSummary(days = 7) {
  const { data } = await axios.get<AnalyticsSummary>(
    `/api/admin/analytics/summary`,
    {
      params: { days },
    }
  );
  return data;
}
