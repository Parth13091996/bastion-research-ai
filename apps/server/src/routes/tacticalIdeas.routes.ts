import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";
import {
  deleteTacticalIdea,
  getLiveTacticalIdeasSummary,
  getTacticalIdeaByCompanySymbol,
  getTacticalIdeas,
  getTacticalIdeasFromSheet,
  upsertTacticalIdeaByCompany,
} from "../controllers/tacticalIdeas.controller";

const router = Router();

// Public routes (same pattern as recommendations)
router.get("/tactical-ideas", getTacticalIdeas);
router.get("/tactical-ideas/sheet", getTacticalIdeasFromSheet);
router.get("/tactical-ideas/live-dashboard", getLiveTacticalIdeasSummary);
router.get(
  "/tactical-ideas/company/:companySymbol",
  getTacticalIdeaByCompanySymbol
);

// Admin upsert / delete (mirror recommendations)
router.put(
  "/tactical-ideas/company/:companySymbol",
  protect,
  admin,
  upsertTacticalIdeaByCompany
);
router.delete("/tactical-ideas/:id", protect, admin, deleteTacticalIdea);

export default router;

