import { Router } from "express";
import {
  listPlans,
  createOrderForPlan,
  getOrder,
  handleCashfreeWebhook,
  getUserSubscription,
  testCashfreeWebhook,
} from "../controllers/cashfree.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Plans
router.get("/plans", listPlans);

// Create order for selected plan
router.post("/orders", createOrderForPlan);

// Fetch order status
router.get("/orders/:orderId", getOrder);

// Get user subscription status (authenticated)
router.get("/subscription", protect, getUserSubscription);

// Webhook handler
router.post("/webhook", handleCashfreeWebhook);
router.get("/webhook", testCashfreeWebhook);

export default router;
