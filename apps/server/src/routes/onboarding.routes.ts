import { Router } from "express";
import {
  createOnboardingSession,
  getOnboardingSession,
  updateOnboardingSession,
} from "../controllers/onboarding.controller";

const router = Router();

router.post("/session", createOnboardingSession);
router.get("/session/:sessionId", getOnboardingSession);
router.put("/session/:sessionId", updateOnboardingSession);

export default router;
