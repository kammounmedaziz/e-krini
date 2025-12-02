const express = require('express');
const router = express.Router();
const vehiculeController = require('../controllers/vehiculeController');

router.get('/show', vehiculeController.show);
router.get('/showById/:id', vehiculeController.showById);
router.get('/immatriculation/:immatriculation', vehiculeController.showByImmatriculation);
router.post('/add',  vehiculeController.add);
router.put('/update/:id', vehiculeController.update);
router.delete('/delete/:id', vehiculeController.deleteVehicule);

module.exports = router;