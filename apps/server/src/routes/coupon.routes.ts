import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  createBulkCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';

const router = Router();

router.get('/', getCoupons);
router.get('/validate', validateCoupon);
router.post('', createCoupon);
router.post('/bulk', createBulkCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
