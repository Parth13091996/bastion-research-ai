import { Router } from "express";
import {
  signIn,
  forgotPassword,
  resetPassword,
  getUserSession,
  logout,
  onboardUser,
  onboardingDropOffStart,
  zeroAmountAccountCreation,
} from "../controllers/auth.controller";

const router = Router();

// Standard Authentication
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/onboarding-dropoff/start", onboardingDropOffStart);
router.post("/onboard", onboardUser);
router.post("/zero-amount-payment", zeroAmountAccountCreation);

// User session routes
router.get("/session", getUserSession);
router.post("/logout", logout);

export default router;
