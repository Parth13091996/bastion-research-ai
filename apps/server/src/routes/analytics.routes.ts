import { Router } from "express";
import { trackPageView } from "../controllers/analytics.controller";
import { optionalAuth } from "../middleware/optionalAuth.middleware";

const router = Router();

// Public endpoint used by the SPA to record page views
router.post("/track", optionalAuth, trackPageView);

export default router;

