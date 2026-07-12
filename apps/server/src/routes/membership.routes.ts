import { Router } from "express";
import {
  createMembershipPlan,
  deleteMembershipPlan,
  deletePaymentHistory,
  getMembershipPlans,
  getPaymentHistory,
  getMyPaymentHistory,
  getSubscriptions,
  getInvoicePdfForPayment,
  updateMembershipPlan,
} from "../controllers/membership.controller";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";

const router = Router();

router.get("/membership-plans", getMembershipPlans);
router.get("/subscriptions", protect, staff, getSubscriptions);
router.get("/payment-history", protect, staff, getPaymentHistory);
router.get("/payment-history/me", protect, getMyPaymentHistory);
router.get(
  "/payment-history/:id/invoice-pdf",
  protect,
  getInvoicePdfForPayment
);

router.post(
  "/membership-plans",
  protect,
  staff,
  requireSectionEdit("ar_manage_plans"),
  createMembershipPlan
);
router.put(
  "/membership-plans/:id",
  protect,
  staff,
  requireSectionEdit("ar_manage_plans"),
  updateMembershipPlan
);
router.delete(
  "/membership-plans/:id",
  protect,
  staff,
  requireSectionEdit("ar_manage_plans"),
  deleteMembershipPlan
);

router.delete(
  "/payment-history/:id",
  protect,
  staff,
  requireSectionEdit("ar_payment_history"),
  deletePaymentHistory
);

export default router;
