import {pgFetchOrder} from './cashfree-pg.service';
import {assertCorePurchaseAllowed,calendarDate,indiaToday,addMonths} from './premium-access.service';
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
  const payment=payload?.data?.payment;
  const orderId=payload?.data?.order?.order_id;
  if(!orderId||payment?.payment_status!=='SUCCESS')throw new Error('Invalid successful payment event');
  const orderResponse=await pgFetchOrder(orderId),order=orderResponse?.data||orderResponse;
  if(order.order_status!=='PAID')throw new Error('Order is not paid');
  const tags=order.order_tags||{},customer_details=order.customer_details||{};
  const taggedTransactionId=tags.transaction_id;
  if(!taggedTransactionId)throw new Error('Order is missing its transaction reference');
  const {data:existingPayment,error:paymentError}=await supabase.from('payment_history').select('*').eq('transaction_id',taggedTransactionId).maybeSingle();
  if(paymentError||!existingPayment)throw new Error('Payment reservation not found');
  const wasAlreadySuccessful=existingPayment.transaction_status==='SUCCESS';
  if(wasAlreadySuccessful)return;
  if(customer_details.customer_id!==existingPayment.user_id)throw new Error('Order customer does not match payment');
  const {data:currentPlan,error:planError}=await supabase.from('membership_plans').select('*').eq('plan_id',existingPayment.plan_id).single();
  if(planError||!currentPlan||String(currentPlan.plan_id)!==String(tags.plan_id))throw new Error('Order plan does not match payment');
  const expectedAmount=existingPayment.discounted_amount ?? order.order_amount;
  if(!Number.isFinite(Number(expectedAmount)) || !Number.isFinite(Number(payment.payment_amount)) || Math.abs(Number(payment.payment_amount)-Number(expectedAmount))>0.01 || order.order_currency!==currentPlan.currency)throw new Error('Payment amount or currency mismatch');
  await assertCorePurchaseAllowed(existingPayment.user_id,currentPlan,taggedTransactionId);
  const {data:existingUser,error:userError}=await supabase.from('users').select('*').eq('id',existingPayment.user_id).single();
  if(userError||!existingUser)throw new Error('Customer not found');
  const tagCouponCode=tags.coupon_code;

  const paymentTime = payment?.payment_time
    ? new Date(payment.payment_time)
    : new Date()
  const previousEnd=calendarDate(tags.renewal_from);
  const renewing=currentPlan.plan_code==='core_annual' && ['core_subscriber','admin','employee'].includes(existingUser.role) && previousEnd && previousEnd>=indiaToday(paymentTime);
  const startDateStr = renewing ? calendarDate(tags.subscription_start)||indiaToday(paymentTime) : indiaToday(paymentTime)
  let endDateStr: string | null = null

  const durationMonths = currentPlan?.duration_months
  if (typeof durationMonths === 'number' && durationMonths > 0) {
    endDateStr=addMonths(renewing?previousEnd:indiaToday(paymentTime),durationMonths)
  }

  const updateUserPayload: any = {
    status: ['inactive','suspended','blocked','disabled'].includes(existingUser.status)?existingUser.status:'active',
    plan_id: currentPlan?.plan_id || null,
    subscription_start_date: startDateStr,
    subscription_end_date: endDateStr,
    role: ['admin','employee'].includes(existingUser.role) ? existingUser.role :
      currentPlan?.plan_code === 'research_hub'
        ? config.roles.research_ally_subscriber
        : config.roles.core_subscriber,
  }

  const transactionId = taggedTransactionId || crypto.randomUUID()
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

  const resolveUserId=async()=>existingPayment.user_id as string;

  const resolvedUserId = await resolveUserId()
  const activateUser=async()=>{
    const staff=['admin','employee'].includes(existingUser.role);
    const alreadyCovered=existingUser.status==='active' && (staff||existingUser.role==='core_subscriber') && [2,3].includes(Number(existingUser.plan_id)) && calendarDate(existingUser.subscription_end_date) && existingUser.subscription_end_date>=String(endDateStr);
    if(alreadyCovered)return;
    // Compare the original window so concurrent paid events cannot shorten or
    // double-extend a subscription. A conflict is retried from fresh DB state.
    let query=supabase.from('users').update(updateUserPayload).eq('id',resolvedUserId);
    query=existingUser.subscription_end_date==null?query.is('subscription_end_date',null):query.eq('subscription_end_date',existingUser.subscription_end_date);
    const {data,error}=await query.select('id');
    if(error)throw error;
    if(!data?.length)throw new Error('Subscription changed concurrently; retry payment activation');
  };

  const paymentUpdateBase: any = {
    transaction_status: payment?.payment_status,
    plan_id: currentPlan?.plan_id,
    payer_email: customer_details?.customer_email,
    created_at: payment?.payment_time,
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
          .eq('transaction_status',existingPayment.transaction_status)
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
        created_at: payment?.payment_time,
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
  await activateUser();
  await persistPaymentHistory();
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
  const { customer_details } = payload?.data || {}
  await supabase
    .from('users')
    .update({ status: 'payment_pending' })
    .eq('id', customer_details?.customer_id)
    .neq('status','active')
}

export const handlePaymentFailed = async (payload: any) => {
  const { customer_details } = payload?.data || {}
  await supabase
    .from('users')
    .update({ status: 'payment_pending' })
    .eq('id', customer_details?.customer_id)
    .neq('status','active')
}
