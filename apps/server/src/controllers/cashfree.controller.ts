import { Request, Response } from "express";
import axios from "axios";
import { Cashfree } from "cashfree-pg";
import crypto from "crypto";
import { supabase } from "../supabase";

// Environment/config
const CF_APP_ID = process.env.CASHFREE_APP_ID;
const CF_SECRET = process.env.CASHFREE_SECRET;
const CF_ENV = (process.env.CASHFREE_ENV || "SANDBOX").toUpperCase() as
  | "SANDBOX"
  | "PRODUCTION";
const CF_API_VERSION = "2023-08-01";
const CF_VERIFICATION_CLIENT_ID =
  process.env.CASHFREE_VERIFICATION_CLIENT_ID || CF_APP_ID;
const CF_VERIFICATION_CLIENT_SECRET =
  process.env.CASHFREE_VERIFICATION_CLIENT_SECRET || CF_SECRET;
const CF_VERIFICATION_API_VERSION =
  process.env.CASHFREE_VERIFICATION_API_VERSION || "2022-09-12";

const getBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const getVerificationBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

// Initialize Cashfree (required for v>=5 SDK)
const ensureCashfreeConfigured = () => {
  if (!CF_APP_ID || !CF_SECRET) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  // Constructing instance configures the SDK internally
  const envConst =
    CF_ENV === "PRODUCTION"
      ? (Cashfree as any).PRODUCTION
      : (Cashfree as any).SANDBOX;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _cf = new (Cashfree as any)(envConst, CF_APP_ID, CF_SECRET);
};

const getVerificationHeaders = () => {
  if (!CF_VERIFICATION_CLIENT_ID || !CF_VERIFICATION_CLIENT_SECRET) {
    throw new Error(
      "Cashfree verification credentials are not configured. Set CASHFREE_VERIFICATION_CLIENT_ID and CASHFREE_VERIFICATION_CLIENT_SECRET or reuse CASHFREE_APP_ID/CASHFREE_SECRET."
    );
  }

  return {
    "x-client-id": CF_VERIFICATION_CLIENT_ID,
    "x-client-secret": CF_VERIFICATION_CLIENT_SECRET,
    "Content-Type": "application/json",
  };
};

// Helper to call PGCreateOrder compatible with different SDK signatures
const pgCreateOrder = async (request: any) => {
  // Prefer SDK if available, otherwise REST fallback
  try {
    const anyCF = Cashfree as any;
    if (typeof anyCF.PGCreateOrder === "function") {
      ensureCashfreeConfigured();
      return await anyCF.PGCreateOrder(request);
    }
    // If SDK method missing, fall through to REST
    throw new Error("SDK PGCreateOrder missing; using REST fallback");
  } catch {
    const url = `${getBaseUrl()}/orders`;
    const headers = {
      "x-api-version": CF_API_VERSION,
      "x-client-id": CF_APP_ID as string,
      "x-client-secret": CF_SECRET as string,
      "Content-Type": "application/json",
    };
    const resp = await axios.post(url, request, { headers });
    return { data: resp.data };
  }
};

const pgFetchOrder = async (orderId: string) => {
  try {
    const anyCF = Cashfree as any;
    if (typeof anyCF.PGFetchOrder === "function") {
      ensureCashfreeConfigured();
      return await anyCF.PGFetchOrder(orderId);
    }
    throw new Error("SDK PGFetchOrder missing; using REST fallback");
  } catch {
    const url = `${getBaseUrl()}/orders/${orderId}`;
    const headers = {
      "x-api-version": CF_API_VERSION,
      "x-client-id": CF_APP_ID as string,
      "x-client-secret": CF_SECRET as string,
    };
    const resp = await axios.get(url, { headers });
    return { data: resp.data };
  }
};

type PublicPlan = {
  code: string; // legacy: plan_id as string
  name: string;
  amount: number;
  currency: string;
  plan_code?: string; // new canonical code: core | core_annual | research_hub
  tier?: number; // 1 < 2 < 3
};

const normalizePanResponse = (data: any = {}) => ({
  referenceId: data.reference_id ?? data.referenceId,
  valid: data.valid ?? false,
  status:
    data.valid === true
      ? "VALID"
      : data.valid === false
        ? "INVALID"
        : "PENDING",
  registeredName: data.registered_name,
  nameProvided: data.name_provided,
  nameMatchScore: data.name_match_score,
  nameMatchResult: data.name_match_result,
  message: data.message,
  fatherName: data.father_name,
  panHolderType: data.type,
  raw: data,
});

export const verifyPan = async (req: Request, res: Response) => {
  try {
    const { pan, name } = req.body as { pan?: string; name?: string };

    if (!pan || !name) {
      return res
        .status(400)
        .json({ message: "pan and name are required for verification" });
    }

    const payload = {
      pan: pan.trim().toUpperCase(),
      name: name.trim(),
    };

    const url = `${getVerificationBaseUrl()}/pan`;
    const headers = getVerificationHeaders();
    const response = await axios.post(url, payload, { headers });
    return res.status(200).json({
      ...normalizePanResponse(response?.data),
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to verify PAN";
    return res.status(status).json({
      message,
      data: error?.response?.data,
    });
  }
};

export const getPanVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { referenceId } = req.params as { referenceId?: string };
    if (!referenceId) {
      return res.status(400).json({ message: "referenceId is required" });
    }

    const url = `${getVerificationBaseUrl()}/pan/${referenceId}`;
    const headers = getVerificationHeaders();
    const response = await axios.get(url, { headers });
    return res.status(200).json({
      ...normalizePanResponse(response?.data),
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch PAN verification status";
    return res.status(status).json({
      message,
      data: error?.response?.data,
    });
  }
};

export const listPlans = async (_req: Request, res: Response) => {
  try {
    // Try to fetch canonical plans; if none found, fallback to all
    let plansRows: any[] | null = null;
    let qError: any = null;

    const { data: filtered, error: filteredErr } = await supabase
      .from("membership_plans")
      .select("plan_id, plan_name, price_amount, currency, plan_code, tier")
      .in("plan_code", ["core", "core_annual", "research_hub"]);
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
      return res.status(500).json({ message: qError.message });
    }

    const plans: PublicPlan[] = (plansRows || [])
      .filter((p: any) => typeof p?.price_amount === "number" && p.price_amount >= 0)
      .map((p: any) => ({
        code: String(p.plan_id),
        name: p.plan_name,
        amount: p.price_amount,
        currency: p.currency || "INR",
        plan_code: p.plan_code,
        tier: p.tier,
      }));

    return res.status(200).json({ plans });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Failed to fetch plans" });
  }
};

export const createOrderForPlan = async (req: Request, res: Response) => {
  try {
    const {
      plan,
      customer_id,
      customer_email,
      customer_phone,
      return_url,
      metadata,
      discount_amount
    } = req.body;


    if (!plan) return res.status(400).json({ message: "plan is required" });
    if (!customer_id)
      return res.status(400).json({ message: "customer_id is required" });
    if (!customer_phone)
      return res.status(400).json({ message: "customer_phone is required" });

    // Resolve plan from DB; treat provided plan as plan_id (string or number)
    const planId = Number(plan);
    if (Number.isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan identifier" });
    }

    const { data: planRows, error } = await supabase
      .from("membership_plans")
      .select("plan_id, plan_name, price_amount, currency, tier")
      .eq("plan_id", planId)
      .limit(1);

    if (error) return res.status(500).json({ message: error.message });
    const planRow = planRows?.[0];
    if (!planRow) return res.status(404).json({ message: "Plan not found" });

    const selected: PublicPlan = {
      code: String(planRow.plan_id),
      name: planRow.plan_name,
      amount: discount_amount,
      currency: planRow.currency || "INR",
      tier: planRow.tier,
    };
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/$/, "");
    let returnUrl =
      return_url || `${frontendUrl}/payment/success?order_id=${orderId}`;

    const request = {
      order_id: orderId,
      order_amount: selected.amount,
      order_currency: selected.currency,
      order_note: selected.name,
      customer_details: {
        customer_id,
        customer_email: customer_email || undefined,
        customer_phone,
      },
      order_meta: {
        return_url: returnUrl,
      },
    };


    const response = await pgCreateOrder(request);
    await supabase.from("payment_history").upsert({
      payer_email: customer_email || null,
      transaction_status: "PENDING",
      user_id: customer_id,
      plan_id: planRow.plan_id,
    });
    return res
      .status(201)
      .json({ plan: selected, order: response?.data || response });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to create order",
      detail: error?.message,
      hint:
        !CF_APP_ID || !CF_SECRET
          ? "Check CASHFREE_APP_ID/CASHFREE_SECRET env and restart the server."
          : undefined,
    };
    return res.status(status).json(payload);
  }
};

export const handleCashfreeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const rawBody = (req as any).rawBody;

    if (!signature || !timestamp || !rawBody) {
      return res
        .status(400)
        .json({ message: "Missing webhook signature or timestamp." });
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
      return res.status(401).json({ message: "Invalid webhook signature." });
    }

    const webhookResponse = JSON.parse(rawBody);
    if (webhookResponse?.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { payment, customer_details } = webhookResponse?.data;
      if (payment?.payment_status === "SUCCESS") {
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
        // Fallback by amount (not reliable with coupons)
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
            isPremium: true,
            status: "active",
            plan_code: currentPlan?.plan_code || null,
          })
          .eq("id", customer_details?.customer_id);

        const insertPaymentHistoryPromise = supabase
          .from("payment_history")
          .insert({
            transaction_status: payment?.payment_status,
            plan_id: currentPlan?.plan_id,
            user_id: customer_details?.customer_id,
            payer_email: customer_details?.customer_email,
            transaction_id: crypto.randomUUID(),
            created_at: payment?.payment_time,
          })
          .maybeSingle();

        const [_, paymentHistoryResult] = await Promise.all([
          updateUserPromise,
          insertPaymentHistoryPromise,
        ]);

        await supabase.from("subscriptions").upsert({
          membership_id: currentPlan?.plan_id,
          name: currentPlan?.plan_name,
          start_date: payment?.payment_time,
          expire_next_renewal: currentPlan?.duration_months
            ? new Date(
                new Date(payment?.payment_time).getTime() +
                  currentPlan.duration_months * 30 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
          amount: payment?.payment_amount,
          //@ts-ignore
          transaction_id: paymentHistoryResult?.transaction_id,
          user_id: customer_details?.customer_id,
          plan_code: currentPlan?.plan_code || null,
        });
        return res.status(200).json({ message: "Subscription updated." });
      }
    }
    if (webhookResponse?.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
      const { payment, customer_details } = webhookResponse?.data;
      if (payment?.payment_status === "USER_DROPPED") {
        supabase
          .from("users")
          .update({ status: "pending" })
          .eq("id", customer_details?.customer_id);
        return res.status(200).json({
          message: payment?.payment_message || "Payment user dropped.",
        });
      }
    }
    if (webhookResponse?.type === "PAYMENT_FAILED_WEBHOOK") {
      const { payment, customer_details } = webhookResponse?.data;
      supabase
        .from("users")
        .update({ status: "pending" })
        .eq("id", customer_details?.customer_id);
      return res
        .status(200)
        .json({ message: payment?.payment_message || "Payment failed!" });
    }

    return res.status(200).json({ message: "Webhook received successfully." });
  } catch (error: any) {
    console.error("Error handling Cashfree webhook:", error);
    return res
      .status(500)
      .json({ message: "Error handling webhook.", error: error.message });
  }
};

export const testCashfreeWebhook = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "Webhook configured successfully!" });
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const response = await pgFetchOrder(orderId);
    return res.status(200).json(response?.data || response);
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to fetch order",
    };
    return res.status(status).json(payload);
  }
};

export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch user subscription data from the API
    const [userResult, subscriptionResult] = await Promise.all([
      supabase
        .from("users")
        .select("isPremium, plan_code")
        .eq("id", userId)
        .single(),
      supabase
        .from("subscriptions")
        .select(
          `
          start_date,
          expire_next_renewal,
          amount,
          transaction_id,
          membership_id,
          created_at,
          membership_plans(plan_code, tier, plan_name)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (userResult.error) {
      return res.status(500).json({ message: userResult.error.message });
    }

    const user = userResult.data;
    const subscription = !subscriptionResult?.data
      ? null
      : ({
          ...subscriptionResult.data,
          plan_code:
            // @ts-ignore
            subscriptionResult?.data?.membership_plans?.plan_code || null,
          plan_name:
            // @ts-ignore
            subscriptionResult?.data?.membership_plans?.plan_name || null,
          tier:
            // @ts-ignore
            subscriptionResult?.data?.membership_plans?.tier || null,
        } as any);

    // Determine current plan code
    const currentPlan: string | null =
      subscription?.plan_code || user?.plan_code || null;

    const response = {
      isPremium: Boolean(user?.plan_code) || Boolean(user?.isPremium),
      currentPlan,
      subscription: subscription
        ? {
            name: subscription.plan_name,
            startDate: subscription.start_date,
            expireNextRenewal: subscription.expire_next_renewal,
            amount: subscription.amount,
            transactionId: subscription.transaction_id,
            plan_code: subscription.plan_code,
            tier: subscription.tier,
          }
        : null,
      lastPayment: subscription
        ? {
            amount: subscription.amount,
            status: "completed", // Assume status from new API
            email: null, // Adjust based on new API
            date: subscription.created_at,
            plan_code: subscription.plan_code,
          }
        : null,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching user subscription:", error);
    return res.status(500).json({
      message: "Failed to fetch subscription status",
      error: error.message,
    });
  }
};
