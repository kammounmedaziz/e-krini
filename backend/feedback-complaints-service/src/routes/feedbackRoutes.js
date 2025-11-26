import express from 'express';
import { validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import {
  createFeedbackValidation,
  updateFeedbackValidation,
  respondToFeedbackValidation,
  resolveFeedbackValidation,
  addNoteValidation,
  rateFeedbackValidation,
  getFeedbackQueryValidation
} from '../middlewares/validation.js';
import {
  createFeedback,
  getAllFeedback,
  getMyFeedback,
  getFeedbackById,
  updateFeedback,
  respondToFeedback,
  resolveFeedback,
  addInternalNote,
  rateFeedbackResolution,
  deleteFeedback,
  getFeedbackStats
} from '../controllers/feedbackController.js';

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

// Public/User routes
router.post(
  '/',
  authenticateToken,
  createFeedbackValidation,
  validate,
  createFeedback
);

router.get(
  '/my-feedback',
  authenticateToken,
  getFeedbackQueryValidation,
  validate,
  getMyFeedback
);

router.get(
  '/:id',
  authenticateToken,
  getFeedbackById
);

router.patch(
  '/:id/rate',
  authenticateToken,
  rateFeedbackValidation,
  validate,
  rateFeedbackResolution
);

router.delete(
  '/:id',
  authenticateToken,
  deleteFeedback
);

// Admin only routes
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  getFeedbackQueryValidation,
  validate,
  getAllFeedback
);

router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  updateFeedbackValidation,
  validate,
  updateFeedback
);

router.post(
  '/:id/respond',
  authenticateToken,
  authorizeRoles('admin'),
  respondToFeedbackValidation,
  validate,
  respondToFeedback
);

router.post(
  '/:id/resolve',
  authenticateToken,
  authorizeRoles('admin'),
  resolveFeedbackValidation,
  validate,
  resolveFeedback
);

router.post(
  '/:id/notes',
  authenticateToken,
  authorizeRoles('admin'),
  addNoteValidation,
  validate,
  addInternalNote
);

router.get(
  '/admin/statistics',
  authenticateToken,
  authorizeRoles('admin'),
  getFeedbackStats
);

export default router;
