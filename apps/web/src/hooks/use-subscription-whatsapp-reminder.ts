import { useEffect } from 'react'
import { User } from '@repo/types'
import {
  sendSubscriptionWhatsappReminder,
  SubscriptionWhatsappCampaignName,
  SubscriptionWhatsappReminderType,
} from '@/api/subscription-whatsapp-api'

const DAY_MS = 24 * 60 * 60 * 1000

import { Config } from '@/utils/config'

const reminderByDayDiff: Record<
  number,
  {
    reminderType: SubscriptionWhatsappReminderType
    campaignName: SubscriptionWhatsappCampaignName
  }
> = {
  7: {
    reminderType: 'one_week_before',
    campaignName: Config.campaignNames.subscription_one_week_before as Extract<SubscriptionWhatsappCampaignName, "Bastion CORE Renewal Reminder #1">,
  },
  0: {
    reminderType: 'expiry_day',
    campaignName: Config.campaignNames.subscription_expiry_day as Extract<SubscriptionWhatsappCampaignName, "Bastion CORE Renewal Reminder #2">,
  },
  [-7]: {
    reminderType: 'one_week_after',
    campaignName: Config.campaignNames.subscription_one_week_after as Extract<SubscriptionWhatsappCampaignName, "Bastion CORE Renewal Reminder #3">,
  },
  [-15]: {
    reminderType: 'fifteen_days_after',
    campaignName: Config.campaignNames.subscription_fifteen_days_after as Extract<SubscriptionWhatsappCampaignName, "Bastion CORE Renewal Reminder #4">,
  },
}

const getDateOnly = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate())

const getSubscriptionReminderConfig = (subscriptionEndDate?: string | null) => {
  if (!subscriptionEndDate) return null

  const end = new Date(subscriptionEndDate)
  if (Number.isNaN(end.getTime())) return null

  const today = getDateOnly(new Date())
  const expiry = getDateOnly(end)
  const dayDiff = Math.round((expiry.getTime() - today.getTime()) / DAY_MS)

  return reminderByDayDiff[dayDiff] ?? null
}

export function useSubscriptionWhatsappReminder(user?: User | null) {
  useEffect(() => {
    const reminderConfig = getSubscriptionReminderConfig(
      user?.subscription_end_date
    )

    if (
      !user?.id ||
      !user.phone ||
      !user.subscription_end_date ||
      !reminderConfig
    ) {
      return
    }

    const { reminderType, campaignName } = reminderConfig
    const sentKey = `subscription-whatsapp:${user.id}:${user.subscription_end_date}:${reminderType}`
    if (localStorage.getItem(sentKey)) {
      return
    }

    sendSubscriptionWhatsappReminder(reminderType, campaignName)
      .then(() => {
        localStorage.setItem(sentKey, new Date().toISOString())
      })
      .catch((error) => {
        console.error(
          'Subscription WhatsApp reminder failed:',
          error?.message || error
        )
      })
  }, [user?.id, user?.phone, user?.subscription_end_date])
}
