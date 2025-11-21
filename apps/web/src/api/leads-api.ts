import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getLeads() {
  const { data } = await axiosInstance.get(endpoints.leads.base);
  return data;
}

export async function updateLead(id: number, body: any) {
  return axiosInstance.put(endpoints.leads.byId(id), body);
}

export async function deleteLead(id: number) {
  return axiosInstance.delete(endpoints.leads.byId(id));
}

