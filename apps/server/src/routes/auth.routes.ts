import { Router } from "express";
import {
  signIn,
  forgotPassword,
  getMe,
  logout,
} from "../controllers/auth.controller";

const router = Router();

// Standard Authentication
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);

// User session routes
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
