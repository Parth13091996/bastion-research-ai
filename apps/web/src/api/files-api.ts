import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function uploadFile(formData: FormData) {
  return axiosInstance.post(endpoints.files.upload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

