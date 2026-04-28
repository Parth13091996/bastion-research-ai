import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  createBulkCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';
import { protect, requireSectionEdit, staff } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, staff, getCoupons);
router.get('/validate', validateCoupon);
router.post('', protect, staff, requireSectionEdit('ar_coupon_management'), createCoupon);
router.post('/bulk', protect, staff, requireSectionEdit('ar_coupon_management'), createBulkCoupons);
router.put('/:id', protect, staff, requireSectionEdit('ar_coupon_management'), updateCoupon);
router.delete('/:id', protect, staff, requireSectionEdit('ar_coupon_management'), deleteCoupon);

export default router;
