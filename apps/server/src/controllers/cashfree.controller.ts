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

const getBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

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
  code: string;
  name: string;
  amount: number;
  currency: string;
};

export const listPlans = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("plan_id, plan_name, price_amount, currency");

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const plans: PublicPlan[] = (data || [])
      .filter(
        (p: any) => typeof p?.price_amount === "number" && p.price_amount >= 0
      )
      .map((p: any) => ({
        code: String(p.plan_id),
        name: p.plan_name,
        amount: p.price_amount,
        currency: p.currency || "INR",
      }));

    return res.status(200).json({ plans });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err?.message || "Failed to fetch plans" });
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
      source,
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
      .select("plan_id, plan_name, price_amount, currency")
      .eq("plan_id", planId)
      .limit(1);

    if (error) return res.status(500).json({ message: error.message });
    const planRow = planRows?.[0];
    if (!planRow) return res.status(404).json({ message: "Plan not found" });

    const selected: PublicPlan = {
      code: String(planRow.plan_id),
      name: planRow.plan_name,
      amount: planRow.price_amount,
      currency: planRow.currency || "INR",
    };
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/$/, "");
    // Build return URL with optional context so client can branch behavior
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
    console.log({webhookResponse})
    if (webhookResponse?.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { payment, order, customer_details } = webhookResponse?.data;
      if (payment?.payment_status === "SUCCESS") {
        const [response, { data: plans }] = await Promise.all([
          pgFetchOrder(order.order_id),
          supabase
            .from("membership_plans")
            .select(
              "plan_id, plan_name, price_amount, currency, duration_months"
            ),
        ]);
        const userId = response?.customer_details?.customer_id;
        const currentPlan = plans?.find(
          (plan) => plan.price_amount === payment?.payment_amount
        );
        await Promise.all([
          supabase.from("users").update({ isPremium: true }).eq("id", userId),
          supabase.from("subscriptions").upsert({
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
            transaction_id: payment?.payment_amount,
            user_id: userId,
          }),
          supabase.from("payment_history").upsert({
            amount: payment?.payment_amount,
            transaction_status: payment?.payment_status,
            plan_id: currentPlan?.plan_id,
            user_id: userId,
            payer_email: customer_details?.customer_email,
          }),
        ]);

        res.status(200).json({ message: "Subscription updated." });
      }
    }
    if (webhookResponse?.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
      const { payment } = webhookResponse?.data;
      if (payment?.payment_status === "USER_DROPPED") {
        res.status(200).json({
          message: payment?.payment_message || "Payment user dropped.",
        });
      }
    }
    if (webhookResponse?.type === "PAYMENT_FAILED_WEBHOOK") {
      const { error_details } = webhookResponse?.data;
      res.status(200).json({ message: "Webhook received successfully." });
    }

    res.status(200).json({ message: "Webhook received successfully." });
  } catch (error: any) {
    console.error("Error handling Cashfree webhook:", error);
    res
      .status(500)
      .json({ message: "Error handling webhook.", error: error.message });
  }
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

    // Get user's current subscription and payment status
    const [userResult, subscriptionResult, paymentResult] = await Promise.all([
      supabase
        .from("users")
        .select("isPremium")
        .eq("id", userId)
        .single(),
      supabase
        .from("subscriptions")
        .select(`
          membership_id,
          name,
          start_date,
          expire_next_renewal,
          amount,
          transaction_id,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("payment_history")
        .select(`
          amount,
          transaction_status,
          plan_id,
          payer_email,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (userResult.error) {
      return res.status(500).json({ message: userResult.error.message });
    }

    const user = userResult.data;
    const subscription = subscriptionResult.data;
    const payment = paymentResult.data;

    // Determine current plan based on subscription or default to free
    let currentPlan = "free";
    if (subscription && user?.isPremium) {
      // Map plan based on membership_id or amount
      if (subscription.membership_id === 2) {
        currentPlan = "12m"; // Annual Plan
      } else if (subscription.membership_id === 4) {
        currentPlan = "3m"; // Bastion Research Core
      } else if (subscription.membership_id === 5) {
        currentPlan = "free"; // Freemium
      }
    }

    const response = {
      isPremium: user?.isPremium || false,
      currentPlan,
      subscription: subscription ? {
        name: subscription.name,
        startDate: subscription.start_date,
        expireDate: subscription.expire_next_renewal,
        amount: subscription.amount,
        transactionId: subscription.transaction_id,
      } : null,
      lastPayment: payment ? {
        amount: payment.amount,
        status: payment.transaction_status,
        planId: payment.plan_id,
        email: payment.payer_email,
        date: payment.created_at,
      } : null,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching user subscription:", error);
    return res.status(500).json({ 
      message: "Failed to fetch subscription status",
      error: error.message 
    });
  }
};
