import { Router } from "express";
import {
  sendOtp,
  verifyOtp,
  sendEmailOtp,
} from "../controllers/otp.controller";

const router = Router();

// OTP routes
router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.post("/send-email", sendEmailOtp);

export default router;
