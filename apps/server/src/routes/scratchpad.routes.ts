import { requirePremium } from '../services/premium-access.service';
import { Router } from "express";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";
import {
  getScratchPadNewsletters,
  getScratchPadNewsletterById,
  getScratchPadNewsletterBySlug,
  createScratchPadNewsletter,
  updateScratchPadNewsletter,
  deleteScratchPadNewsletter,
} from "../controllers/scratchpad.controller";

const router = Router();

// Public routes
router.get("/scratch-pad-newsletters", protect, requirePremium, getScratchPadNewsletters);
router.get("/scratch-pad-newsletters/:id", protect, requirePremium, getScratchPadNewsletterById);
router.get("/scratch-pad-newsletters/slug/:slug", protect, requirePremium, getScratchPadNewsletterBySlug);

// Admin routes (protected)
router.post(
  "/admin/scratch-pad-newsletters",
  protect,
  staff,
  requireSectionEdit("content_scratch_pad"),
  createScratchPadNewsletter
);
router.put(
  "/admin/scratch-pad-newsletters/:id",
  protect,
  staff,
  requireSectionEdit("content_scratch_pad"),
  updateScratchPadNewsletter
);
router.delete(
  "/admin/scratch-pad-newsletters/:id",
  protect,
  staff,
  requireSectionEdit("content_scratch_pad"),
  deleteScratchPadNewsletter
);

export default router;
