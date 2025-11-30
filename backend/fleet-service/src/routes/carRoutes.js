import express from 'express';
import * as carController from '../controllers/carController.js';

const router = express.Router();

// Create a new car
router.post('/', carController.createCar);

// List cars (supports pagination and some filters)
router.get('/', carController.getCars);

// Search endpoint with specific filters: categorie, marque, prixMax, disponibilite
router.get('/search', carController.searchCars);

// Maintenance endpoints
// Trigger a maintenance check that updates flags and returns list
router.get('/maintenance/check', carController.checkMaintenance);
// Return cars currently flagged as needing maintenance
router.get('/maintenance/due', carController.maintenanceDue);

// Availability check (POST with { startDate, endDate, carIds })
router.post('/availability', carController.checkAvailability);

// Apply seasonal pricing manually
router.post('/pricing/update-season', carController.updateSeasonPricing);

// CRUD by id
router.get('/:id', carController.getCarById);
router.patch('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

export default router;
