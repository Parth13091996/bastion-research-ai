import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getApplications() {
  const response = await axiosInstance.get(endpoints.applications.base);
  return response.data;
}

export async function createApplication(payload: any) {
  return axiosInstance.post(endpoints.applications.base, payload);
}

export async function updateApplication(id: number | string, body: any) {
  return axiosInstance.put(endpoints.applications.byId(id), body);
}

export async function deleteApplication(id: number | string) {
  return axiosInstance.delete(endpoints.applications.byId(id));
}

