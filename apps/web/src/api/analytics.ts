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
