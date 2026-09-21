import crypto from 'crypto'
import { supabase } from '../supabase'
import { config } from '../utils/config'

type TimeoutHandle = ReturnType<typeof setTimeout>

const onboardingSessions = new Set<string>()
const userDropOffTimers = new Map<string, TimeoutHandle>()

const shouldMarkAsDropOff = (status: string | null | undefined) =>
  status !== 'active' && status !== 'free'

const runDropOffCheckForUser = async (userId: string) => {
  try {
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, status, role')
      .eq('id', userId)
      .maybeSingle()

    if (fetchErr || !user) {
      if (fetchErr) {
        console.error('Drop-off check failed to fetch user', fetchErr)
      }
      return
    }

    if (user.role === config.roles.admin || user.role === config.roles.drop_off) {
      return
    }
    if (!shouldMarkAsDropOff(user.status)) {
      return
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({
        role: config.roles.drop_off,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateErr) {
      console.error('Drop-off assignment failed', updateErr)
      return
    }

    console.log(`[drop-off] assigned user ${userId}`)
  } catch (err) {
    console.error('Drop-off check error', err)
  }
}

const scheduleDropOffTimerForUser = (userId: string) => {
  const existing = userDropOffTimers.get(userId)
  if (existing) {
    clearTimeout(existing)
    userDropOffTimers.delete(userId)
  }

  const delayMs =
    config.onboarding_drop_off_delay_ms && config.onboarding_drop_off_delay_ms > 0
      ? config.onboarding_drop_off_delay_ms
      : 3 * 60 * 60 * 1000

  const handle = setTimeout(() => {
    userDropOffTimers.delete(userId)
    void runDropOffCheckForUser(userId)
  }, delayMs)

  userDropOffTimers.set(userId, handle)
}

export const startOnboardingDropOffSession = (sessionId?: string) => {
  const id = sessionId && sessionId.trim() ? sessionId.trim() : crypto.randomUUID()
  onboardingSessions.add(id)
  return id
}

export const armOnboardingDropOffForUser = (
  userId: string,
  onboardingSessionId?: string
) => {
  if (!userId) return
  if (onboardingSessionId && !onboardingSessions.has(onboardingSessionId)) {
    return
  }
  if (onboardingSessionId) onboardingSessions.delete(onboardingSessionId)
  scheduleDropOffTimerForUser(userId)
}

export const clearOnboardingDropOffForUser = (userId?: string | null) => {
  if (!userId) return
  const existing = userDropOffTimers.get(userId)
  if (!existing) return
  clearTimeout(existing)
  userDropOffTimers.delete(userId)
}
