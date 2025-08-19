import { Router } from 'express';
import {
  getMembershipPlans,
  getSubscriptions,
  getPaymentHistory,
} from '../controllers/membership.controller';

const router = Router();

router.get('/membership-plans', getMembershipPlans);
router.get('/subscriptions', getSubscriptions);
router.get('/payment-history', getPaymentHistory);

export default router;
