import { Router } from "express";
import {
  listPlans,
  createOrderForPlan,
  getOrder,
  handleCashfreeWebhook,
} from "../controllers/cashfree.controller";

const router = Router();

// Plans
router.get("/plans", listPlans);

// Create order for selected plan
router.post("/orders", createOrderForPlan);

// Fetch order status
router.get("/orders/:orderId", getOrder);

// Webhook handler
router.post("/webhook", handleCashfreeWebhook);

export default router;
