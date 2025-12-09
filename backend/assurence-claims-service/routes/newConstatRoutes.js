const express = require('express');
const router = express.Router();
const ConstatController = require('../controllers/constatController');
const { authMiddleware, authorize } = require('../middlewares/auth.cjs.js');

/**
 * @swagger
 * /api/constats/stats:
 *   get:
 *     summary: Get claims statistics
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authMiddleware, authorize('admin', 'agency', 'insurance'), ConstatController.getStatistics);

/**
 * @swagger
 * /api/constats/user/me:
 *   get:
 *     summary: Get my claims
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/me', authMiddleware, ConstatController.getMyConstats);

/**
 * @swagger
 * /api/constats:
 *   post:
 *     summary: Create new claim
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, ConstatController.createConstat);

/**
 * @swagger
 * /api/constats:
 *   get:
 *     summary: Get all claims
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, authorize('admin', 'agency', 'insurance'), ConstatController.getAllConstats);

/**
 * @swagger
 * /api/constats/:id:
 *   get:
 *     summary: Get claim by ID
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, ConstatController.getConstatById);

/**
 * @swagger
 * /api/constats/:id:
 *   put:
 *     summary: Update claim
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, ConstatController.updateConstat);

/**
 * @swagger
 * /api/constats/:id/submit:
 *   put:
 *     summary: Submit claim for review
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/submit', authMiddleware, ConstatController.submitConstat);

/**
 * @swagger
 * /api/constats/:id/review:
 *   put:
 *     summary: Review claim (approve/reject)
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/review', authMiddleware, authorize('admin', 'agency', 'insurance'), ConstatController.reviewConstat);

/**
 * @swagger
 * /api/constats/:id/fraud-detection:
 *   put:
 *     summary: Add fraud detection flags
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/fraud-detection', authMiddleware, authorize('admin', 'insurance'), ConstatController.addFraudDetection);

/**
 * @swagger
 * /api/constats/:id/payment:
 *   put:
 *     summary: Process payment for claim
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/payment', authMiddleware, authorize('admin', 'insurance'), ConstatController.processPayment);

/**
 * @swagger
 * /api/constats/:id:
 *   delete:
 *     summary: Delete claim
 *     tags: [Constat]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, authorize('admin'), ConstatController.deleteConstat);

module.exports = router;