import axiosInstance from '@/api/axios'
import { endpoints } from '@/api/endpoints'

export type SubscriptionWhatsappReminderType =
  | 'one_week_before'
  | 'expiry_day'
  | 'one_week_after'
  | 'fifteen_days_after'

export type SubscriptionWhatsappCampaignName =
  | 'Bastion CORE Renewal Reminder #1'
  | 'Bastion CORE Renewal Reminder #2'
  | 'Bastion CORE Renewal Reminder #3'
  | 'Bastion CORE Renewal Reminder #4'

export async function sendSubscriptionWhatsappReminder(
  reminderType: SubscriptionWhatsappReminderType,
  campaignName: SubscriptionWhatsappCampaignName
) {
  const { data } = await axiosInstance.post(
    endpoints.subscriptionWhatsapp.reminder,
    { reminderType, campaignName }
  )
  return data
}
