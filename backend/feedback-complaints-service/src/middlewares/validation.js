import { body, param, query } from 'express-validator';

export const createFeedbackValidation = [
  body('type')
    .isIn(['feedback', 'complaint', 'report', 'suggestion'])
    .withMessage('Type must be one of: feedback, complaint, report, suggestion'),
  body('category')
    .isIn([
      'service_quality',
      'vehicle_issue',
      'payment_issue',
      'booking_issue',
      'insurance_issue',
      'customer_support',
      'technical_issue',
      'safety_concern',
      'other'
    ])
    .withMessage('Invalid category'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('relatedTo.type')
    .optional()
    .isIn(['reservation', 'vehicle', 'agency', 'insurance', 'payment', 'user', 'none'])
    .withMessage('Invalid relatedTo type'),
  body('relatedTo.referenceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid reference ID'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number')
];

export const updateFeedbackValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

export const respondToFeedbackValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Response message is required')
    .isLength({ max: 1000 })
    .withMessage('Response message must not exceed 1000 characters')
];

export const resolveFeedbackValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Resolution message is required')
    .isLength({ max: 1000 })
    .withMessage('Resolution message must not exceed 1000 characters')
];

export const addNoteValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note is required')
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters')
];

export const rateFeedbackValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

export const getFeedbackQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid status'),
  query('type')
    .optional()
    .isIn(['feedback', 'complaint', 'report', 'suggestion'])
    .withMessage('Invalid type'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];
