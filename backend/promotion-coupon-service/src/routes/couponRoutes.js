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
import { authMiddleware, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Business logic (public/authenticated access)
router.post('/verify', verifyCoupon); // Public - can verify coupon
router.post('/validate', verifyCoupon); // Alias for verify
router.post('/apply', authMiddleware, applyCoupon); // Authenticated - apply coupon to purchase
router.post('/generate', authMiddleware, authorize('admin'), generateCouponCodes); // Admin only

// Get by code - must be before /:id to avoid conflicts
router.get('/code/:code', getCouponById); // Public or authenticated

// CRUD operations (admin only)
router.post('/', authMiddleware, authorize('admin'), createCoupon);
router.get('/', authMiddleware, authorize('admin', 'agency'), getAllCoupons);
router.get('/:id/stats', authMiddleware, authorize('admin'), getCouponStats); // Admin only
router.get('/:id', authMiddleware, authorize('admin', 'agency'), getCouponById);
router.put('/:id', authMiddleware, authorize('admin'), updateCoupon);
router.delete('/:id', authMiddleware, authorize('admin'), deleteCoupon);


export default router;
