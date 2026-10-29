const DAY_MS = 24 * 60 * 60 * 1000;

export function reminderDate(reference: Date, offsetDays = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(reference);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const midnight = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")));
  return new Date(midnight + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

export function reminderDayDifference(expiry: string, reference = new Date()): number | null {
  const value = expiry.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const end = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(end) || new Date(end).toISOString().slice(0, 10) !== value) return null;
  return Math.round((end - Date.parse(`${reminderDate(reference)}T00:00:00Z`)) / DAY_MS);
}
