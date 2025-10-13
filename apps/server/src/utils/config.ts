export const config = {
  salt_rounds: 12,
  // OTP validity duration (10 minutes)
  otp_ttl_ms: 10 * 60 * 1000,
  app_url: process.env.FRONTEND_URL,
  roles: {
    admin: "admin",
    employee: "employee",
    core_subscriber: "core_subscriber",
    ipo_subscriber: "ipo_subscriber",
    research_ally_subscriber: "research_ally_subscriber",
  },
};
