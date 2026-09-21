import { Router } from "express";
import {
  listPlans,
  createOrderForPlan,
  getOrder,
  handleCashfreeWebhook,
  getUserSubscription,
  testCashfreeWebhook,
  verifyPan,
  getPanVerificationStatus,
} from "../controllers/cashfree.controller";
import { protect } from "../middleware/auth.middleware";
import optionalAuth from "../middleware/optionalAuth.middleware";

const router = Router();

// Verification APIs
router.post("/verification/pan", optionalAuth, verifyPan);
router.get("/verification/pan/:referenceId", getPanVerificationStatus);

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
