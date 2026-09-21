import { format, parseISO } from "date-fns";

/** Admin stores AiSensy date as `yyyy-MM-dd`. */
export function formatAisensyWebinarDate(isoYmd: string | undefined | null): string {
  const t = isoYmd?.trim();
  if (!t) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    try {
      return format(parseISO(t), "PPP");
    } catch {
      return t;
    }
  }
  return t;
}

/** Admin stores time as `HH:mm` (24h). */
export function formatAisensyWebinarTime(hhmm: string | undefined | null): string {
  const t = hhmm?.trim();
  if (!t) return "—";
  if (/^\d{1,2}:\d{2}$/.test(t)) {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return `${d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })} IST`;
  }
  return t;
}

/**
 * Stable id for DB + AiSensy (`portfolio-red-flags-*`). Uses admin AiSensy date/time
 * so each scheduled session gets its own slug and duplicate checks are per event.
 */
export function buildPortfolioWebinarSlug(
  dateYmd?: string | null,
  timeHhmm?: string | null
): string {
  const base = "portfolio-red-flags";
  const d = dateYmd?.trim();
  const t = timeHhmm?.trim()?.replace(/:/g, "-");
  if (d && t) return `${base}-${d}-${t}`;
  if (d) return `${base}-${d}`;
  if (t) return `${base}-${t}`;
  return `${base}-schedule`;
}
