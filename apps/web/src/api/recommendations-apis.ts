import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

/**
 * Fetch all recommendations from the API (DB-backed).
 */
export const getAllRecommendations = async (): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.recommendations.base);
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
