import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  message: string;
}) {
  return axiosInstance.post(endpoints.contact.send, payload);
}

