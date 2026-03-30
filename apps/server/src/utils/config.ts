export const config = {
  salt_rounds: 12,
  // OTP validity duration (10 minutes)
  otp_ttl_ms: 10 * 60 * 1000,
  app_url: process.env.FRONTEND_URL,
  // If a user starts onboarding but doesn't complete it within this time window,
  // they will be marked as `drop_off`.
  // Change the env var values for quick testing.
  onboarding_drop_off_delay_ms: Number(
    process.env.ONBOARDING_DROP_OFF_DELAY_MS
  ) || 3 * 60 * 60 * 1000,
  // How often to check for users eligible to be marked `drop_off`.
  onboarding_drop_off_check_interval_ms: Number(
    process.env.ONBOARDING_DROP_OFF_CHECK_INTERVAL_MS
  ) || 15 * 60 * 1000,
  roles: {
    admin: 'admin',
    employee: 'employee',
    core_subscriber: 'core_subscriber',
    ipo_subscriber: 'ipo_subscriber',
    research_ally_subscriber: 'research_ally_subscriber',
    drop_off: 'drop_off',
  },
  aisensy_endpoint: 'https://backend.aisensy.com/campaign/t1/api/v2',
}
