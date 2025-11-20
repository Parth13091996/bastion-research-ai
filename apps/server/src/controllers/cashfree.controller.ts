import { Request, Response } from "express";
import {
  createOrderForPlanService,
  fetchPlans,
  PublicPlan,
} from "../services/cashfree-plans-orders.service";
import { getUserSubscriptionService } from "../services/cashfree-subscription.service";
import {
  getPanVerificationStatusRequest,
  verifyPanRequest,
} from "../services/cashfree-verify.service";
import {
  handlePaymentFailed,
  handlePaymentSuccess,
  handlePaymentUserDropped,
  verifyWebhookSignature,
} from "../services/cashfree-webhook.service";
import { pgFetchOrder } from "../services/cashfree-pg.service";
import { supabase } from "../supabase";

export const verifyPan = async (req: Request, res: Response) => {
  try {
    const { pan, name } = req.body as { pan?: string; name?: string };
    if (!pan || !name) {
      return res
        .status(400)
        .json({ message: "pan and name are required for verification" });
    }

    const data = await verifyPanRequest(pan, name);
    return res.status(200).json({ ...data });
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

    const data = await getPanVerificationStatusRequest(referenceId);
    return res.status(200).json({ ...data });
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
    const plans: PublicPlan[] = await fetchPlans();
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
      metadata,
      discount_amount,
      is_free,
      coupon_code,
    } = req.body;

    if (!plan) return res.status(400).json({ message: "plan is required" });
    if (!customer_id)
      return res.status(400).json({ message: "customer_id is required" });
    if (!customer_phone)
      return res.status(400).json({ message: "customer_phone is required" });

    const planId = Number(plan);
    if (Number.isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan identifier" });
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
    });
    return res.status(201).json({ plan: selected, order });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || {
      message: "Failed to create order",
      detail: error?.message,
      hint:
        process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET
          ? undefined
          : "Check CASHFREE_APP_ID/CASHFREE_SECRET env and restart the server.",
    };
    return res.status(status).json(payload);
  }
};

export const handleCashfreeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const rawBody = (req as any).rawBody;
    const verified = verifyWebhookSignature(signature, timestamp, rawBody);
    if (!verified.ok) {
      return res.status(verified.status).json({ message: verified.message });
    }
    const webhookResponse = JSON.parse(rawBody);
    console.log(webhookResponse, "payment webhooooook====");
    if (webhookResponse?.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { payment } = webhookResponse?.data;
      if (payment?.payment_status === "SUCCESS") {
        await handlePaymentSuccess(webhookResponse);
        return res.status(200).json({ message: "Subscription updated." });
      }
    }
    if (webhookResponse?.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
      const { payment } = webhookResponse?.data;
      if (payment?.payment_status === "USER_DROPPED") {
        await handlePaymentUserDropped(webhookResponse);
        return res.status(200).json({
          message: payment?.payment_message || "Payment user dropped.",
        });
      }
    }
    if (webhookResponse?.type === "PAYMENT_FAILED_WEBHOOK") {
      const { payment } = webhookResponse?.data;
      await handlePaymentFailed(webhookResponse);
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

    const response = await getUserSubscriptionService(userId);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching user subscription:", error);
    return res.status(500).json({
      message: "Failed to fetch subscription status",
      error: error.message,
    });
  }
};

// Reconcile an order by fetching status from Cashfree and creating subscription if missing.
// This is useful when webhooks are delayed or missed.
export const reconcileOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params as { orderId: string };
    if (!orderId)
      return res.status(400).json({ message: "orderId is required" });

    const orderResp = await pgFetchOrder(orderId);
    const order = (orderResp as any)?.data || orderResp;
    const status = order?.order_status || order?.status;
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(status).toUpperCase() !== "PAID") {
      return res
        .status(409)
        .json({ message: `Order is not paid (status: ${status})` });
    }

    // Resolve plan and user from order
    const customer =
      order?.customer_details || order?.customer_details?.customer_id
        ? order?.customer_details
        : order?.payment_sessions?.[0]?.customer_details;
    const userId: string | undefined = customer?.customer_id;
    if (!userId)
      return res.status(400).json({ message: "Missing customer_id on order" });

    const tagPlanId = order?.order_tags?.plan_id;
    const tagPlanCode = order?.order_tags?.plan_code;
    const taggedTransactionId = order?.order_tags?.transaction_id as
      | string
      | undefined;

    // Fetch plan row
    let planRow: any = null;
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
      planRow = data?.[0] || null;
    }
    if (!planRow) {
      const paidAmount = Number(order?.order_amount);
      const { data: plans } = await supabase
        .from("membership_plans")
        .select(
          "plan_id, plan_name, price_amount, currency, duration_months, plan_code, tier"
        );
      planRow =
        (plans || []).find((p: any) => Number(p.price_amount) === paidAmount) ||
        null;
    }
    if (!planRow)
      return res
        .status(400)
        .json({ message: "Unable to resolve plan from order" });

    // Update user plan_code
    await supabase
      .from("users")
      .update({
        status: "active",
        plan_id: planRow.plan_id,
        plan_code: planRow.plan_code || null,
        is_premium: true,
      })
      .eq("id", userId);

    // Try to reuse the transaction id set at order creation (if any)
    const transactionId = taggedTransactionId || undefined;

    // Best-effort: align payment_history with successful reconciliation
    if (transactionId) {
      const { data: existingPayment } = await supabase
        .from("payment_history")
        .select("transaction_id")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      const paymentDate =
        (order as any)?.order_expiry_time ||
        (order as any)?.order_time ||
        new Date().toISOString();

      if (existingPayment) {
        await supabase
          .from("payment_history")
          .update({
            transaction_status: "SUCCESS",
            plan_id: planRow.plan_id,
            user_id: userId,
            payer_email: customer?.customer_email ?? null,
            created_at: paymentDate,
          })
          .eq("transaction_id", transactionId);
      } else {
        await supabase
          .from("payment_history")
          .insert({
            transaction_status: "SUCCESS",
            plan_id: planRow.plan_id,
            user_id: userId,
            payer_email: customer?.customer_email ?? null,
            transaction_id: transactionId,
            created_at: paymentDate,
          })
          .maybeSingle();
      }
    }

    return res.status(200).json({ message: "Subscription reconciled" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to reconcile" });
  }
};
