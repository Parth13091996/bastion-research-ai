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

const getDayDiffFromToday = (dateValue: string) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null

  const targetUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const now = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return Math.round((targetUtc - todayUtc) / DAY_MS)
}

const isSubscriptionReminderType = (
  value: string
): value is SubscriptionReminderType => value in reminderConfigByType

export const sendReminderForUser = async (
  user: ReminderUserRow,
  reminderType: SubscriptionReminderType,
  campaignName: string
) => {
  let phone = String(user?.phone || '').trim()
  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.username ||
    'User'
  let subscriptionEndDate = String(user?.subscription_end_date || '').trim()

  if (process.env.NODE_ENV !== 'production') {
    if (!phone) {
      phone = '9327832747'
    }
    if (!subscriptionEndDate) {
      subscriptionEndDate = new Date().toISOString().split('T')[0]
    }
  }

  if (!phone || !subscriptionEndDate) {
    throw new Error('User phone and subscription_end_date are required')
  }

  let targetPhone = phone
  let targetEmail = user.email

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[subscription-reminder-redirect] Dev mode: overriding real phone (${phone}) with '9327832747' and real email (${user.email || 'N/A'}) with 'mv9898733607@gmail.com'`)
    targetPhone = '9327832747'
    if (user.email) {
      targetEmail = 'mv9898733607@gmail.com'
    }
  }

  const reminderConfig = reminderConfigByType[reminderType]
  const templateParams = reminderConfig.paramCount > 0
    ? [name, subscriptionEndDate, reminderConfig.reminderLabel]
    : []

  const whatsappResult = await sendAiSensyCampaign({
    destination: targetPhone,
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
  if (targetEmail) {
    await sendSubscriptionRenewalReminderEmail({
      to: targetEmail,
      firstName: user.first_name || undefined,
      planName: user.membership_plans?.plan_name || undefined,
      subscriptionEndDate,
      reminderType,
    })
    emailSent = true
  }

  // Save log entry to Supabase
  try {
    const { error } = await supabase
      .from('subscription_reminder_logs')
      .insert({
        user_id: user.id,
        email: user.email || null,
        phone: phone || null,
        reminder_type: reminderType,
        campaign_name: campaignName,
        subscription_end_date: subscriptionEndDate,
        whatsapp_sent: !!whatsappResult?.sent,
        email_sent: emailSent,
        whatsapp_result: whatsappResult || null,
        email_result: emailSent ? { sent: true } : null,
      })

    if (error) {
      console.error(`[subscription-reminder] Failed to write to subscription_reminder_logs for user: ${user.id}:`, error)
    }
  } catch (err: any) {
    console.error(`[subscription-reminder] Error inserting into subscription_reminder_logs:`, err?.message || err)
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
