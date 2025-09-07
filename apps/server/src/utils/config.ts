export const config = {
  saltRounds: 12,
  // OTP validity duration (10 minutes)
  OtpTtlMs: 10 * 60 * 1000,
  roles: {
    admin: "admin",
    employee: "employee",
    core_subscriber: "core_subscriber",
    ipo_subscriber: "ipo_subscriber",
    research_ally_subscriber: "research_ally_subscriber",
  },
};
