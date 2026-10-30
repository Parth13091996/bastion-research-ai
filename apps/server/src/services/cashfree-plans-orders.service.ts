import {checkoutAmount,reserveIntroCheckout,introOrderId} from './core-checkout.service';
import {AccessError,addMonths,indiaToday,calendarDate,approvedCorePlan} from './premium-access.service';
import crypto from "crypto";
import { supabase } from "../supabase";
import { pgCreateOrder } from "./cashfree-pg.service";
import { getFrontendBaseUrl } from "./cashfree-config";
import { incrementCouponUsage } from "../controllers/coupon.controller";
import { syncOnboardedUserToMailchimp } from "./mailchimpAudience.service";
export type PublicPlan = {
  code: string;
  name: string;
  amount: number;
  currency: string;
  plan_code?: string;
  tier?: number;
};

export const fetchPlans = async (): Promise<PublicPlan[]> => {
  let plansRows: any[] | null = null;
  let qError: any = null;

  const { data: filtered, error: filteredErr } = await supabase
    .from("membership_plans")
    .select("plan_id, plan_name, price_amount, currency, plan_code, tier")
    .in("plan_code", ["freemium", "core", "core_annual", "research_hub"]);
  if (!filteredErr && filtered && filtered.length > 0) {
    plansRows = filtered;
  } else {
    const { data: allData, error: allErr } = await supabase
      .from("membership_plans")
      .select("plan_id, plan_name, price_amount, currency, plan_code, tier")
      .order("plan_id", { ascending: true });
    plansRows = allData || [];
    qError = allErr;
  }

  if (qError) {
    throw new Error(qError.message);
  }

  return (plansRows || [])
    .filter(
      (p: any) => typeof p?.price_amount === "number" && p.price_amount >= 0
    )
    .map((p: any) => ({
      code: String(p.plan_id),
      name: p.plan_name,
      amount: p.price_amount,
      currency: p.currency || "INR",
      plan_code: p.plan_code,
      tier: p.tier,
    }));
};

export const resolvePlanById = async (planId: number) => {
  const { data: planRows, error } = await supabase
    .from("membership_plans")
    .select(
      "plan_id, plan_name, price_amount, currency, tier, plan_code, duration_months"
    )
    .eq("plan_id", planId)
    .limit(1);
  if (error) throw new Error(error.message);
  const planRow = planRows?.[0];
  if (!planRow) throw new Error("Plan not found");
  return planRow;
};

export const createOrderForPlanService = async (params: {
  planId: number;
  customer_id: string;
  customer_email?: string;
  customer_phone: string;
  return_url?: string;
  discount_amount: number;
  is_free?: boolean;
  coupon_code?: string;
}) => {
  const planRow = await resolvePlanById(params.planId);
  const {data:customer,error:customerError}=await supabase.from('users').select('*').eq('id',params.customer_id).single();
  if(customerError||!customer)throw new AccessError('Customer not found',404);
  if(['inactive','suspended','blocked','disabled'].includes(customer.status))throw new AccessError('Account is not active');
  params.customer_email=customer.email;params.customer_phone=customer.phone;
  // Ignore client-supplied amount and is_free: the database determines the price.
  params.discount_amount=await checkoutAmount(planRow,customer,params.coupon_code);
  params.is_free=params.discount_amount===0;
  const reservation=await reserveIntroCheckout(params.customer_id,planRow,params.discount_amount,params.customer_email);
  const transactionId = reservation?.transactionId || crypto.randomUUID();
  const normalizedCouponCode =
    typeof params.coupon_code === "string" && params.coupon_code.trim()
      ? params.coupon_code.trim().toUpperCase()
      : null;

  const couponIdForCode = async (): Promise<number | null> => {
    if (!normalizedCouponCode) return null;
    const { data, error } = await supabase
      .from("coupons")
      .select("coupon_id")
      .eq("coupon_code", normalizedCouponCode)
      .maybeSingle();
    if (error) return null;
    return typeof (data as any)?.coupon_id === "number"
      ? (data as any).coupon_id
      : null;
  };

  const selected: PublicPlan = {
    code: String(planRow.plan_id),
    name: planRow.plan_name,
    amount: params.discount_amount,
    currency: planRow.currency || "INR",
    tier: planRow.tier,
    plan_code: planRow.plan_code,
  };

  if(reservation?.existingOrder)return {selected:{...selected,amount:Number(reservation.existingOrder.order_amount)},order:reservation.existingOrder};
  // Handle free tier or zero-amount subscription
  if (params.is_free || params.discount_amount === 0) {
    const startDate = new Date();
    const startDateStr = indiaToday(startDate);
    let endDateStr: string | null = null;

    const durationMonths = (planRow as any).duration_months;
    if (typeof durationMonths === "number" && durationMonths > 0) {
      endDateStr = addMonths(startDateStr,durationMonths);
    }

    // For free tier, mark the user as active on this plan in users table
    const {error:activationError}=await supabase
      .from("users")
      .update({
        status: ['admin','employee'].includes(customer.role)?'active':planRow.plan_code==='freemium'?'free':'active',
        role: ['admin','employee'].includes(customer.role)?customer.role:planRow.plan_code==='freemium'?'free_subscriber':'core_subscriber',
        plan_id: planRow.plan_id,
        subscription_start_date: startDateStr,
        subscription_end_date: endDateStr,
      })
      .eq("id", params.customer_id);
    if(activationError)throw activationError;
    void syncOnboardedUserToMailchimp({
      email: params.customer_email,
      phone: params.customer_phone,
      plan: planRow,
    }).catch((e) => console.error("Mailchimp free plan sync failed", e));

    // Record in payment history as FREE or COUPON_APPLIED
    const freePaymentBase: any = {
      payer_email: params.customer_email || null,
      transaction_status: "SUCCESS",
      user_id: params.customer_id,
      plan_id: planRow.plan_id,
      transaction_id: transactionId,
      created_at: startDate.toISOString(),
      discounted_amount: 0,
      coupon_code: normalizedCouponCode,
      coupon_applied: await couponIdForCode(),
    };

    const { error: freeInsertErr } = reservation
      ? await supabase.from('payment_history').update(freePaymentBase).eq('transaction_id',transactionId)
      : await supabase.from('payment_history').insert(freePaymentBase);
    if (freeInsertErr?.message?.toLowerCase?.().includes("column")) {
      const fallback= {
        payer_email: params.customer_email || null,
        transaction_status: "SUCCESS",
        user_id: params.customer_id,
        plan_id: planRow.plan_id,
        transaction_id: transactionId,
        created_at: startDate.toISOString(),
      };
      const {error}=reservation?await supabase.from('payment_history').update(fallback).eq('transaction_id',transactionId):await supabase.from('payment_history').insert(fallback);
      if(error)throw error;
    }

    if(freeInsertErr && !freeInsertErr.message?.toLowerCase().includes("column"))throw freeInsertErr;
    // Increment coupon usage if coupon was used
    if (normalizedCouponCode) {
      try {
        await incrementCouponUsage(normalizedCouponCode);
      } catch (e: any) {
        console.error("Failed to increment coupon usage:", e);
        // Do not fail the request if coupon increment fails
      }
    }

    return {
      selected,
      order: {
        order_id: `free_${Date.now()}`,
        status: "FREE_TIER",
        message: "Free tier subscription activated",
      },
    };
  }

  // Normal paid flow
  const orderId = reservation ? introOrderId(transactionId,reservation.createdAt) : `order_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  const frontendUrl = getFrontendBaseUrl();
  const returnUrl =
    params.return_url || `${frontendUrl}/payment/success?order_id=${orderId}`;

  const request = {
    order_id: orderId,
    order_amount: selected.amount,
    order_currency: selected.currency,
    order_note: selected.name,
    // Help webhooks/reconciliation identify the selected plan deterministically
    order_tags: {
      plan_id: String(planRow.plan_id),
      plan_code: String(planRow.plan_code || ""),
      transaction_id: transactionId,
      coupon_code: normalizedCouponCode || "",
      // Fix the renewal window at checkout; webhook retries must not add years twice.
      renewal_from: planRow.plan_code==='core_annual' && ['core_subscriber','admin','employee'].includes(customer.role) && [2,3].includes(Number(customer.plan_id)) && (calendarDate(customer.subscription_end_date)||'')>=indiaToday() ? calendarDate(customer.subscription_end_date)! : '',
      subscription_start: calendarDate(customer.subscription_start_date)||'',
    },
    customer_details: {
      customer_id: params.customer_id,
      customer_email: params.customer_email || undefined,
      customer_phone: params.customer_phone,
    },
    order_meta: {
      return_url: returnUrl,
    },
  };

  const response = await pgCreateOrder(request);
  const pendingPaymentBase: any = {
    payer_email: params.customer_email || null,
    transaction_status: "PENDING",
    user_id: params.customer_id,
    plan_id: planRow.plan_id,
    transaction_id: transactionId,
    created_at: reservation?.createdAt || new Date().toISOString(),
    discounted_amount: selected.amount,
    coupon_code: normalizedCouponCode,
    coupon_applied: await couponIdForCode(),
  };

  const { error: pendingUpsertErr } = await supabase
    .from("payment_history")
    .upsert(pendingPaymentBase);
  if (pendingUpsertErr?.message?.toLowerCase?.().includes("column")) {
    await supabase.from("payment_history").upsert({
      payer_email: params.customer_email || null,
      transaction_status: "PENDING",
      user_id: params.customer_id,
      plan_id: planRow.plan_id,
      transaction_id: transactionId,
      created_at: reservation?.createdAt || new Date().toISOString(),
    });
  }

  if(pendingUpsertErr && !pendingUpsertErr.message?.toLowerCase().includes("column"))throw pendingUpsertErr;
  return { selected, order: response?.data || response };
};
