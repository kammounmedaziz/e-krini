import express from 'express';
import * as carController from '../controllers/carController.js';
import { authMiddleware, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Create a new car (admin/agency only)
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
