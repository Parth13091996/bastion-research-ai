import { supabase } from '../supabase'
import { config } from '../utils/config'

export const runOnboardingDropOffAssignment = async (
  referenceDate: Date = new Date()
) => {
  const delayMs = config.onboarding_drop_off_delay_ms
  const checkAfterMs = Number.isFinite(delayMs) ? delayMs : 3 * 60 * 60 * 1000
  const cutoffIso = new Date(referenceDate.getTime() - checkAfterMs).toISOString()
  const nowIso = referenceDate.toISOString()

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: config.roles.drop_off,
        updated_at: nowIso,
      })
      .neq('role', config.roles.drop_off)
      // Completed onboarding users should never be marked as drop-off.
      .neq('status', 'active')
      .neq('status', 'free')
      // Admin users should never be auto-flipped.
      .neq('role', config.roles.admin)
      // "Started onboarding" is represented by the time the user record was created.
      .lt('created_at', cutoffIso)
      .select('id')

    if (error) {
      console.error('Onboarding drop-off assignment failed', error)
      return
    }

    const updatedCount = Array.isArray(data) ? data.length : 0
    if (updatedCount > 0) {
      console.log(
        `[drop-off] assigned ${updatedCount} user(s) (cutoff=${cutoffIso})`
      )
    }
  } catch (err) {
    console.error('Onboarding drop-off assignment error', err)
  }
}

let scheduled = false
let isRunning = false

export const startOnboardingDropOffJob = () => {
  if (scheduled || process.env.NODE_ENV === 'test') return
  scheduled = true

  const intervalMs =
    config.onboarding_drop_off_check_interval_ms ||
    15 * 60 * 1000

  const execute = async () => {
    if (isRunning) return
    isRunning = true
    try {
      await runOnboardingDropOffAssignment(new Date())
    } finally {
      isRunning = false
    }
  }

  // Run immediately on server start so the job doesn't wait for the first interval.
  void execute()

  setInterval(() => {
    void execute().catch((e) => {
      console.error('Onboarding drop-off job failed', e)
    })
  }, intervalMs)
}

