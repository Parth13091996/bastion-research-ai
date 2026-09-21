import { Router } from "express";
import { getPublicSettings } from "../controllers/settings.controller";

const router = Router();

// Public settings endpoint (no auth required)
router.get("/settings", getPublicSettings);

export default router;
