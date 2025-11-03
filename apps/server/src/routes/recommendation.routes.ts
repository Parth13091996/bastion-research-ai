import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";
import {
  createRecommendation,
  deleteRecommendation,
  getRecommendations,
  getRecommendationByCompanySymbol,
  updateRecommendation,
  upsertRecommendationByCompany,
  getRecommendationById,
} from "../controllers/recommendations.controller";
import { upload } from "../services/multer.service";

const router = Router();

// Public routes
router.get("/recommendations", getRecommendations);
router.get(
  "/recommendations/company/:companySymbol",
  getRecommendationByCompanySymbol
);

// Admin routes (protected)
router.post("/recommendations", protect, admin, createRecommendation);
router.put("/recommendations/:id", protect, admin, updateRecommendation);
router.get("/recommendations/:id", protect, admin, getRecommendationById);

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
