import crypto from "crypto";
import { supabase } from "../supabase";
import { createZohoInvoiceForPayment } from "./zoho-books.service";

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
  const tagCouponCode = payment?.order_tags?.coupon_code;
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

  const paymentTime = payment?.payment_time
    ? new Date(payment.payment_time)
    : new Date();
  const startDateStr = paymentTime.toISOString().split("T")[0];
  let endDateStr: string | null = null;

  const durationMonths = currentPlan?.duration_months;
  if (typeof durationMonths === "number" && durationMonths > 0) {
    const end = new Date(paymentTime);
    end.setMonth(end.getMonth() + durationMonths);
    endDateStr = end.toISOString().split("T")[0];
  }

  const updateUserPayload: any = {
    status: "active",
    plan_id: currentPlan?.plan_id || null,
    subscription_start_date: startDateStr,
    subscription_end_date: endDateStr,
  };

  const updateUserPromise = supabase
    .from("users")
    .update(updateUserPayload)
    .eq("id", customer_details?.customer_id);

  const transactionId = taggedTransactionId || crypto.randomUUID();
  const normalizedCouponCode =
    typeof tagCouponCode === "string" && tagCouponCode.trim()
      ? tagCouponCode.trim().toUpperCase()
      : null;

  const resolveCouponId = async (): Promise<number | null> => {
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

  const { data: existingPayment } = await supabase
    .from("payment_history")
    .select("transaction_id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  console.log({ existingPayment });
  const paymentUpdateBase: any = {
    transaction_status: payment?.payment_status,
    plan_id: currentPlan?.plan_id,
    user_id: customer_details?.customer_id,
    payer_email: customer_details?.customer_email,
    created_at: payment?.payment_time,
    discounted_amount:
      typeof payment?.payment_amount === "number" ? payment.payment_amount : null,
    coupon_code: normalizedCouponCode,
    coupon_applied: await resolveCouponId(),
  };

  const persistPaymentHistory = async () => {
    const op = existingPayment
      ? supabase
          .from("payment_history")
          .update(paymentUpdateBase)
          .eq("transaction_id", transactionId)
      : supabase
          .from("payment_history")
          .insert({ ...paymentUpdateBase, transaction_id: transactionId })
          .maybeSingle();

    const { error } = await op;
    if (!error) return;

    if (error?.message?.toLowerCase?.().includes("column")) {
      const fallbackBase: any = {
        transaction_status: payment?.payment_status,
        plan_id: currentPlan?.plan_id,
        user_id: customer_details?.customer_id,
        payer_email: customer_details?.customer_email,
        created_at: payment?.payment_time,
      };
      if (existingPayment) {
        await supabase
          .from("payment_history")
          .update(fallbackBase)
          .eq("transaction_id", transactionId);
      } else {
        await supabase
          .from("payment_history")
          .insert({ ...fallbackBase, transaction_id: transactionId })
          .maybeSingle();
      }
      return;
    }

    throw error;
  };

  await Promise.all([updateUserPromise, persistPaymentHistory()]);

  try {
    if (payment?.payment_status === "SUCCESS") {
      await createZohoInvoiceForPayment(transactionId);
    }
  } catch (err) {
    console.error("Failed to create Zoho invoice for payment:", err);
  }
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
