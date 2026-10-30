import optionalAuth from '../middleware/optionalAuth.middleware';
import {requirePremium} from '../services/premium-access.service';
import {getResearchAsset,previewResearchAsset} from '../services/research-assets.service';
import { Router } from "express";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";
import {
  deleteRecommendation,
  getRecommendations,
  getRecommendationByCompanySymbol,
  getRecommendationsFromSheet,
  getLiveRecommendationsSummary,
  getPortfolioDashboardSummary,
  getPortfolioMethodology,
  upsertRecommendationByCompany,
  updateUserRecommendationAnalytics,
} from "../controllers/recommendations.controller";
import { upload } from "../services/multer.service";

const router = Router();
router.use(optionalAuth);
router.get("/research-assets/:kind/:id", getResearchAsset);
router.get("/staff/research-preview",protect,staff,previewResearchAsset);
router.get('/premium/benefits',protect,requirePremium,(_req,res)=>res.set('Cache-Control','private, no-store').json({coupon_code:process.env.CORE_COMMUNITY_COUPON || 'CORECOMMUNITY',whatsapp_url:process.env.CORE_WHATSAPP_URL || 'https://chat.whatsapp.com/BtcHdUM5CT3953nLHajCQR?mode=wwt'}));

// Public routes
router.get("/recommendations", getRecommendations);
router.get("/recommendations/sheet", getRecommendationsFromSheet);
router.get("/recommendations/live-dashboard", getLiveRecommendationsSummary);
router.get("/recommendations/portfolio-dashboard", getPortfolioDashboardSummary);
router.get("/recommendations/xirr-methodology", getPortfolioMethodology);
router.get(
  "/recommendations/company/analytics/:companySymbol",
  protect,
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
