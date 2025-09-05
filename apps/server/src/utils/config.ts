export const config = {
  saltRounds: 12,
  OtpTimeout: new Date(Date.now() + 10 * 60 * 1000),
  roles: {
    admin: "admin",
    employee: "employee",
    core_subscriber: "core_subscriber",
    ipo_subscriber: "ipo_subscriber",
    research_ally_subscriber: "research_ally_subscriber",
  },
};
