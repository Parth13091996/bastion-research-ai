import { AccessError } from '../services/premium-access.service';
import { Request, Response } from 'express'
// import { pgFetchOrder } from '../services/cashfree-pg.service'
// import { Request, Response } from 'express'
import { pgFetchOrder, pgFetchOrderPayments } from '../services/cashfree-pg.service'
import {
  createOrderForPlanService,
  fetchPlans,
  PublicPlan,
} from '../services/cashfree-plans-orders.service'
import { getUserSubscriptionService } from '../services/cashfree-subscription.service'
import {
  getPanVerificationStatusRequest,
  verifyPanRequest,
} from '../services/cashfree-verify.service'
import {
  handlePaymentFailed,
  handlePaymentSuccess,
  handlePaymentUserDropped,
  verifyWebhookSignature,
} from '../services/cashfree-webhook.service'
import { supabase } from '../supabase'

export const verifyPan = async (req: Request, res: Response) => {
  try {
    const { pan, name } = req.body as { pan?: string; name?: string }
    if (!pan || !name) {
      return res
        .status(400)
        .json({ message: 'pan and name are required for verification' })
    }

    const normalizedPan = pan.trim().toUpperCase()
    const currentUserId = (req as any).user?.id as string | undefined

    // 1. Check PAN uniqueness in the system (ignore current user, if any)
    try {
      const { data: existing, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('pan_card_number', normalizedPan)
        .maybeSingle()

      if (existingError) {
        console.error('Error checking PAN uniqueness:', existingError)
      }

      if (existing && (!currentUserId || existing.id !== currentUserId)) {
        return res.status(400).json({
          message: 'This PAN is already registered with another account.',
        })
      }
    } catch (e) {
      console.error('PAN uniqueness check failed:', e)
    }

    // 2. Check if this PAN is already cached in pan_verifications table
    try {
      const { data: cachedPan, error: cacheError } = await supabase
        .from('pan_verifications')
        .select('*')
        .eq('pan_number', normalizedPan)
        .eq('status', 'VALID')
        .maybeSingle()

      if (!cacheError && cachedPan && (cachedPan.valid === true || cachedPan.status === 'VALID')) {
        // Link user_id if not linked yet and user is authenticated
        if (currentUserId && !cachedPan.user_id) {
          void supabase
            .from('pan_verifications')
            .update({ user_id: currentUserId, updated_at: new Date().toISOString() })
            .eq('pan_number', normalizedPan)
            .then(() => { })
        }

        return res.status(200).json({
          referenceId: cachedPan.reference_id,
          valid: true,
          status: 'VALID',
          registeredName: cachedPan.registered_name,
          nameProvided: name,
          message: 'This pan has been verified already',
          panHolderType: cachedPan.pan_holder_type,
          raw: cachedPan.raw_response || {
            pan: normalizedPan,
            type: cachedPan.pan_holder_type,
            reference_id: cachedPan.reference_id,
            name_provided: name,
            registered_name: cachedPan.registered_name,
            valid: true,
            message: 'This pan has been verified already',
          },
          cached: true,
          alreadyVerified: true,
        })
      }
    } catch (cacheLookupErr) {
      console.warn('PAN cache lookup skipped:', cacheLookupErr)
    }

    // 3. Fallback: check if the current user already verified this PAN previously
    if (currentUserId) {
      try {
        const { data: currentUserData } = await supabase
          .from('users')
          .select('pan_card_number, pan_verification_metadata')
          .eq('id', currentUserId)
          .maybeSingle()

        if (
          currentUserData?.pan_card_number === normalizedPan &&
          currentUserData?.pan_verification_metadata?.valid === true
        ) {
          const meta = currentUserData.pan_verification_metadata
          return res.status(200).json({
            referenceId: meta.referenceId || meta.reference_id,
            valid: true,
            status: 'VALID',
            registeredName: meta.registeredName || meta.registered_name,
            nameProvided: name,
            message: 'This pan has been verified already',
            panHolderType: meta.panHolderType,
            raw: meta.raw || meta,
            cached: true,
            alreadyVerified: true,
          })
        }
      } catch (userMetaErr) {
        console.warn('PAN user metadata lookup error:', userMetaErr)
      }
    }

    // 4. Cache Miss: Call Cashfree API
    const data = await verifyPanRequest(normalizedPan, name)

    // 5. Store verified result into pan_verifications table for future cache hits
    if (data?.valid === true || data?.status === 'VALID') {
      try {
        await supabase
          .from('pan_verifications')
          .upsert(
            {
              pan_number: normalizedPan,
              registered_name: data.registeredName || (data.raw as any)?.registered_name || '',
              name_provided: name,
              pan_holder_type: data.panHolderType || (data.raw as any)?.type || null,
              reference_id: data.referenceId != null ? String(data.referenceId) : null,
              status: data.status || 'VALID',
              valid: true,
              message: data.message || 'PAN verified successfully',
              raw_response: data.raw || data,
              user_id: currentUserId || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'pan_number' }
          )
      } catch (insertCacheErr) {
        // Non-blocking: log warning so verification doesn't fail if table isn't created yet
        console.warn('Could not cache verified PAN to pan_verifications:', insertCacheErr)
      }
    }

    return res.status(200).json({ ...data })
  } catch (error: any) {
    const status = error?.response?.status || 500
    const message =
      error?.response?.data?.message || error?.message || 'Failed to verify PAN'
    return res.status(status).json({
      message,
      data: error?.response?.data,
    })
  }
}

export const getPanVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { referenceId } = req.params as { referenceId?: string }
    if (!referenceId) {
      return res.status(400).json({ message: 'referenceId is required' })
    }

    const data = await getPanVerificationStatusRequest(referenceId)
    return res.status(200).json({ ...data })
  } catch (error: any) {
    const status = error?.response?.status || 500
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch PAN verification status'
    return res.status(status).json({
      message,
      data: error?.response?.data,
    })
  }
}

export const listPlans = async (_req: Request, res: Response) => {
  try {
    const plans: PublicPlan[] = await fetchPlans()
    return res.status(200).json({ plans })
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || 'Failed to fetch plans' })
  }
}

export const createOrderForPlan = async (req: Request, res: Response) => {
  try {
    const {
      plan,
      customer_id,
      customer_email,
      customer_phone,
      return_url,
      discount_amount,
      is_free,
      coupon_code,
    } = req.body

    if (customer_id !== (req as any).user?.id) return res.status(403).json({ message: 'You can only purchase a plan for your own account.' });
    if (!plan) return res.status(400).json({ message: 'plan is required' })
    if (!customer_id)
      return res.status(400).json({ message: 'customer_id is required' })
    if (!customer_phone)
      return res.status(400).json({ message: 'customer_phone is required' })

    const planId = Number(plan)
    if (Number.isNaN(planId)) {
      return res.status(400).json({ message: 'Invalid plan identifier' })
    }
    const { selected, order } = await createOrderForPlanService({
      planId,
      customer_id,
      customer_email,
      customer_phone,
      return_url,
      discount_amount,
      is_free,
      coupon_code,
    })
    return res.status(201).json({ plan: selected, order })
  } catch (error: any) {
    if (error instanceof AccessError) return res.status(error.status).json({ message: error.message });
    const status = error?.response?.status || 500
    const payload = error?.response?.data || {
      message: 'Failed to create order',
      detail: error?.message,
      hint:
        process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET
          ? undefined
          : 'Check CASHFREE_APP_ID/CASHFREE_SECRET env and restart the server.',
    }
    return res.status(status).json(payload)
  }
}

export const handleCashfreeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string
    const timestamp = req.headers['x-webhook-timestamp'] as string
    const rawBody = (req as any).rawBody
    const verified = verifyWebhookSignature(signature, timestamp, rawBody)
    if (!verified.ok) {
      return res.status(verified.status).json({ message: verified.message })
    }
    const webhookResponse = JSON.parse(rawBody)
    if (webhookResponse?.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { payment } = webhookResponse?.data
      if (payment?.payment_status === 'SUCCESS') {
        await handlePaymentSuccess(webhookResponse)
        return res.status(200).json({ message: 'Subscription updated.' })
      }
    }
    if (webhookResponse?.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
      const { payment } = webhookResponse?.data
      if (payment?.payment_status === 'USER_DROPPED') {
        await handlePaymentUserDropped(webhookResponse)
        return res.status(200).json({
          message: payment?.payment_message || 'Payment user dropped.',
        })
      }
    }
    if (webhookResponse?.type === 'PAYMENT_FAILED_WEBHOOK') {
      const { payment } = webhookResponse?.data
      await handlePaymentFailed(webhookResponse)
      return res
        .status(200)
        .json({ message: payment?.payment_message || 'Payment failed!' })
    }

    return res.status(200).json({ message: 'Webhook received successfully.' })
  } catch (error: any) {
    console.error('Error handling Cashfree webhook:', error)
    return res
      .status(500)
      .json({ message: 'Error handling webhook.', error: error.message })
  }
}

export const testCashfreeWebhook = async (_: Request, res: Response) => {
  return res.status(200).json({ message: 'Webhook configured successfully!' })
}

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const response = await pgFetchOrder(orderId);
    const orderData = response?.data || response;

    let payments: any[] = [];
    try {
      const paymentsResp = await pgFetchOrderPayments(orderId);
      payments = Array.isArray(paymentsResp?.data) ? paymentsResp.data : [];
    } catch (payErr: any) {
      console.warn('Could not fetch payments for order:', orderId, payErr?.message);
    }

    // Determine the authoritative payment status
    // Cashfree order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
    // Cashfree payment_status: 'SUCCESS' | 'PENDING' | 'USER_DROPPED' | 'CANCELLED' | 'FAILED'
    const hasSuccessfulPayment =
      orderData?.order_status === 'PAID' ||
      payments.some((p: any) => p?.payment_status === 'SUCCESS');

    let paymentStatus: string = 'NOT_ATTEMPTED';
    let latestPayment: any = null;

    if (hasSuccessfulPayment) {
      paymentStatus = 'SUCCESS';
      latestPayment =
        payments.find((p: any) => p?.payment_status === 'SUCCESS') ||
        payments[payments.length - 1] ||
        null;
    } else if (payments.length > 0) {
      latestPayment = payments[payments.length - 1];
      paymentStatus = latestPayment?.payment_status || 'PENDING';
    } else if (orderData?.order_status === 'EXPIRED') {
      paymentStatus = 'EXPIRED';
    } else if (orderData?.order_status === 'ACTIVE') {
      paymentStatus = 'NOT_ATTEMPTED';
    } else {
      paymentStatus = orderData?.order_status || 'UNKNOWN';
    }

    const isPaid = paymentStatus === 'SUCCESS';

    // Auto-reconcile payment on callback if order or payment is SUCCESS
    const transactionId = orderData?.order_tags?.transaction_id;
    if (transactionId) {
      try {
        const { data: existingPayment } = await supabase
          .from('payment_history')
          .select('transaction_status, user_id')
          .eq('transaction_id', transactionId)
          .maybeSingle();

        if (isPaid) {
          if (existingPayment?.transaction_status !== 'SUCCESS') {
            await handlePaymentSuccess({
              data: {
                payment: {
                  payment_status: 'SUCCESS',
                  payment_amount:
                    latestPayment?.payment_amount || orderData.order_amount,
                  payment_time:
                    latestPayment?.payment_time ||
                    orderData.order_created_at ||
                    new Date().toISOString(),
                  order_tags: orderData.order_tags,
                },
                customer_details: orderData.customer_details,
              },
            });
          }
        } else {
          // If NOT paid, update payment_history from PENDING to actual attempt status (USER_DROPPED, CANCELLED, FAILED)
          // NEVER overwrite an existing SUCCESS transaction!
          if (
            existingPayment &&
            existingPayment.transaction_status === 'PENDING' &&
            ['USER_DROPPED', 'CANCELLED', 'FAILED'].includes(paymentStatus)
          ) {
            await supabase
              .from('payment_history')
              .update({ transaction_status: paymentStatus })
              .eq('transaction_id', transactionId);
          }
        }
      } catch (reconError) {
        console.error('Error auto-reconciling payment in getOrder:', reconError);
      }
    }

    const result = {
      order_id: orderData?.order_id || orderId,
      order_status: orderData?.order_status,
      payment_status: paymentStatus,
      is_paid: isPaid,
      order_amount: orderData?.order_amount,
      order_currency: orderData?.order_currency,
      customer_details: orderData?.customer_details,
      order_tags: orderData?.order_tags,
      payment_message:
        latestPayment?.payment_message ||
        (isPaid
          ? 'Payment verified successfully'
          : paymentStatus === 'USER_DROPPED'
            ? 'Payment was cancelled or abandoned by user'
            : paymentStatus === 'CANCELLED'
              ? 'Payment was cancelled'
              : paymentStatus === 'FAILED'
                ? 'Payment failed'
                : paymentStatus === 'PENDING'
                  ? 'Payment is processing'
                  : 'Payment not completed'),
      payments: payments.map((p: any) => ({
        payment_id: p?.cf_payment_id,
        payment_status: p?.payment_status,
        payment_amount: p?.payment_amount,
        payment_time: p?.payment_time,
        payment_message: p?.payment_message,
      })),
    };

    return res.status(200).json(result);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: 'Failed to fetch order',
    };
    return res.status(status).json(payload);
  }
};

export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const response = await getUserSubscriptionService(userId)
    return res.status(200).json(response)
  } catch (error: any) {
    console.error('Error fetching user subscription:', error)
    return res.status(500).json({
      message: 'Failed to fetch subscription status',
      error: error.message,
    })
  }
}
