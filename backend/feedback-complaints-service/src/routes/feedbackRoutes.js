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

// Admin statistics route (must be before /:id route)
router.get(
  '/admin/statistics',
  authenticateToken,
  authorizeRoles('admin'),
  getFeedbackStats
);

// User specific routes (must be before generic routes)
router.get(
  '/my-feedback',
  authenticateToken,
  getFeedbackQueryValidation,
  validate,
  getMyFeedback
);

// Create feedback
router.post(
  '/',
  authenticateToken,
  createFeedbackValidation,
  validate,
  createFeedback
);

// Admin: Get all feedback (must be after specific routes)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  getFeedbackQueryValidation,
  validate,
  getAllFeedback
);

// Get feedback by ID (must be after /my-feedback and /admin/statistics)
router.get(
  '/:id',
  authenticateToken,
  getFeedbackById
);

// Rate feedback resolution (user)
router.patch(
  '/:id/rate',
  authenticateToken,
  rateFeedbackValidation,
  validate,
  rateFeedbackResolution
);

// Delete feedback (user)
router.delete(
  '/:id',
  authenticateToken,
  deleteFeedback
);

// Admin: Update feedback
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  updateFeedbackValidation,
  validate,
  updateFeedback
);

// Admin: Respond to feedback
router.post(
  '/:id/respond',
  authenticateToken,
  authorizeRoles('admin'),
  respondToFeedbackValidation,
  validate,
  respondToFeedback
);

// Admin: Resolve feedback
router.post(
  '/:id/resolve',
  authenticateToken,
  authorizeRoles('admin'),
  resolveFeedbackValidation,
  validate,
  resolveFeedback
);

// Admin: Add internal note
router.post(
  '/:id/notes',
  authenticateToken,
  authorizeRoles('admin'),
  addNoteValidation,
  validate,
  addInternalNote
);

export default router;
