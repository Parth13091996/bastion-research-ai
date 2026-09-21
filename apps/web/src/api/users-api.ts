import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getUsers() {
  const { data } = await axiosInstance.get(endpoints.users.base);
  return data;
}

export async function createUser(payload: any) {
  const { data } = await axiosInstance.post(endpoints.users.base, payload);
  return data;
}

export async function updateUserById(id: string | number, payload: any) {
  const { data } = await axiosInstance.put(endpoints.users.byId(id), payload);
  return data;
}

export async function deleteUserById(id: string | number) {
  return axiosInstance.delete(endpoints.users.byId(id));
}

export async function getUserById(id: string | number) {
  const { data } = await axiosInstance.get(endpoints.users.byId(id));
  return data;
}

