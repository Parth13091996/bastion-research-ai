/** Admin stores date as `yyyy-MM-dd` and time as `HH:mm` (24h). */

export function formatWebinarDateLabel(raw: string | undefined): string {
  const s = raw?.trim() ?? ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, mo, d] = s.split("-").map(Number)
    const dt = new Date(Date.UTC(y, mo - 1, d))
    if (Number.isNaN(dt.getTime())) return s
    return dt.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
  return s
}

export function formatWebinarTimeLabel(raw: string | undefined): string {
  const s = raw?.trim() ?? ""
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [hStr, mStr] = s.split(":")
    const h = parseInt(hStr, 10)
    const mm = parseInt(mStr, 10)
    const dt = new Date()
    dt.setHours(h, mm, 0, 0)
    return dt.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  return s
}
