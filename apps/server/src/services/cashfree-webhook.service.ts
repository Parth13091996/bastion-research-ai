import crypto from "crypto";
import { supabase } from "../supabase";

export const verifyWebhookSignature = (
  signature: string | undefined,
  timestamp: string | undefined,
  rawBody: string | undefined
) => {
  if (!signature || !timestamp || !rawBody) {
    return {
      ok: false,
      status: 400,
      message: "Missing webhook signature or timestamp.",
    } as const;
  }
  const secret = process.env.CASHFREE_SECRET;
  if (!secret) {
    throw new Error("CASHFREE_SECRET is not configured.");
  }
  const dataToVerify = `${timestamp}${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToVerify)
    .digest("base64");
  if (signature !== expectedSignature) {
    return {
      ok: false,
      status: 401,
      message: "Invalid webhook signature.",
    } as const;
  }
  return { ok: true } as const;
};

export const handlePaymentSuccess = async (payload: any) => {
  const { payment, customer_details } = payload?.data || {};
  const tagPlanId = payment?.order_tags?.plan_id;
  const tagPlanCode = payment?.order_tags?.plan_code;
  let currentPlan: any = null;
  if (tagPlanId || tagPlanCode) {
    const { data } = await supabase
      .from("membership_plans")
      .select(
        "plan_id, plan_name, price_amount, currency, duration_months, plan_code, tier"
      )
      .or(
        [
          tagPlanId ? `plan_id.eq.${tagPlanId}` : "",
          tagPlanCode ? `plan_code.eq.${tagPlanCode}` : "",
        ]
          .filter(Boolean)
          .join(",")
      )
      .limit(1);
    currentPlan = data?.[0] || null;
  }
  if (!currentPlan) {
    const { data: plans } = await supabase
      .from("membership_plans")
      .select(
        "plan_id, plan_name, price_amount, currency, duration_months, plan_code, tier"
      );
    currentPlan = plans?.find(
      (plan) => plan.price_amount === payment?.payment_amount
    );
  }

  const updateUserPromise = supabase
    .from("users")
    .update({
      status: "active",
      plan_code: currentPlan?.plan_code || null,
    })
    .eq("id", customer_details?.customer_id);

  // Create a transaction id we can reuse across tables
  const transactionId = crypto.randomUUID();

  const insertPaymentHistoryPromise = supabase
    .from("payment_history")
    .insert({
      transaction_status: payment?.payment_status,
      plan_id: currentPlan?.plan_id,
      user_id: customer_details?.customer_id,
      payer_email: customer_details?.customer_email,
      transaction_id: transactionId,
      created_at: payment?.payment_time,
    })
    .maybeSingle();

  await Promise.all([updateUserPromise, insertPaymentHistoryPromise]);

  // Prepare dates as YYYY-MM-DD strings for date columns
  const startDate = payment?.payment_time
    ? new Date(payment.payment_time)
    : new Date();
  const expireDate = currentPlan?.duration_months
    ? new Date(
        startDate.getTime() +
          currentPlan.duration_months * 30 * 24 * 60 * 60 * 1000
      )
    : null;

  await supabase.from("subscriptions").insert({
    membership_id: currentPlan?.plan_id,
    start_date: startDate.toISOString().slice(0, 10),
    expire_next_renewal: expireDate
      ? expireDate.toISOString().slice(0, 10)
      : null,
    amount: payment?.payment_amount,
    transaction_id: transactionId,
    user_id: customer_details?.customer_id,
  });
};

export const handlePaymentUserDropped = async (payload: any) => {
  const { customer_details } = payload?.data || {};
  await supabase
    .from("users")
    .update({ status: "pending" })
    .eq("id", customer_details?.customer_id);
};

export const handlePaymentFailed = async (payload: any) => {
  const { customer_details } = payload?.data || {};
  await supabase
    .from("users")
    .update({ status: "pending" })
    .eq("id", customer_details?.customer_id);
};
