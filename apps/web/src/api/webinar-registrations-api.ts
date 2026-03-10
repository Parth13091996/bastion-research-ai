import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export interface WebinarRegistrationPayload {
  name: string;
  email: string;
  phone?: string;
  webinar_slug?: string;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  notes?: string;
}

export async function createWebinarRegistration(
  payload: WebinarRegistrationPayload
) {
  const { data } = await axiosInstance.post(
    endpoints.webinarRegistrations.base,
    payload
  );
  return data;
}

export async function getWebinarRegistrations() {
  const { data } = await axiosInstance.get(
    endpoints.webinarRegistrations.admin.base
  );
  return data;
}

