import crypto from "crypto";
import { supabase } from "../supabase";
import { pgCreateOrder } from "./cashfree-pg.service";
import { getFrontendBaseUrl } from "./cashfree-config";
import { incrementCouponUsage } from "../controllers/coupon.controller";
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
  const transactionId = crypto.randomUUID();

  const selected: PublicPlan = {
    code: String(planRow.plan_id),
    name: planRow.plan_name,
    amount: params.discount_amount,
    currency: planRow.currency || "INR",
    tier: planRow.tier,
    plan_code: planRow.plan_code,
  };

  // Handle free tier or zero-amount subscription
  if (params.is_free || params.discount_amount === 0) {
    const startDate = new Date();
    const startDateStr = startDate.toISOString().split("T")[0];
    let endDateStr: string | null = null;

    const durationMonths = (planRow as any).duration_months;
    if (typeof durationMonths === "number" && durationMonths > 0) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + durationMonths);
      endDateStr = end.toISOString().split("T")[0];
    }

    // For free tier, mark the user as active on this plan in users table
    await supabase
      .from("users")
      .update({
        status: "active",
        plan_id: planRow.plan_id,
        plan_code: planRow.plan_code || null,
        subscription_start_date: startDateStr,
        subscription_end_date: endDateStr,
      })
      .eq("id", params.customer_id);

    // Record in payment history as FREE or COUPON_APPLIED
    await supabase.from("payment_history").insert({
      payer_email: params.customer_email || null,
      transaction_status: params.coupon_code ? "COUPON_APPLIED" : "FREE",
      user_id: params.customer_id,
      plan_id: planRow.plan_id,
      transaction_id: transactionId,
      created_at: startDate.toISOString(),
    });

    // Increment coupon usage if coupon was used
    if (params.coupon_code) {
      try {
        await incrementCouponUsage(params.coupon_code);
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
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
  await supabase.from("payment_history").upsert({
    payer_email: params.customer_email || null,
    transaction_status: "PENDING",
    user_id: params.customer_id,
    plan_id: planRow.plan_id,
    transaction_id: transactionId,
    created_at: new Date().toISOString(),
  });

  return { selected, order: response?.data || response };
};
