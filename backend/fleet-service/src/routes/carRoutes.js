import express from 'express';
import * as carController from '../controllers/carController.js';
import { authMiddleware, authorize } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - nom
 *         - category
 *         - matricule
 *         - marque
 *         - modele
 *         - prixParJour
 *       properties:
 *         nom:
 *           type: string
 *           example: Toyota Corolla 2023
 *         category:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         matricule:
 *           type: string
 *           example: TUN-1234
 *         marque:
 *           type: string
 *           example: Toyota
 *         modele:
 *           type: string
 *           example: Corolla
 *         annee:
 *           type: number
 *           example: 2023
 *         prixParJour:
 *           type: number
 *           example: 80
 *         couleur:
 *           type: string
 *           example: Blue
 *         typeCarburant:
 *           type: string
 *           enum: [Essence, Diesel, Hybrid, Electric]
 *         transmission:
 *           type: string
 *           enum: [Manual, Automatic]
 *         nombrePlaces:
 *           type: number
 *           example: 5
 *         climatisation:
 *           type: boolean
 *         disponibilite:
 *           type: boolean
 *         kilometrage:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created successfully
 */
router.post('/', authMiddleware, authorize('admin', 'agency'), carController.createCar);

// List cars (public access with optional filters)
router.get('/', carController.getCars);

// Search endpoint with specific filters: categorie, marque, prixMax, disponibilite (public)
router.get('/search', carController.searchCars);

// Maintenance endpoints (admin/agency only)
// Trigger a maintenance check that updates flags and returns list
router.get('/maintenance/check', authMiddleware, authorize('admin', 'agency'), carController.checkMaintenance);
// Return cars currently flagged as needing maintenance
router.get('/maintenance/due', authMiddleware, authorize('admin', 'agency'), carController.maintenanceDue);

// Availability check (POST with { startDate, endDate, carIds }) - public
router.post('/availability', carController.checkAvailability);

// Apply seasonal pricing manually (admin only)
router.post('/pricing/update-season', authMiddleware, authorize('admin'), carController.updateSeasonPricing);

// CRUD by id
router.get('/:id', carController.getCarById);
router.patch('/:id', authMiddleware, authorize('admin', 'agency'), carController.updateCar);
router.delete('/:id', authMiddleware, authorize('admin'), carController.deleteCar);

export default router;
