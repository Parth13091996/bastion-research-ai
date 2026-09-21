import { Router } from "express";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";
import {
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


router.put(
  "/recommendations/company/:companySymbol",
  protect,
  staff,
  requireSectionEdit("content_recommendations"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "business_note", maxCount: 1 },
    { name: "quick_bite", maxCount: 1 },
    { name: "exit_rationale", maxCount: 1 },
  ]),
  upsertRecommendationByCompany
);
router.delete(
  "/recommendations/:id",
  protect,
  staff,
  requireSectionEdit("content_recommendations"),
  deleteRecommendation
);

export default router;
