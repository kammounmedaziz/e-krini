const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateMaintenance, validateMaintenanceUpdate } = require('../middlewares/validateMaintenance');
const { authMiddleware, authorize } = require('../../middlewares/auth.cjs.js');

// GET / - List all maintenance records (admin/agency only)
router.get('/', authMiddleware, authorize('admin', 'agency'), maintenanceController.show);

// All maintenance routes require authentication (admin/agency only)
router.get('/show', authMiddleware, authorize('admin', 'agency'), maintenanceController.show);
router.get('/showById/:id', authMiddleware, authorize('admin', 'agency'), maintenanceController.showbyId);
router.post('/add', authMiddleware, authorize('admin', 'agency'), validateMaintenance, maintenanceController.add);
router.put('/update/:id', authMiddleware, authorize('admin', 'agency'), validateMaintenanceUpdate, maintenanceController.update);
router.delete('/delete/:id', authMiddleware, authorize('admin'), maintenanceController.deletemaintenance);
router.get('/vehicule/:idVehicule', authMiddleware, authorize('admin', 'agency'), maintenanceController.showByVehicule);
router.get('/type/:type', authMiddleware, authorize('admin', 'agency'), maintenanceController.showByType);
router.get('/historique/:idVehicule', authMiddleware, authorize('admin', 'agency'), maintenanceController.historiqueVehicule);
router.get('/couts/:id', authMiddleware, authorize('admin', 'agency'), maintenanceController.getCoutsDetailles);

module.exports = router;