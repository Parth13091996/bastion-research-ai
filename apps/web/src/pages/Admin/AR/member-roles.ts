type Membership = {
  role?: string | null;
  subscription_end_date?: string | null;
};

// Date-only subscriptions remain valid through their end date in India.
export function isSubscriptionExpired(endDate: string | null | undefined, now: number): boolean {
  if (!endDate?.trim()) return false;
  const value = endDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const midnight = Date.parse(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) return false;
    return now >= midnight + 24 * 60 * 60 * 1000 - 330 * 60 * 1000;
  }
  const end = Date.parse(value);
  return Number.isFinite(end) && now >= end;
}

// An admin classification; retain the billing role on the original member record.
export function getMemberRole(member: Membership, now: number): string {
  let role = (member.role || "free_subscriber").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (role === "administrator") role = "admin";
  if (role === "core_subscriber" && isSubscriptionExpired(member.subscription_end_date, now)) {
    return "ex_core_subscriber";
  }
  return role;
}
