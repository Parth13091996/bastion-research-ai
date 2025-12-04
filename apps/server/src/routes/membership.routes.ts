import { Router } from "express";
import {
  createMembershipPlan,
  deleteMembershipPlan,
  deletePaymentHistory,
  getMembershipPlans,
  getPaymentHistory,
  getMyPaymentHistory,
  getSubscriptions,
  updateMembershipPlan,
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

router.delete("/payment-history/:id", deletePaymentHistory);

export default router;
