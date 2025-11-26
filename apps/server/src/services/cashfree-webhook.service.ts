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
  const taggedTransactionId = payment?.order_tags?.transaction_id as
    | string
    | undefined;
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

  console.log({ currentPlan }, "cashfree webhook");

  const updateUserPromise = supabase
    .from("users")
    .update({
      status: "active",
      plan_id: currentPlan?.plan_id || null,
    })
    .eq("id", customer_details?.customer_id);

  const transactionId = taggedTransactionId || crypto.randomUUID();

  const { data: existingPayment } = await supabase
    .from("payment_history")
    .select("transaction_id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  console.log({ existingPayment });
  const paymentHistoryPromise = existingPayment
    ? supabase
        .from("payment_history")
        .update({
          transaction_status: payment?.payment_status,
          plan_id: currentPlan?.plan_id,
          user_id: customer_details?.customer_id,
          payer_email: customer_details?.customer_email,
          created_at: payment?.payment_time,
        })
        .eq("transaction_id", transactionId)
    : supabase
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

  await Promise.all([updateUserPromise, paymentHistoryPromise]);
};

export const handlePaymentUserDropped = async (payload: any) => {
  const { customer_details } = payload?.data || {};
  await supabase
    .from("users")
    .update({ status: "payment_pending" })
    .eq("id", customer_details?.customer_id);
};

export const handlePaymentFailed = async (payload: any) => {
  const { customer_details } = payload?.data || {};
  await supabase
    .from("users")
    .update({ status: "payment_pending" })
    .eq("id", customer_details?.customer_id);
};
