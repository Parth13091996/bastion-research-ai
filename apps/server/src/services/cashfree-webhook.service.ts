import { pgFetchOrder } from './cashfree-pg.service';
import { assertCorePurchaseAllowed, calendarDate, indiaToday, addMonths } from './premium-access.service';
import { incrementCouponUsage } from '../controllers/coupon.controller'
import crypto from 'crypto'
import { supabase } from '../supabase'
import { config } from '../utils/config'
import { clearOnboardingDropOffForUser } from '../automations/onboardingDropOff.scheduler'
import { sendWelcomeEmailForUser } from './emailNotification.service'
import { syncOnboardedUserToMailchimp } from './mailchimpAudience.service'

export const verifyWebhookSignature = (
  signature: string | undefined,
  timestamp: string | undefined,
  rawBody: string | undefined
) => {
  if (!signature || !timestamp || !rawBody) {
    return {
      ok: false,
      status: 400,
      message: 'Missing webhook signature or timestamp.',
    } as const
  }
  const secret = process.env.CASHFREE_SECRET
  if (!secret) {
    throw new Error('CASHFREE_SECRET is not configured.')
  }
  const dataToVerify = `${timestamp}${rawBody}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataToVerify)
    .digest('base64')
  if (signature !== expectedSignature) {
    return {
      ok: false,
      status: 401,
      message: 'Invalid webhook signature.',
    } as const
  }
  return { ok: true } as const
}

export const handlePaymentSuccess = async (payload: any) => {
  // const payment = payload?.data?.payment;
  // const orderId = payload?.data?.order?.order_id;
  // if (!orderId || payment?.payment_status !== 'SUCCESS') throw new Error('Invalid successful payment event');
  // const orderResponse = await pgFetchOrder(orderId), order = orderResponse?.data || orderResponse;
  // if (order.order_status !== 'PAID') throw new Error('Order is not paid');
  // const tags = order.order_tags || {}, customer_details = order.customer_details || {};
  // const taggedTransactionId = tags.transaction_id;
  // if (!taggedTransactionId) throw new Error('Order is missing its transaction reference');
  // const { data: existingPayment, error: paymentError } = await supabase.from('payment_history').select('*').eq('transaction_id', taggedTransactionId).maybeSingle();
  // if (paymentError || !existingPayment) throw new Error('Payment reservation not found');
  // const wasAlreadySuccessful = existingPayment.transaction_status === 'SUCCESS';
  // if (wasAlreadySuccessful) return;
  // if (customer_details.customer_id !== existingPayment.user_id) throw new Error('Order customer does not match payment');
  // const { data: currentPlan, error: planError } = await supabase.from('membership_plans').select('*').eq('plan_id', existingPayment.plan_id).single();
  // if (planError || !currentPlan || String(currentPlan.plan_id) !== String(tags.plan_id)) throw new Error('Order plan does not match payment');
  // const expectedAmount = existingPayment.discounted_amount ?? order.order_amount;
  // if (!Number.isFinite(Number(expectedAmount)) || !Number.isFinite(Number(payment.payment_amount)) || Math.abs(Number(payment.payment_amount) - Number(expectedAmount)) > 0.01 || order.order_currency !== currentPlan.currency) throw new Error('Payment amount or currency mismatch');
  // await assertCorePurchaseAllowed(existingPayment.user_id, currentPlan, taggedTransactionId);
  // const { data: existingUser, error: userError } = await supabase.from('users').select('*').eq('id', existingPayment.user_id).single();
  // if (userError || !existingUser) throw new Error('Customer not found');
  // const tagCouponCode = tags.coupon_code;
  const { payment, customer_details } = payload?.data || {}
  const tagPlanId = payment?.order_tags?.plan_id
  const tagPlanCode = payment?.order_tags?.plan_code
  const tagCouponCode = payment?.order_tags?.coupon_code
  const tags = payment?.order_tags
  const taggedTransactionId = payment?.order_tags?.transaction_id as
    | string
    | undefined
  let currentPlan: any = null
  if (tagPlanId || tagPlanCode) {
    const { data } = await supabase
      .from('membership_plans')
      .select(
        'plan_id, plan_name, price_amount, currency, duration_months, plan_code, tier'
      )
      .or(
        [
          tagPlanId ? `plan_id.eq.${tagPlanId}` : '',
          tagPlanCode ? `plan_code.eq.${tagPlanCode}` : '',
        ]
          .filter(Boolean)
          .join(',')
      )
      .limit(1)
    currentPlan = data?.[0] || null
  }
  if (!currentPlan) {
    const { data: plans } = await supabase
      .from('membership_plans')
      .select(
        'plan_id, plan_name, price_amount, currency, duration_months, plan_code, tier'
      )
    currentPlan = plans?.find(
      (plan) => plan.price_amount === payment?.payment_amount
    )
  }
  const transactionId = taggedTransactionId || crypto.randomUUID()
  const { data: existingPayment } = await supabase
    .from('payment_history')
    .select('transaction_id, user_id, transaction_status')
    .eq('transaction_id', transactionId)
    .maybeSingle()


  const userId = existingPayment?.user_id || customer_details?.customer_id
  if (!userId) throw new Error('Customer not found')

  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (userError || !existingUser) throw new Error('Customer not found')

  const paymentTime = payment?.payment_time
    ? new Date(payment.payment_time)
    : new Date()
  const previousEnd = calendarDate(tags.renewal_from);
  const renewing = currentPlan.plan_code === 'core_annual' && ['core_subscriber', 'admin', 'employee'].includes(existingUser.role) && previousEnd && previousEnd >= indiaToday(paymentTime);
  const startDateStr = renewing ? calendarDate(tags.subscription_start) || indiaToday(paymentTime) : indiaToday(paymentTime)
  // const startDateStr = paymentTime.toISOString().split('T')[0]
  let endDateStr: string | null = null

  const durationMonths = currentPlan?.duration_months
  if (typeof durationMonths === 'number' && durationMonths > 0) {
    endDateStr = addMonths(renewing ? previousEnd : indiaToday(paymentTime), durationMonths)
  }

  const updateUserPayload: any = {
    status: ['inactive', 'suspended', 'blocked', 'disabled'].includes(existingUser.status) ? existingUser.status : 'active',
    plan_id: currentPlan?.plan_id || null,
    subscription_start_date: startDateStr,
    subscription_end_date: endDateStr,
    role: ['admin', 'employee'].includes(existingUser.role) ? existingUser.role :
      currentPlan?.plan_code === 'research_hub'
        ? config.roles.research_ally_subscriber
        : config.roles.core_subscriber,
  }

  const normalizedCouponCode =
    typeof tagCouponCode === 'string' && tagCouponCode.trim()
      ? tagCouponCode.trim().toUpperCase()
      : null

  const resolveCouponId = async (): Promise<number | null> => {
    if (!normalizedCouponCode) return null
    const { data, error } = await supabase
      .from('coupons')
      .select('coupon_id')
      .eq('coupon_code', normalizedCouponCode)
      .maybeSingle()
    if (error) return null
    return typeof (data as any)?.coupon_id === 'number'
      ? (data as any).coupon_id
      : null
  }


  const wasAlreadySuccessful =
    (existingPayment as any)?.transaction_status === 'SUCCESS'

  const resolveUserId = async (): Promise<string | null> => {
    const candidateCustomerId = customer_details?.customer_id
    if (typeof candidateCustomerId === 'string' && candidateCustomerId.trim()) {
      const { data: byId } = await supabase
        .from('users')
        .select('id')
        .eq('id', candidateCustomerId)
        .maybeSingle()
      if (byId?.id) return byId.id as string
    }

    const customerEmail = customer_details?.customer_email
    if (typeof customerEmail === 'string' && customerEmail.trim()) {
      const { data: byEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail.trim())
        .maybeSingle()
      if (byEmail?.id) return byEmail.id as string
    }

    if (typeof (existingPayment as any)?.user_id === 'string') {
      return (existingPayment as any).user_id
    }

    return null
  }

  const resolvedUserId = await resolveUserId()
  const updateUserPromise = resolvedUserId
    ? supabase.from('users').update(updateUserPayload).eq('id', resolvedUserId)
    : Promise.resolve({} as any)

  const paymentUpdateBase: any = {
    transaction_status: payment?.payment_status,
    plan_id: currentPlan?.plan_id,
    payer_email: customer_details?.customer_email,
    created_at: payment?.payment_time || paymentTime.toISOString(),
    discounted_amount:
      typeof payment?.payment_amount === 'number'
        ? payment.payment_amount
        : null,
    coupon_code: normalizedCouponCode,
    coupon_applied: await resolveCouponId(),
  }
  if (resolvedUserId) {
    paymentUpdateBase.user_id = resolvedUserId
  }

  const persistPaymentHistory = async () => {
    if (!existingPayment && !resolvedUserId) {
      console.warn(
        'Skipping payment_history insert because no matching user was found for webhook payment',
        {
          transactionId,
          customerId: customer_details?.customer_id,
          customerEmail: customer_details?.customer_email,
        }
      )
      return
    }

    const op = existingPayment
      ? supabase
        .from('payment_history')
        .update(paymentUpdateBase)
        .eq('transaction_id', transactionId)
        .eq('transaction_status', existingPayment.transaction_status)
      : supabase
        .from('payment_history')
        .insert({ ...paymentUpdateBase, transaction_id: transactionId })
        .maybeSingle()

    const { error } = await op
    if (!error) return

    if (error?.message?.toLowerCase?.().includes('column')) {
      const fallbackBase: any = {
        transaction_status: payment?.payment_status,
        plan_id: currentPlan?.plan_id,
        payer_email: customer_details?.customer_email,
        created_at: payment?.payment_time || paymentTime.toISOString(),
      }
      if (resolvedUserId) {
        fallbackBase.user_id = resolvedUserId
      }
      if (existingPayment) {
        await supabase
          .from('payment_history')
          .update(fallbackBase)
          .eq('transaction_id', transactionId)
      } else {
        await supabase
          .from('payment_history')
          .insert({ ...fallbackBase, transaction_id: transactionId })
          .maybeSingle()
      }
      return
    }

    throw error
  }

  // Persist the receipt only after activation. If receipt persistence fails,
  // the same provider-fixed window makes a retry safe and idempotent.
  // await activateUser();
  // await persistPaymentHistory();
  await Promise.all([updateUserPromise, persistPaymentHistory()])
  if (normalizedCouponCode && !wasAlreadySuccessful) {
    try {
      await incrementCouponUsage(normalizedCouponCode)
    } catch (e: any) {
      console.error('Failed to increment coupon usage in webhook:', e)
    }
  }
  if (resolvedUserId && !wasAlreadySuccessful) {
    void sendWelcomeEmailForUser(resolvedUserId, currentPlan?.plan_name)
    void (async () => {
      const { data } = await supabase
        .from('users')
        .select('email, first_name, last_name, phone')
        .eq('id', resolvedUserId)
        .maybeSingle()
      await syncOnboardedUserToMailchimp({
        email: (data as any)?.email || customer_details?.customer_email,
        firstName: (data as any)?.first_name,
        lastName: (data as any)?.last_name,
        phone: (data as any)?.phone || customer_details?.customer_phone,
        plan: currentPlan,
      })
    })().catch((e: any) =>
      console.error('Mailchimp paid onboarding sync failed', e)
    )
  }
  clearOnboardingDropOffForUser(customer_details?.customer_id)
}

export const handlePaymentUserDropped = async (payload: any) => {
  const { payment, customer_details } = payload?.data || {};
  const transactionId = payment?.order_tags?.transaction_id;
  const customerId = customer_details?.customer_id;

  // 1. Update payment_history if it is currently PENDING
  if (transactionId) {
    try {
      const { data: existingPayment } = await supabase
        .from('payment_history')
        .select('transaction_status')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (existingPayment && existingPayment.transaction_status === 'PENDING') {
        await supabase
          .from('payment_history')
          .update({ transaction_status: 'USER_DROPPED' })
          .eq('transaction_id', transactionId);
      }
    } catch (err: any) {
      console.error('Error updating payment_history for USER_DROPPED:', err?.message);
    }
  }

  // 2. Only set users.status = 'payment_pending' if user is not already active with a valid subscription
  if (customerId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('status, subscription_end_date')
        .eq('id', customerId)
        .maybeSingle();

      const isAlreadyActive =
        user?.status === 'active' &&
        user?.subscription_end_date &&
        new Date(user.subscription_end_date) >= new Date();

      if (!isAlreadyActive) {
        await supabase
          .from('users')
          .update({ status: 'payment_pending' })
          .eq('id', customerId);
      }
    } catch (err: any) {
      console.error('Error updating user status for USER_DROPPED:', err?.message);
    }
  }
};

export const handlePaymentFailed = async (payload: any) => {
  const { payment, customer_details } = payload?.data || {};
  const transactionId = payment?.order_tags?.transaction_id;
  const customerId = customer_details?.customer_id;

  // 1. Update payment_history if it is currently PENDING
  if (transactionId) {
    try {
      const { data: existingPayment } = await supabase
        .from('payment_history')
        .select('transaction_status')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (existingPayment && existingPayment.transaction_status === 'PENDING') {
        await supabase
          .from('payment_history')
          .update({ transaction_status: 'FAILED' })
          .eq('transaction_id', transactionId);
      }
    } catch (err: any) {
      console.error('Error updating payment_history for FAILED:', err?.message);
    }
  }

  // 2. Only set users.status = 'payment_pending' if user is not already active with a valid subscription
  if (customerId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('status, subscription_end_date')
        .eq('id', customerId)
        .maybeSingle();

      const isAlreadyActive =
        user?.status === 'active' &&
        user?.subscription_end_date &&
        new Date(user.subscription_end_date) >= new Date();

      if (!isAlreadyActive) {
        await supabase
          .from('users')
          .update({ status: 'payment_pending' })
          .eq('id', customerId);
      }
    } catch (err: any) {
      console.error('Error updating user status for FAILED:', err?.message);
    }
  }
};
