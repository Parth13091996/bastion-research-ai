import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export type Settings = {
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
};

export type PublicSettings = {
  site_name?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  agreement_file_url?: string;
};

let publicSettingsCache: PublicSettings | null = null;
let adminSettingsCache: Settings | null = null;

// Get public settings (cached, with force option)
export async function getPublicSettings(
  force = false
): Promise<PublicSettings> {
  if (!force && publicSettingsCache) return publicSettingsCache;
  try {
    const { data } = await axiosInstance.get(endpoints.settings.public.get);
    publicSettingsCache = data || {};
  } catch {
    publicSettingsCache = {};
  }
  return publicSettingsCache!;
}

// Get admin settings (cached, with force option)
export async function getAdminSettings(force = false): Promise<Settings> {
  if (!force && adminSettingsCache) return adminSettingsCache;
  try {
    const { data } = await axiosInstance.get(endpoints.settings.admin.get);
    adminSettingsCache = data || {};
  } catch {
    adminSettingsCache = {};
  }
  return adminSettingsCache!;
}

// Update admin settings
export async function updateAdminSettings(
  updates: Partial<Settings>
): Promise<Settings> {
  try {
    const { data } = await axiosInstance.put(
      endpoints.settings.admin.update,
      updates
    );
    // Update local cache
    adminSettingsCache = data || {};
    return adminSettingsCache;
  } catch (error: any) {
    throw error;
  }
}
