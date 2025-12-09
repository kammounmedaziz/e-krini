const Vehicule = require('../models/vehicule');

async function add(req, res) {
    try {
        const newVehicule = new Vehicule(req.body);
        const saved = await newVehicule.save();
        res.status(201).json(saved);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Un véhicule avec cette immatriculation existe déjà' });
        }
        res.status(400).json({ error: err.message });
    }
}

async function show(req, res) {
    try {
        const vehicules = await Vehicule.find().sort({ immatriculation: 1 });
        res.json(vehicules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showById(req, res) {
    try {
        const vehicule = await Vehicule.findById(req.params.id);
        
        if (!vehicule) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        res.json(vehicule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showByImmatriculation(req, res) {
    try {
        const vehicule = await Vehicule.findOne({ 
            immatriculation: req.params.immatriculation.toUpperCase() 
        });
        
        if (!vehicule) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        res.json(vehicule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const vehicule = await Vehicule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!vehicule) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        res.json(vehicule);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Un véhicule avec cette immatriculation existe déjà' });
        }
        res.status(400).json({ error: err.message });
    }
}

async function deleteVehicule(req, res) {
    try {
        const vehicule = await Vehicule.findByIdAndDelete(req.params.id);
        
        if (!vehicule) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        res.json({ message: 'Véhicule supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    add,
    show,
    showById,
    showByImmatriculation,
    update,
    deleteVehicule
};
