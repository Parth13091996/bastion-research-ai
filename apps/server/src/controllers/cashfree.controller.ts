import { Request, Response } from "express";
import axios from "axios";
import { Cashfree } from "cashfree-pg";
import { createUserAfterOnboarding } from "./auth.controller";
import { supabase } from "../config/supabase";
import crypto from "crypto";

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

const PLANS = {
  "3m": {
    code: "3m",
    name: "3 Months Plan (lifetime availability)",
    amount: Number(process.env.CASHFREE_PLAN_3M_AMOUNT || 1),
    currency: "INR",
  },
  "12m": {
    code: "12m",
    name: "12 Months Plan",
    amount: Number(process.env.CASHFREE_PLAN_12M_AMOUNT || 2),
    currency: "INR",
  },
} as const;

export const listPlans = async (_req: Request, res: Response) => {
  return res.status(200).json({ plans: Object.values(PLANS) });
};

export const createOrderForPlan = async (req: Request, res: Response) => {
  try {
    const { plan, customer_id, customer_email, customer_phone } =
      req.body;
    if (!plan || !(plan in PLANS))
      return res.status(400).json({ message: "Invalid plan. Use 3m or 12m." });
    if (!customer_id)
      return res.status(400).json({ message: "customer_id is required" });
    if (!customer_phone)
      return res.status(400).json({ message: "customer_phone is required" });

    const selected = PLANS[plan as "3m" | "12m"];
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const returnUrl =
      process.env.CASHFREE_RETURN_URL ||
      "https://www.cashfree.com/devstudio/thankyou?order_id={order_id}";

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

    // Signature is valid, process the event
    const event = JSON.parse(rawBody);
    // We no longer depend on onboarding_sessions here. If required,
    // client will finalize onboarding after payment success.

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
