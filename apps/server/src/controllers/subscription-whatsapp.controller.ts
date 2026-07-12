import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendAiSensyCampaign } from '../services/aisensy.service'
import { sendSubscriptionRenewalReminderEmail } from '../services/emailNotification.service'
import { supabase } from '../supabase'

const DAY_MS = 24 * 60 * 60 * 1000

export type SubscriptionReminderType =
  | 'one_week_before'
  | 'expiry_day'
  | 'one_week_after'
  | 'fifteen_days_after'

export const reminderConfigByType: Record<
  SubscriptionReminderType,
  { 
    reminderLabel: string; 
    campaignName: string; 
    dayDiff: number; 
    paramCount: number;
    media?: { url: string; filename: string };
  }
> = {
  one_week_before: {
    reminderLabel: '1 week before subscription expiry',
    campaignName: 'Bastion CORE Renewal Reminder #1',
    dayDiff: 7,
    paramCount: 0,
    media: {
      url: process.env.AISENSY_REMINDER_1_MEDIA_URL || 'https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg',
      filename: 'sample_media'
    }
  },
  expiry_day: {
    reminderLabel: 'subscription expiry day',
    campaignName: 'Bastion CORE Renewal Reminder #2',
    dayDiff: 0,
    paramCount: 0,
  },
  one_week_after: {
    reminderLabel: '1 week after subscription expiry',
    campaignName: 'Bastion CORE Renewal Reminder #3',
    dayDiff: -7,
    paramCount: 0,
    media: {
      url: process.env.AISENSY_REMINDER_3_MEDIA_URL || 'https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg',
      filename: 'sample_media'
    }
  },
  fifteen_days_after: {
    reminderLabel: '15 days after subscription expiry',
    campaignName: 'Bastion CORE Renewal Reminder #4',
    dayDiff: -15,
    paramCount: 0,
    media: process.env.AISENSY_REMINDER_4_MEDIA_URL ? {
      url: process.env.AISENSY_REMINDER_4_MEDIA_URL,
      filename: 'Bastion-Logo.png'
    } : undefined
  },
}

export type ReminderUserRow = {
  id: string
  email?: string | null
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  subscription_end_date?: string | null
  membership_plans?: {
    plan_name?: string | null
  } | null
}

const getDateOnly = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate())

const getDayDiffFromToday = (dateValue: string) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null

  const today = getDateOnly(new Date())
  const target = getDateOnly(date)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

const isSubscriptionReminderType = (
  value: string
): value is SubscriptionReminderType => value in reminderConfigByType

export const sendReminderForUser = async (
  user: ReminderUserRow,
  reminderType: SubscriptionReminderType,
  campaignName: string
) => {
  const phone = String(user?.phone || '').trim()
  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.username ||
    'User'
  const subscriptionEndDate = String(user?.subscription_end_date || '').trim()

  if (!phone || !subscriptionEndDate) {
    throw new Error('User phone and subscription_end_date are required')
  }

  const reminderConfig = reminderConfigByType[reminderType]
  const templateParams = reminderConfig.paramCount > 0
    ? [name, subscriptionEndDate, reminderConfig.reminderLabel]
    : []

  const whatsappResult = await sendAiSensyCampaign({
    destination: phone,
    userName: name,
    campaignName: campaignName,
    source: 'subscription-expiry-reminder',
    templateParams,
    tags: ['subscription-expiry-reminder', reminderType],
    media: reminderConfig.media,
    attributes: {
      user_id: String(user.id),
      email: String(user.email || ''),
      reminder_type: reminderType,
      subscription_end_date: subscriptionEndDate,
    },
  })

  let emailSent = false
  if (user.email) {
    await sendSubscriptionRenewalReminderEmail({
      to: user.email,
      firstName: user.first_name || undefined,
      planName: user.membership_plans?.plan_name || undefined,
      subscriptionEndDate,
      reminderType,
    })
    emailSent = true
  }

  return { whatsapp: whatsappResult, emailSent }
}

export const sendSubscriptionWhatsappReminder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const reminderType = String(req.body?.reminderType || '').trim()
    const requestCampaignName = String(req.body?.campaignName || '').trim()

    if (!isSubscriptionReminderType(reminderType)) {
      return res.status(400).json({ message: 'Invalid reminderType' })
    }

    const reminderConfig = reminderConfigByType[reminderType]

    if (requestCampaignName !== reminderConfig.campaignName) {
      return res.status(400).json({ message: 'Invalid campaignName for reminderType' })
    }

    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        username,
        first_name,
        last_name,
        phone,
        subscription_end_date,
        membership_plans (
          plan_name
        )
      `
      )
      .eq('id', req.user?.id)
      .maybeSingle()

    if (error || !data) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = data as ReminderUserRow
    const subscriptionEndDate = String(user?.subscription_end_date || '').trim()

    if (!user.phone || !subscriptionEndDate) {
      return res.status(400).json({
        message: 'User phone and subscription_end_date are required',
      })
    }

    const currentDayDiff = getDayDiffFromToday(subscriptionEndDate)
    if (currentDayDiff !== reminderConfig.dayDiff) {
      return res.status(200).json({
        sent: false,
        skipped: true,
        reason: 'subscription_date_no_longer_matches_reminder',
      })
    }

    const result = await sendReminderForUser(user, reminderType, requestCampaignName)
    return res.status(200).json(result)
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || 'Failed to send WhatsApp reminder' })
  }
}
