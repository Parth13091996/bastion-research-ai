import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getJobs() {
  const { data } = await axiosInstance.get(endpoints.jobs.base);
  return data;
}

export async function getJobById(id: string | number) {
  const { data } = await axiosInstance.get(endpoints.jobs.byId(id));
  return data;
}

export async function createJob(payload: any) {
  const { data } = await axiosInstance.post(endpoints.jobs.base, payload);
  return data;
}

export async function updateJob(id: string | number, payload: any) {
  const { data } = await axiosInstance.put(endpoints.jobs.byId(id), payload);
  return data;
}

export async function deleteJob(id: string | number) {
  return axiosInstance.delete(endpoints.jobs.byId(id));
}
