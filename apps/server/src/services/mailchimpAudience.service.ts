import crypto from 'crypto'
import mailchimp from '@mailchimp/mailchimp_marketing'
import {
  getMailchimpErrorInfo,
  isMailchimpAlreadySubscribed,
  isMailchimpResubscribeRequired,
} from './mailchimp.service'

export const MAILCHIMP_ONBOARDING_TAGS = [
  'onboard_onetime',
  'onboard_premium',
  'onboard_free',
  'premium_active',
  'no_more_premium',
] as const

const PUBLIC_TAG_PREFIXES = ['Risk_webinar_']

export type MailchimpOnboardingTag = (typeof MAILCHIMP_ONBOARDING_TAGS)[number]

type PlanLike = {
  plan_code?: string | null
  plan_name?: string | null
  price_amount?: number | null
  amount?: number | string | null
}

type SyncPayload = {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  plan?: PlanLike | null
}

const configureMailchimp = () => {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER_PREFIX
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID
  if (!apiKey || !server || !audienceId) {
    return null
  }
  mailchimp.setConfig({ apiKey, server })
  return { audienceId }
}

const subscriberHashForEmail = (email: string) =>
  crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')

export const filterAllowedMailchimpTags = (tags: string[]) =>
  tags.filter(
    (tag) =>
      MAILCHIMP_ONBOARDING_TAGS.includes(tag as MailchimpOnboardingTag) ||
      PUBLIC_TAG_PREFIXES.some((prefix) => tag.startsWith(prefix))
  )

const resolvePlanTag = (plan?: PlanLike | null): MailchimpOnboardingTag => {
  const code = plan?.plan_code?.toLowerCase().trim()
  const name = (plan?.plan_name || '').toLowerCase()
  const amount = plan?.price_amount ?? plan?.amount
  const isFree = String(amount ?? '') === '0' || code === 'freemium'

  if (code === 'core') return 'onboard_onetime'
  if (code === 'core_annual' || code === 'research_hub') return 'onboard_premium'
  if (isFree) return 'onboard_free'
  if (name.includes('annual') || name.includes('premium')) return 'onboard_premium'
  if (name.includes('freemium') || name.includes('free')) return 'onboard_free'
  return 'onboard_free'
}

const mergeFieldsForUser = (payload: SyncPayload): Record<string, string> | undefined => {
  const mergeFields: Record<string, string> = {}
  if (payload.firstName?.trim()) mergeFields.FNAME = payload.firstName.trim()
  if (payload.lastName?.trim()) mergeFields.LNAME = payload.lastName.trim()
  if (payload.phone?.trim()) mergeFields.PHONE = payload.phone.trim()
  return Object.keys(mergeFields).length ? mergeFields : undefined
}

export const upsertMailchimpMemberWithTags = async ({
  email,
  tagsToActivate,
  tagsToDeactivate = [],
  mergeFields,
}: {
  email?: string | null
  tagsToActivate: string[]
  tagsToDeactivate?: string[]
  mergeFields?: Record<string, string>
}) => {
  const config = configureMailchimp()
  const normalizedEmail = email?.trim().toLowerCase()
  if (!config || !normalizedEmail || !normalizedEmail.includes('@')) return

  const tagsToApply = filterAllowedMailchimpTags([
    ...tagsToActivate,
    ...tagsToDeactivate,
  ])
  if (!tagsToApply.length && !mergeFields) return

  const subscriberHash = subscriberHashForEmail(normalizedEmail)

  try {
    await mailchimp.lists.addListMember(
      config.audienceId,
      {
        email_address: normalizedEmail,
        status: 'subscribed',
        ...(mergeFields ? { merge_fields: mergeFields } : {}),
      },
      { skipMergeValidation: true }
    )
  } catch (error: any) {
    const alreadySubscribed = isMailchimpAlreadySubscribed(error)
    const needsResubscribe = isMailchimpResubscribeRequired(error)
    if (!alreadySubscribed && !needsResubscribe) {
      throw error
    }
    if (needsResubscribe) {
      const info = getMailchimpErrorInfo(error)
      console.warn('Mailchimp member requires re-subscribe before tag sync', {
        email: normalizedEmail,
        detail: info.detail || info.title,
      })
      return
    }
    if (mergeFields) {
      await mailchimp.lists.updateListMember(config.audienceId, subscriberHash, {
        merge_fields: mergeFields,
      })
    }
  }

  if (!tagsToApply.length) return

  const deactivateSet = new Set(tagsToDeactivate)
  await mailchimp.lists.updateListMemberTags(config.audienceId, subscriberHash, {
    tags: tagsToApply.map((name) => ({
      name,
      status: deactivateSet.has(name) ? 'inactive' : 'active',
    })),
  })
}

export const syncOnboardedUserToMailchimp = async (payload: SyncPayload) => {
  const planTag = resolvePlanTag(payload.plan)
  const isFree = planTag === 'onboard_free'
  const activeTags: string[] = isFree ? [planTag] : [planTag, 'premium_active']
  const inactiveTags = MAILCHIMP_ONBOARDING_TAGS.filter(
    (tag) => !activeTags.includes(tag)
  )

  await upsertMailchimpMemberWithTags({
    email: payload.email,
    tagsToActivate: activeTags,
    tagsToDeactivate: inactiveTags,
    mergeFields: mergeFieldsForUser(payload),
  })
}

export const syncExpiredPremiumUserToMailchimp = async (payload: SyncPayload) => {
  await upsertMailchimpMemberWithTags({
    email: payload.email,
    tagsToActivate: ['no_more_premium'],
    tagsToDeactivate: ['premium_active', 'onboard_premium', 'onboard_onetime'],
    mergeFields: mergeFieldsForUser(payload),
  })
}
