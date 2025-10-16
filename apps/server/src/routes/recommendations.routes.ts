import { Router } from 'express';
import { listRecommendations } from '../controllers/recommendations.controller';

const router = Router();

// Public endpoint to fetch parsed recommendations from spreadsheet
router.get('/', listRecommendations);

export default router;

