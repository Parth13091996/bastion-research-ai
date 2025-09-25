import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';

const router = Router();

router.get('/coupons', getCoupons);
router.get('/coupons/validate', validateCoupon);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
