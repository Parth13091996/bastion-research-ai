import { Router } from "express";
import {
  signIn,
  forgotPassword,
  resetPassword,
  getUserSession,
  logout,
  registerFromOnboarding,
  createOrUpdateUserAfterKYC,
} from "../controllers/auth.controller";

const router = Router();

// Standard Authentication
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/onboard", registerFromOnboarding);
router.post("/onboard/start", createOrUpdateUserAfterKYC);

// User session routes
router.get("/session", getUserSession);
router.post("/logout", logout);

export default router;
