import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

import type { User } from "@repo/types";

export async function getSession() {
  const { data } = await axiosInstance.get(endpoints.auth.session);
  return data as { user?: User | null };
}

export async function logoutUser() {
  return axiosInstance.post(endpoints.auth.logout);
}

export async function signIn(payload: any) {
  const { data } = await axiosInstance.post(endpoints.auth.signin, payload);
  return data;
}

export async function sendForgotPassword(email: string) {
  return axiosInstance.post(endpoints.auth.forgotPassword, { email });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return axiosInstance.post(endpoints.auth.resetPassword, payload);
}

