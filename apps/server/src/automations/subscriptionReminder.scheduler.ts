import { supabase } from '../supabase'
import {
  sendMonthlySubscriptionExpirySummaryEmail,
  sendDropOffSummaryEmail,
} from '../services/emailNotification.service'
import {
  sendReminderForUser,
  reminderConfigByType,
  SubscriptionReminderType,
} from '../controllers/subscription-whatsapp.controller'
import { syncExpiredPremiumUserToMailchimp } from '../services/mailchimpAudience.service'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const MONTHLY_SUMMARY_RECIPIENT =
  process.env.MONTHLY_SUBSCRIPTION_EXPIRY_REPORT_EMAIL ||
  'subscription@bastionresearch.in'
const DROP_OFF_SUMMARY_RECIPIENT =
  process.env.DROP_OFF_REPORT_EMAIL || 'reach@bastionresearch.in'

type ExpiringUserRow = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  username?: string | null
  phone?: string | null
  subscription_end_date?: string | null
  membership_plans?: {
    plan_name?: string | null
    plan_code?: string | null
  } | null
}

export const runSubscriptionExpiryReminder = async () => {
  try {
    const today = new Date()

    for (const [key, config] of Object.entries(reminderConfigByType)) {
      const reminderType = key as SubscriptionReminderType
      const target = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + config.dayDiff
      ))
      const targetDateStr = target.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          username,
          phone,
          subscription_end_date,
          membership_plans (
            plan_name
          )
        `
        )
        .eq('subscription_end_date', targetDateStr)
        .eq('status', 'active')

      if (error) {
        console.error(`Failed to fetch expiring subscriptions for ${reminderType}`, error)
        continue
      }

      const rows = (data ?? []) as ExpiringUserRow[]
      if (rows.length === 0) {
        continue
      }

      console.log(`[subscription-reminder] Found ${rows.length} users for reminderType: ${reminderType} (date: ${targetDateStr})`)

      for (const user of rows) {
        try {
          // Check if log already exists for this cycle to prevent duplicates
          const { data: existingLog, error: logError } = await supabase
            .from('subscription_reminder_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('reminder_type', reminderType)
            .eq('subscription_end_date', targetDateStr)
            .maybeSingle()

          if (logError) {
            console.error(`[subscription-reminder] Failed to check logs for user ${user.id}:`, logError)
          }

          if (existingLog) {
            console.log(`[subscription-reminder] Skipping user ${user.id} - reminder (${reminderType}) already sent for expiry ${targetDateStr}`)
            continue
          }

          await sendReminderForUser(user as any, reminderType, config.campaignName)
          console.log(`[subscription-reminder] Sent reminder (${reminderType}) to user: ${user.id}`)
          // Wait 2 seconds between emails to prevent rate limiting (e.g. Mailtrap limits)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (err: any) {
          console.error(`[subscription-reminder] Failed to send reminder (${reminderType}) to user ${user.id}:`, err?.message || err)
        }
      }
    }
  } catch (error) {
    console.error('Subscription reminder job failed', error)
  }
}

const getUtcMonthWindow = (reference: Date) => {
  const year = reference.getUTCFullYear()
  const month = reference.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const next = new Date(Date.UTC(year, month + 1, 1))
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: next.toISOString().split('T')[0],
    label: start.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  }
}

const getMonthKey = (reference: Date) =>
  `${reference.getUTCFullYear()}-${reference.getUTCMonth()}`

let lastMonthlySummaryMonthKey: string | null = null

export const runMonthlySubscriptionExpirySummary = async (
  referenceDate: Date = new Date()
) => {
  if (!MONTHLY_SUMMARY_RECIPIENT) {
    return
  }

  const { startDate, endDate, label } = getUtcMonthWindow(referenceDate)
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        subscription_end_date,
        membership_plans (
          plan_name
        )
      `
      )
      .gte('subscription_end_date', startDate)
      .lt('subscription_end_date', endDate)
      .eq('status', 'active')
      .order('subscription_end_date', { ascending: true })

    if (error) {
      console.error('Failed to fetch monthly expiring subscriptions', error)
      return
    }

    const rows = (data ?? []) as ExpiringUserRow[]
    const entries = rows
      .filter((row) => typeof row.email === 'string')
      .map((row) => {
        const planNameValue = row.membership_plans?.plan_name
        return {
          email: row.email!,
          firstName: typeof row.first_name === 'string' ? row.first_name : null,
          lastName: typeof row.last_name === 'string' ? row.last_name : null,
          planName: typeof planNameValue === 'string' ? planNameValue : null,
          subscriptionEndDate: row.subscription_end_date ?? null,
        }
      })

    await sendMonthlySubscriptionExpirySummaryEmail({
      to: MONTHLY_SUMMARY_RECIPIENT,
      monthLabel: label,
      entries,
    })
  } catch (error) {
    console.error('Monthly subscription summary job failed', error)
  }
}

export const runDropOffSummary = async (referenceDate: Date = new Date()) => {
  if (!DROP_OFF_SUMMARY_RECIPIENT) {
    return
  }

  const today = referenceDate.toISOString().split('T')[0]
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at, updated_at')
      .eq('role', 'drop_off')
      // Use `updated_at` so we capture delayed `drop_off` assignments correctly.
      .gte('updated_at', today)

    if (error) {
      console.error('Failed to fetch drop-off users', error)
      return
    }

    const rows = (data ?? []) as any[]
    const entries = rows.map((row) => ({
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      createdAt: row.created_at,
    }))

    if (entries.length === 0) {
      console.log('No new drop-offs today.')
      return
    }

    await sendDropOffSummaryEmail({
      to: DROP_OFF_SUMMARY_RECIPIENT,
      dateLabel: referenceDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      entries,
    })
  } catch (error) {
    console.error('Drop-off summary job failed', error)
  }
}

export const runExpiredPremiumMailchimpSync = async (
  referenceDate: Date = new Date()
) => {
  const today = referenceDate.toISOString().split('T')[0]
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        phone,
        subscription_end_date,
        membership_plans (
          plan_name,
          plan_code
        )
      `
      )
      .lt('subscription_end_date', today)
      .eq('status', 'active')
      .in('role', ['core_subscriber', 'research_ally_subscriber'])

    if (error) {
      console.error('Failed to fetch expired premium users for Mailchimp sync', error)
      return
    }

    for (const user of ((data ?? []) as ExpiringUserRow[])) {
      try {
        await syncExpiredPremiumUserToMailchimp({
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          plan: user.membership_plans,
        })
      } catch (error) {
        console.error(`Mailchimp expired premium sync failed for user ${user.id}`, error)
      }
    }
  } catch (error) {
    console.error('Expired premium Mailchimp sync job failed', error)
  }
}

let scheduled = false
let lastRunDay: string | null = null

export const startSubscriptionExpiryReminderJob = () => {
  const enableScheduler =
    process.env.ENABLE_REMINDER_SCHEDULER === 'true' ||
    process.env.NODE_ENV === 'production'

  if (scheduled || !enableScheduler) return
  scheduled = true

  const execute = async () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    if (lastRunDay === today) {
      return
    }
    lastRunDay = today
    await runExpiredPremiumMailchimpSync(now)
    await runSubscriptionExpiryReminder()
    await runDropOffSummary(now)

    const monthKey = getMonthKey(now)
    if (now.getUTCDate() === 1 && lastMonthlySummaryMonthKey !== monthKey) {
      lastMonthlySummaryMonthKey = monthKey
      await runMonthlySubscriptionExpirySummary(now)
    }
  }

  execute()
  setInterval(() => {
    execute().catch((error) => {
      console.error('Subscription reminder scheduler error', error)
    })
  }, ONE_DAY_MS)
}
