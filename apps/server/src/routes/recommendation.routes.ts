import { Router } from "express";
import {
  createRecommendation,
  deleteRecommendation,
  getRecommendations,
  updateRecommendation,
} from "../controllers/recommendations.controller";

const router = Router();

router.get("/recommendations", getRecommendations);
router.post("/recommendations", createRecommendation);
router.put("/recommendations/:id", updateRecommendation);
router.delete("/recommendations/:id", deleteRecommendation);

export default router;
