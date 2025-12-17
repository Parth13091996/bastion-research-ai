import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export const getAllTacticalIdeas = async (): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.tacticalIdeas.base);
  return response.data || [];
};

export const getSheetTacticalIdeas = async (): Promise<any[]> => {
  const response = await axiosInstance.get(endpoints.tacticalIdeas.sheet);
  return response.data || [];
};

export const getTacticalIdeaByCompanySymbol = async (
  symbol: string
): Promise<any> => {
  const response = await axiosInstance.get(
    endpoints.tacticalIdeas.bySymbol(symbol)
  );
  return response.data;
};

