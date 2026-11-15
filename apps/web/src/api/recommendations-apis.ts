import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

/**
 * Fetch all recommendations from the API (DB-backed).
 */
export const getAllRecommendations = async (manage = false): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.recommendations.base, { params: manage ? { manage: true } : undefined });
  return response.data || [];
};

/**
 * Fetch raw recommendations data from the configured Google Sheet via backend.
 * The server reads the sheet URL from settings and never exposes it to the client.
 */
export const getSheetRecommendations = async (): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.recommendations.sheet);
  return response.data || [];
};

/**
 * Fetch live recommendations summary (dashboard metrics sheet) via backend.
 */
export const getLiveRecommendationsDashboardData = async (): Promise<any[]> => {
  const response = await axiosInstance.get(
    endpoints.recommendations.liveDashboard
  );
  return response.data || [];
};

export const getRecommendationByCompanySymbol = async (
  symbol: string
): Promise<any> => {
  const response = await axiosInstance.get(
    endpoints.recommendations.bySymbol(symbol)
  );
  return response.data;
};

export const userCompanyAnalytics = async (
  symbol: string,
  userId: string
): Promise<any> => {
  const response = await axiosInstance.get(
    endpoints.recommendations.bySymbolAnalytics(symbol, userId)
  );
  return response.data;
};

export type PortfolioDashboardMetrics = {
  totalRecommendations: number | null;
  activeBuy: number | null;
  activeHold: number | null;
  exitedClosed: number | null;
  recommendedStocksXirr: number | null;
  nifty500Xirr: number | null;
  performanceEndDate: string | null;
};

export async function getPortfolioDashboardData(): Promise<PortfolioDashboardMetrics> {
  const { data } = await axiosInstance.get('/api/recommendations/portfolio-dashboard');
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid dashboard data');
  return data;
}

export async function getPortfolioMethodology(): Promise<{ rows: string[][] }> {
  const { data } = await axiosInstance.get('/api/recommendations/xirr-methodology');
  if (!data || !Array.isArray(data.rows) || !data.rows.length ||
    !data.rows.every((row: unknown) => Array.isArray(row) && row.every(cell => typeof cell === 'string'))) {
    throw new Error('Invalid methodology data');
  }
  return data;
}
