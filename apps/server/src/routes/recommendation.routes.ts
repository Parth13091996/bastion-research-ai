import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";
import {
  createRecommendation,
  deleteRecommendation,
  getRecommendations,
  getRecommendationByCompany,
  updateRecommendation,
  upsertRecommendationByCompany,
  getRecommendationById,
} from "../controllers/recommendations.controller";

const router = Router();

// Public routes
router.get("/recommendations", getRecommendations);
router.get("/recommendations/company/:companyName", getRecommendationByCompany);

// Admin routes (protected)
router.post("/recommendations", protect, admin, createRecommendation);
router.put("/recommendations/:id", protect, admin, updateRecommendation);
router.get("/recommendations/:id", protect, admin, getRecommendationById);

router.put(
  "/recommendations/company/:companyName",
  protect,
  admin,
  upsertRecommendationByCompany
);
router.delete("/recommendations/:id", protect, admin, deleteRecommendation);

export default router;
