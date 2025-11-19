import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";
import {
  createRecommendation,
  deleteRecommendation,
  getRecommendations,
  getRecommendationByCompanySymbol,
  getRecommendationsFromSheet,
  getLiveRecommendationsSummary,
  upsertRecommendationByCompany,
  updateUserRecommendationAnalytics,
} from "../controllers/recommendations.controller";
import { upload } from "../services/multer.service";

const router = Router();

// Public routes
router.get("/recommendations", getRecommendations);
router.get("/recommendations/sheet", getRecommendationsFromSheet);
router.get("/recommendations/live-dashboard", getLiveRecommendationsSummary);
router.get(
  "/recommendations/company/analytics/:companySymbol",
  updateUserRecommendationAnalytics
);

router.get(
  "/recommendations/company/:companySymbol",
  getRecommendationByCompanySymbol
);

// Admin routes (protected)
router.post("/recommendations", protect, admin, createRecommendation);

router.put(
  "/recommendations/company/:companySymbol",
  protect,
  admin,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "business_note", maxCount: 1 },
    { name: "quick_bite", maxCount: 1 },
    { name: "exit_rationale", maxCount: 1 },
  ]),
  upsertRecommendationByCompany
);
router.delete("/recommendations/:id", protect, admin, deleteRecommendation);

export default router;
