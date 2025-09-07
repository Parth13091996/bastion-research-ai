import { Router } from "express";
import {
  createMembershipPlan,
  createPaymentHistory,
  createSubscription,
  deleteMembershipPlan,
  deletePaymentHistory,
  deleteSubscription,
  getMembershipPlans,
  getPaymentHistory,
  getMyPaymentHistory,
  getSubscriptions,
  updateMembershipPlan,
  updateSubscription,
} from "../controllers/membership.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/membership-plans", getMembershipPlans);
router.get("/subscriptions", getSubscriptions);
router.get("/payment-history", getPaymentHistory);
router.get("/payment-history/me", protect, getMyPaymentHistory);

router.post("/membership-plans", createMembershipPlan);
router.put("/membership-plans/:id", updateMembershipPlan);
router.delete("/membership-plans/:id", deleteMembershipPlan);

router.post("/subscriptions", createSubscription);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", deleteSubscription);

router.post("/payment-history", createPaymentHistory);
router.delete("/payment-history/:id", deletePaymentHistory);

export default router;
