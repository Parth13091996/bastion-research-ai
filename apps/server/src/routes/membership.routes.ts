import { Router } from 'express';
import {
  getMembershipPlans,
  getSubscriptions,
  getPaymentHistory,
  getMembershipPlans,\n  getSubscriptions,\n  getPaymentHistory,\n  createMembershipPlan,\n  updateMembershipPlan,\n  deleteMembershipPlan,\n  createSubscription,\n  updateSubscription,\n  deleteSubscription,\n  createPaymentHistory,\n  deletePaymentHistory\n} from '../controllers/membership.controller';

const router = Router();

router.get('/membership-plans', getMembershipPlans);
router.get('/subscriptions', getSubscriptions);
router.get('/payment-history', getPaymentHistory);

router.post('/membership-plans', createMembershipPlan);
router.put('/membership-plans/:id', updateMembershipPlan);
router.delete('/membership-plans/:id', deleteMembershipPlan);

router.post('/subscriptions', createSubscription);
router.put('/subscriptions/:id', updateSubscription);
router.delete('/subscriptions/:id', deleteSubscription);

router.post('/payment-history', createPaymentHistory);
router.delete('/payment-history/:id', deletePaymentHistory);

export default router;
