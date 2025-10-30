// apps/web/src/lib/settings.ts
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export type PublicSettings = {
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
  site_name?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
};

let cache: PublicSettings | null = null;

export async function getPublicSettings(
  force = false
): Promise<PublicSettings> {
  if (!force && cache) return cache;
  try {
    const { data } = await axiosInstance.get(endpoints.settings.public.get);
    cache = data || {};
  } catch {
    cache = {};
  }
  return cache!;
}
