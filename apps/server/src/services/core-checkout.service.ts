import crypto from 'crypto';
import { supabase } from '../supabase';
import { pgFetchOrder } from './cashfree-pg.service';
import {
  AccessError,
  assertCorePurchaseAllowed,
  CORE_INTRO_PLAN_ID,
  calendarDate,
  indiaToday,
} from './premium-access.service';

// Requires the existing payment_history.transaction_id uniqueness constraint (verify at rollout).
// A stable UUID reserves the
// introductory purchase across processes without relying on a role or a cache.
export function introTransactionId(userId: string) {
  const hex = crypto
    .createHash('sha256')
    .update('bastion-core-intro:' + userId)
    .digest('hex')
    .slice(0, 32)
    .split('');
  hex[12] = '5';
  hex[16] = ['8', '9', 'a', 'b'][parseInt(hex[16], 16) % 4];
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
export function introOrderId(transactionId: string, createdAt: string) {
  return `core_${transactionId.replace(/-/g, '')}_${Date.parse(createdAt)}`;
}
export async function reserveIntroCheckout(
  userId: string,
  plan: any,
  amount: number,
  email?: string,
) {
  await assertCorePurchaseAllowed(userId, plan);
  if (Number(plan.plan_id) !== CORE_INTRO_PLAN_ID) return null;
  if (process.env.CORE_INTRO_RESERVATIONS_VERIFIED !== 'true')
    throw new AccessError(
      'Introductory checkout is temporarily unavailable. Please retry later or choose CORE Annual.',
      503,
    );
  const transactionId = introTransactionId(userId),
    createdAt = new Date().toISOString();
  const row = {
    transaction_id: transactionId,
    user_id: userId,
    plan_id: CORE_INTRO_PLAN_ID,
    transaction_status: 'PENDING',
    payer_email: email || null,
    created_at: createdAt,
  };
  const { error } = await supabase.from('payment_history').insert(row);
  if (!error) return { transactionId, createdAt, existingOrder: null };
  if (error.code !== '23505') throw error;
  const { data: existing, error: readError } = await supabase
    .from('payment_history')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();
  if (readError || !existing) throw readError || new Error('Unable to verify checkout');
  // A concurrent request may have completed after the first history read.
  await assertCorePurchaseAllowed(userId, plan);
  const orderId = introOrderId(transactionId, existing.created_at);
  let order: any;
  try {
    const result = await pgFetchOrder(orderId);
    order = result?.data || result;
  } catch (e: any) {
    // Only a provider-confirmed missing order can be created with the same ID.
    if (e?.response?.status !== 404)
      throw new AccessError('Unable to verify the previous checkout. Please retry.', 503);
    if (amount === 0)
      throw new AccessError(
        'An introductory checkout is already being processed. Please retry later.',
        409,
      );
    return { transactionId, createdAt: existing.created_at, existingOrder: null };
  }
  if (order.order_status === 'ACTIVE' && amount === 0)
    throw new AccessError(
      'An earlier paid checkout is still active. Complete it or retry after it expires.',
      409,
    );
  if (order.order_status === 'ACTIVE')
    return { transactionId, createdAt: existing.created_at, existingOrder: order };
  if (order.order_status === 'PAID')
    throw new AccessError(
      'Your introductory purchase is being confirmed. Please choose CORE Annual for future renewal.',
      409,
    );
  if (!['EXPIRED', 'CANCELLED', 'TERMINATED'].includes(order.order_status))
    throw new AccessError('The previous checkout has not completed. Please retry later.', 409);
  const { data: claimed, error: claimError } = await supabase
    .from('payment_history')
    .update(row)
    .eq('transaction_id', transactionId)
    .eq('created_at', existing.created_at)
    .neq('transaction_status', 'SUCCESS')
    .select('transaction_id');
  if (claimError) throw claimError;
  if (!claimed?.length) throw new AccessError('Checkout changed. Please retry.', 409);
  return { transactionId, createdAt, existingOrder: null };
}
export async function checkoutAmount(plan: any, user: any, couponCode?: string) {
  let amount = Number(plan.price_amount);
  if (!Number.isFinite(amount) || amount < 0) throw new AccessError('Invalid plan price', 400);
  // Preserve the existing annual-renewal rate, calculated from stored dates.
  const end = calendarDate(user.subscription_end_date);
  if (plan.plan_code === 'core_annual' && Number(user.plan_id) === 3 && end) {
    const days = Math.round((Date.parse(end) - Date.parse(indiaToday())) / 86400000);
    if (days <= 7 && days >= -30) amount = 15000;
  }
  if (couponCode) {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle();
    if (error) throw error;
    if (
      !coupon ||
      (coupon.expiry_date && Date.parse(coupon.expiry_date) < Date.now()) ||
      (coupon.max_uses != null && Number(coupon.used_count || 0) >= Number(coupon.max_uses))
    )
      throw new AccessError('Invalid, expired or exhausted coupon', 400);
    const discount = Number(coupon.discount_value);
    if (!Number.isFinite(discount) || discount < 0) throw new AccessError('Invalid coupon', 400);
    amount =
      coupon.discount_type === 'percentage'
        ? amount * (1 - Math.min(discount, 100) / 100)
        : amount - discount;
  }
  return Math.round(Math.max(0, amount) * 100) / 100;
}
