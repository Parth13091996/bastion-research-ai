import axiosInstance from "@/api/axios";
import { getPublicSettings } from "./settings";
import { endpoints } from "@/api/endpoints";

export const getAdminRecommendationsSheetUrl = async () => {
  const s = await getPublicSettings();
  return (
    s.recommendation_sheet_url ||
    // Default must match that in endpoints if present; keeping as fallback here for now
    "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0"
  );
};

export const getLiveRecommendationsSheetUrl = async () => {
  const s = await getPublicSettings();
  return (
    s.live_recommendation_sheet_url ||
    "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=1899227714#gid=1899227714"
  );
};

/**
 * Fetch all recommendations from the API.
 * @returns {Promise<any[]>} Promise resolving to array of recommendations.
 */
export const getAllRecommendations = async (): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.recommendations.base);
  return response.data || [];
};

/**
 * Fetch a recommendation by its ID from the API.
 * @param {string} id - The recommendation ID.
 * @returns {Promise<any>} Promise resolving to the recommendation object.
 */
export const getRecommendationById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(endpoints.recommendations.byId(id));
  return response.data;
};
