import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getCoupons() {
  const { data } = await axiosInstance.get(endpoints.coupons.base);
  return data;
}

export async function createCoupon(payload: any) {
  return axiosInstance.post(endpoints.coupons.base, payload);
}

export async function updateCoupon(id: number | string, payload: any) {
  return axiosInstance.put(`${endpoints.coupons.base}/${id}`, payload);
}

export async function deleteCoupon(id: number | string) {
  return axiosInstance.delete(`${endpoints.coupons.base}/${id}`);
}

