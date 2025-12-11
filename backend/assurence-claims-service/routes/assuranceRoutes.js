const express = require('express');
const router = express.Router();
const AssuranceController = require('../controllers/assuranceController');
const { authMiddleware, authorize } = require('../middlewares/auth.cjs.js');

console.log('📋 Loading assuranceRoutes.js...');
console.log('📦 AssuranceController methods:', Object.keys(AssuranceController));

/**
 * @swagger
 * /api/assurances:
 *   post:
 *     summary: Create new insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, AssuranceController.createAssurance);

/**
 * @swagger
 * /api/assurances/user/me:
 *   get:
 *     summary: Get my insurance policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/me', authMiddleware, AssuranceController.getMyAssurances);

/**
 * @swagger
 * /api/assurances/expiring/:days:
 *   get:
 *     summary: Get expiring policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/expiring/:days', authMiddleware, authorize('admin', 'agency', 'insurance'), AssuranceController.getExpiringPolicies);

/**
 * @swagger
 * /api/assurances/vehicle/:vehicleId:
 *   get:
 *     summary: Get vehicle insurance
 *     tags: [Assurance]
 */
router.get('/vehicle/:vehicleId', AssuranceController.getVehicleInsurance);

/**
 * @swagger
 * /api/assurances:
 *   get:
 *     summary: Get all insurance policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, authorize('admin', 'agency', 'insurance'), AssuranceController.getAllAssurances);

/**
 * @swagger
 * /api/assurances/:id:
 *   get:
 *     summary: Get insurance policy by ID
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, AssuranceController.getAssuranceById);

/**
 * @swagger
 * /api/assurances/:id:
 *   put:
 *     summary: Update insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, AssuranceController.updateAssurance);

/**
 * @swagger
 * /api/assurances/:id/approve:
 *   put:
 *     summary: Approve insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/approve', authMiddleware, authorize('admin', 'agency', 'insurance'), AssuranceController.approveAssurance);

/**
 * @swagger
 * /api/assurances/:id/cancel:
 *   put:
 *     summary: Cancel insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/cancel', authMiddleware, AssuranceController.cancelAssurance);

/**
 * @swagger
 * /api/assurances/:id:
 *   delete:
 *     summary: Delete insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, authorize('admin'), AssuranceController.deleteAssurance);

module.exports = router;