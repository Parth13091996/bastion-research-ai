import { supabase } from '../supabase';

export const CORE_INTRO_PLAN_ID = 2;
export const CORE_ANNUAL_PLAN_ID = 3;
export class AccessError extends Error {
  constructor(
    message: string,
    public status = 403,
  ) {
    super(message);
  }
}
export const isFreemium = (tags: unknown) =>
  typeof tags === 'string' && tags.trim().toLowerCase() === 'freemium';
export function calendarDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (
    value.length !== 10 &&
    (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
      !Number.isFinite(Date.parse(value)))
  )
    return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day ? day : null;
}
export function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString().slice(0, 10);
}
export const indiaToday = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
export function approvedCorePlan(plan: any): boolean {
  return (
    (Number(plan?.plan_id) === CORE_INTRO_PLAN_ID &&
      plan?.plan_code === 'core' &&
      Number(plan?.duration_months) === 3) ||
    (Number(plan?.plan_id) === CORE_ANNUAL_PLAN_ID &&
      plan?.plan_code === 'core_annual' &&
      Number(plan?.duration_months) === 12)
  );
}
export function hasPremiumAccess(user: any, plan: any, now = new Date()): boolean {
  if (!user || user.status !== 'active') return false;
  if (user.role === 'admin' || user.role === 'employee') return true;
  if (
    user.role !== 'core_subscriber' ||
    !approvedCorePlan(plan) ||
    Number(user.plan_id) !== Number(plan.plan_id)
  )
    return false;
  const start = calendarDate(user.subscription_start_date),
    end = calendarDate(user.subscription_end_date),
    today = indiaToday(now);
  // Calendar expiry is inclusive: access ends at midnight in India after this day.
  return !!start && !!end && start <= today && today <= end && start <= end;
}
export async function accessForUser(user: any) {
  if (user?.status === 'active' && ['admin', 'employee'].includes(user.role))
    return { premium: true, plan: null };
  let plan: any = null;
  if (user?.plan_id) {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('plan_id,plan_code,plan_name,duration_months,price_amount,tier')
      .eq('plan_id', user.plan_id)
      .maybeSingle();
    if (error) throw error;
    plan = data;
  }
  return { premium: hasPremiumAccess(user, plan), plan };
}
export async function requestAccess(req: any) {
  if (!req.premiumAccess) req.premiumAccess = await accessForUser(req.user);
  return req.premiumAccess as { premium: boolean; plan: any };
}
export async function requirePremium(req: any, res: any, next: any) {
  try {
    if (!(await requestAccess(req)).premium)
      return res
        .status(req.user ? 403 : 401)
        .json({ message: 'An active CORE subscription is required.' });
    res.set('Cache-Control', 'private, no-store');
    return next();
  } catch {
    return res.status(503).json({ message: 'Unable to verify premium access. Please retry.' });
  }
}
export async function coreIntroConsumed(
  userId: string,
  exceptTransactionId?: string,
): Promise<boolean> {
  let query = supabase
    .from('payment_history')
    .select('transaction_status')
    .eq('user_id', userId)
    .eq('plan_id', CORE_INTRO_PLAN_ID);
  if (exceptTransactionId) query = query.neq('transaction_id', exceptTransactionId);
  const { data, error } = await query;
  if (error) throw error;
  return (data||[]).some(row=>['SUCCESS','COMPLETED','PAID','COUPON_APPLIED','FREE'].includes(String(row.transaction_status||'').trim().toUpperCase()));
}
export async function assertCorePurchaseAllowed(
  userId: string,
  plan: any,
  exceptTransactionId?: string,
) {
  if (
    Number(plan?.plan_id) === CORE_INTRO_PLAN_ID &&
    (await coreIntroConsumed(userId, exceptTransactionId))
  ) {
    throw new AccessError(
      'The 3-month CORE plan can only be purchased once. Please choose CORE Annual for renewal.',
      409,
    );
  }
}
