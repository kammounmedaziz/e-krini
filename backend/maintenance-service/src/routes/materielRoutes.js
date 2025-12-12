const express = require('express');
const router = express.Router();
const materielController = require('../controllers/materielController');
const { validateMateriel } = require('../middlewares/validateMaintenance');

// GET / - List all materials
router.get('/', materielController.show);

// Specific routes first
router.get('/show', materielController.show);
router.get('/alertes', materielController.showAlertes);
router.get('/statistiques', materielController.getStatistiques);
router.get('/categorie/:categorie', materielController.showByCategorie);
router.get('/showByName/:name', materielController.showByName);
router.get('/showById/:id', materielController.showById);

// Standard REST routes
router.get('/:id', materielController.showById);
router.post('/add', validateMateriel, materielController.add);
router.post('/', validateMateriel, materielController.add);
router.put('/update/:id', validateMateriel, materielController.update);
router.put('/:id', validateMateriel, materielController.update);
router.put('/reapprovisionner/:id', materielController.reapprovisionner);
router.delete('/delete/:id', materielController.deleteMateriel);
router.delete('/:id', materielController.deleteMateriel);

module.exports = router;