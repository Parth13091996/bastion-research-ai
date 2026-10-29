import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendAiSensyCampaign } from '../services/aisensy.service'
import { sendSubscriptionRenewalReminderEmail } from '../services/emailNotification.service'
import { supabase } from '../supabase'

import { reminderDayDifference } from '../utils/reminder-date'

const inFlightReminders = new Set<string>()

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

const isSubscriptionReminderType = (
  value: string
): value is SubscriptionReminderType => value in reminderConfigByType

export const sendReminderForUser = async (
  user: ReminderUserRow,
  reminderType: SubscriptionReminderType,
  campaignName: string
) => {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Subscription reminder delivery is disabled outside production; no developer-number redirects are allowed.')
  }
  const phone = String(user.phone || '').trim()
  const subscriptionEndDate = String(user.subscription_end_date || '').trim().slice(0, 10)
  if (!phone || reminderDayDifference(subscriptionEndDate) === null) {
    throw new Error('A valid phone and subscription_end_date are required')
  }
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || 'User'
  const config = reminderConfigByType[reminderType]
  if (!config || campaignName !== config.campaignName) throw new Error('Invalid reminder campaign')
  const deliveryKey = `${user.id}:${reminderType}:${subscriptionEndDate}`
  if (inFlightReminders.has(deliveryKey)) throw new Error('Reminder already in progress')
  inFlightReminders.add(deliveryKey)
  try {
    const { data: previous, error: lookupError } = await supabase
      .from('subscription_reminder_logs')
      .select('id, whatsapp_sent, email_sent, whatsapp_result')
      .eq('user_id', user.id).eq('reminder_type', reminderType)
      .eq('subscription_end_date', subscriptionEndDate).maybeSingle()
    if (lookupError) throw new Error('Cannot verify reminder history; delivery stopped to prevent duplicates')

    let whatsappResult: any = previous?.whatsapp_sent
      ? previous.whatsapp_result || { sent: true, skipped: true, reason: 'already_accepted' }
      : { sent: false }
    let emailSent = !!previous?.email_sent
    let emailError: string | undefined
    let logId = previous?.id
    const persist = async () => {
      const record = {
        user_id: user.id, email: user.email || null, phone,
        reminder_type: reminderType, campaign_name: campaignName,
        subscription_end_date: subscriptionEndDate,
        whatsapp_sent: !!whatsappResult.sent, email_sent: emailSent,
        whatsapp_result: whatsappResult,
        email_result: emailSent ? { sent: true } : emailError ? { sent: false, error: emailError } : null,
      }
      if (logId) {
        const { error } = await supabase.from('subscription_reminder_logs').update(record).eq('id', logId)
        if (error) throw new Error('Failed to persist reminder delivery state')
      } else {
        const { data, error } = await supabase.from('subscription_reminder_logs').insert(record).select('id').single()
        if (error || !data) throw new Error('Failed to persist reminder delivery state')
        logId = data.id
      }
    }
    if (!previous?.whatsapp_sent) {
      whatsappResult = await sendAiSensyCampaign({
        destination: phone, userName: name, campaignName,
        source: 'subscription-expiry-reminder',
        templateParams: config.paramCount > 0 ? [name, subscriptionEndDate, config.reminderLabel] : [],
        tags: ['subscription-expiry-reminder', reminderType], media: config.media,
        attributes: { user_id: String(user.id), email: String(user.email || ''), reminder_type: reminderType, subscription_end_date: subscriptionEndDate },
      })
      // Record WhatsApp acceptance before email, so an SMTP failure cannot cause a resend.
      await persist()
    }
    if (user.email && !emailSent) {
      try {
        await sendSubscriptionRenewalReminderEmail({ to: user.email, firstName: user.first_name || undefined,
          planName: user.membership_plans?.plan_name || undefined, subscriptionEndDate, reminderType })
        emailSent = true
      } catch (error: any) {
        emailError = error?.message || 'Email reminder failed'
      }
      await persist()
    }
    return { whatsapp: whatsappResult, emailSent, emailError }
  } finally {
    inFlightReminders.delete(deliveryKey)
  }
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

    const currentDayDiff = reminderDayDifference(subscriptionEndDate)
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
