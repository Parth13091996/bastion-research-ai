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
router.get("/scratch-pad-newsletters", getScratchPadNewsletters);
router.get("/scratch-pad-newsletters/:id", getScratchPadNewsletterById);
router.get("/scratch-pad-newsletters/slug/:slug", getScratchPadNewsletterBySlug);

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
