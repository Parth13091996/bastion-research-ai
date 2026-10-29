import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export type ReminderStage = 'one_week_before' | 'expiry_day' | 'one_week_after' | 'fifteen_days_after';
export type ReminderCampaign = {
  enabled: boolean; campaignName: string; templateParams: string[]; mediaUrl: string; mediaFilename: string;
};
export type ReminderCampaigns = Record<ReminderStage, ReminderCampaign>;

export type Settings = {
  aisensy_subscription_reminders?: ReminderCampaigns;
  site_name?: string;
  contact_recipient_email?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  recommendation_sheet_url?: string;
  live_recommendation_sheet_url?: string;
  agreement_file_url?: string;
  invoice_file_url?: string;
  aisensy_webinar_name?: string;
  aisensy_webinar_date?: string;
  aisensy_webinar_time?: string;
  aisensy_joining_link?: string;
  aisensy_campaign_name?: string;
  mailchimp_webinar_date?: string;
  mailchimp_webinar_time?: string;
};

export type PublicSettings = {
  site_name?: string;
  maintenance_mode?: boolean;
  allow_user_registrations?: boolean;
  agreement_file_url?: string;
  invoice_file_url?: string;
  /** yyyy-MM-dd / HH:mm from Admin → Webinar — AiSensy */
  aisensy_webinar_date?: string;
  aisensy_webinar_time?: string;
  /** yyyy-MM-dd / HH:mm from Admin → Webinar — Mailchimp */
  mailchimp_webinar_date?: string;
  mailchimp_webinar_time?: string;
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
  const { data } = await axiosInstance.get(endpoints.settings.admin.get);
  adminSettingsCache = data || {};
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
    publicSettingsCache = null;
    return adminSettingsCache;
  } catch (error: any) {
    throw error;
  }
}
