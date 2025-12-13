const express = require('express');
const router = express.Router();
const materielController = require('../controllers/materielController');
const { validateMateriel } = require('../middlewares/validateMaintenance');

router.get('/show', materielController.show);
router.get('/showById/:id', materielController.showById);
router.get('/showByName/:name', materielController.showByName);
router.post('/add', validateMateriel, materielController.add);
router.put('/update/:id', validateMateriel, materielController.update);
router.delete('/delete/:id', materielController.deleteMateriel);
router.get('/categorie/:categorie', materielController.showByCategorie);
router.get('/alertes', materielController.showAlertes);
router.put('/reapprovisionner/:id', materielController.reapprovisionner);
router.get('/statistiques', materielController.getStatistiques);

module.exports = router;