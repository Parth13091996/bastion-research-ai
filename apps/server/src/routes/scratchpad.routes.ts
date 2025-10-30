import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";
import {
  getScratchPadNewsletters,
  getScratchPadNewsletterById,
  createScratchPadNewsletter,
  updateScratchPadNewsletter,
  deleteScratchPadNewsletter,
} from "../controllers/scratchpad.controller";

const router = Router();

// Public routes
router.get("/scratch-pad-newsletters", getScratchPadNewsletters);
router.get("/scratch-pad-newsletters/:id", getScratchPadNewsletterById);

// Admin routes (protected)
router.post(
  "/admin/scratch-pad-newsletters",
  protect,
  admin,
  createScratchPadNewsletter
);
router.put(
  "/admin/scratch-pad-newsletters/:id",
  protect,
  admin,
  updateScratchPadNewsletter
);
router.delete(
  "/admin/scratch-pad-newsletters/:id",
  protect,
  admin,
  deleteScratchPadNewsletter
);

export default router;
