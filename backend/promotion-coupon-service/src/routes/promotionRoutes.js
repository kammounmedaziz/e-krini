import express from 'express';
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getApplicablePromotions,
  calculatePromotionPrice,
  getPromotionsByCategory,
  getBestPromotion,
  togglePromotion,
} from '../controllers/promotionController.js';

const router = express.Router();

// CRUD
router.post('/', createPromotion);
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

// Business logic
router.get('/active/list', getActivePromotions);
router.post('/applicable', getApplicablePromotions);
router.post('/calculate', calculatePromotionPrice);
router.get('/category/:category', getPromotionsByCategory);
router.post('/best', getBestPromotion);
router.patch('/:id/toggle', togglePromotion);

export default router;
