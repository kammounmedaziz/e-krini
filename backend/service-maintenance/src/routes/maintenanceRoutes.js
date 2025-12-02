const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateMaintenance, validateMaintenanceUpdate } = require('../middlewares/validateMaintenance');

router.get('/show', maintenanceController.show);
router.get('/showById/:id', maintenanceController.showbyId);
router.post('/add', validateMaintenance, maintenanceController.add);
router.put('/update/:id', validateMaintenanceUpdate, maintenanceController.update);
router.delete('/delete/:id', maintenanceController.deletemaintenance);
router.get('/vehicule/:idVehicule', maintenanceController.showByVehicule);
router.get('/type/:type', maintenanceController.showByType);
router.get('/historique/:idVehicule', maintenanceController.historiqueVehicule);
router.get('/couts/:id', maintenanceController.getCoutsDetailles);

module.exports = router;