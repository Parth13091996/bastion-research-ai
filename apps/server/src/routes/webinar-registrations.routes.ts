import { Router } from "express";
import { createWebinarRegistration } from "../controllers/webinar-registrations.controller";

const router = Router();

// Public endpoint to create a webinar registration
router.post("/webinar-registrations", createWebinarRegistration);

export default router;

