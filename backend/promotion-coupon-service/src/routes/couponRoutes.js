import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
  applyCoupon,
  getCouponStats,
  generateCouponCodes,
} from '../controllers/couponController.js';

const router = express.Router();

// CRUD
// Business logic first
router.post('/verify', verifyCoupon);
router.post('/apply', applyCoupon);
router.get('/:id/stats', getCouponStats);
router.post('/generate', generateCouponCodes);

// CRUD
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);


export default router;
