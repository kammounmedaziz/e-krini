const MaterielMaintenance = require('../models/materielMaintenance');

async function add(req, res) {
    try {
        const newMateriel = new MaterielMaintenance(req.body);
        const saved = await newMateriel.save();
        res.status(201).json(saved);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Un matériel avec ce nom existe déjà' });
        }
        res.status(400).json({ error: err.message });
    }
}

async function show(req, res) {
    try {
        const materiels = await MaterielMaintenance.find().sort({ nom: 1 });
        res.json(materiels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showById(req, res) {
    try {
        const materiel = await MaterielMaintenance.findById(req.params.id);
        
        if (!materiel) {
            return res.status(404).json({ error: 'Matériel non trouvé' });
        }
        
        res.json(materiel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showByName(req, res) {
    try {
        const materiels = await MaterielMaintenance.find({ 
            nom: { $regex: req.params.name, $options: 'i' } 
        });
        res.json(materiels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showByCategorie(req, res) {
    try {
        const materiels = await MaterielMaintenance.find({ 
            categorie: req.params.categorie 
        }).sort({ nom: 1 });
        res.json(materiels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showAlertes(req, res) {
    try {
        const materiels = await MaterielMaintenance.find().sort({ quantiteDisponible: 1 });
        const alertes = materiels.filter(m => m.quantiteDisponible <= m.seuilAlerte);
        res.json(alertes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const materiel = await MaterielMaintenance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!materiel) {
            return res.status(404).json({ error: 'Matériel non trouvé' });
        }
        
        res.json(materiel);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Un matériel avec ce nom existe déjà' });
        }
        res.status(400).json({ error: err.message });
    }
}

async function reapprovisionner(req, res) {
    try {
        const { quantite } = req.body;
        
        if (!quantite || quantite <= 0) {
            return res.status(400).json({ error: 'Quantité invalide' });
        }

        const materiel = await MaterielMaintenance.findById(req.params.id);
        
        if (!materiel) {
            return res.status(404).json({ error: 'Matériel non trouvé' });
        }

        await materiel.incrementerStock(quantite);
        
        res.json({
            message: 'Stock réapprovisionné avec succès',
            materiel: materiel
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deleteMateriel(req, res) {
    try {
        const materiel = await MaterielMaintenance.findByIdAndDelete(req.params.id);
        
        if (!materiel) {
            return res.status(404).json({ error: 'Matériel non trouvé' });
        }
        
        res.json({ message: 'Matériel supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getStatistiques(req, res) {
    try {
        const materiels = await MaterielMaintenance.find();
        
        const stats = {
            nombreTotal: materiels.length,
            valeurTotaleStock: materiels.reduce((sum, m) => 
                sum + (m.quantiteDisponible * m.prixUnitaire), 0
            ),
            nombreAlertes: materiels.filter(m => m.quantiteDisponible <= m.seuilAlerte).length,
            parCategorie: {}
        };

        materiels.forEach(m => {
            if (!stats.parCategorie[m.categorie]) {
                stats.parCategorie[m.categorie] = {
                    nombre: 0,
                    valeur: 0
                };
            }
            stats.parCategorie[m.categorie].nombre++;
            stats.parCategorie[m.categorie].valeur += m.quantiteDisponible * m.prixUnitaire;
        });

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    add,
    show,
    showById,
    showByName,
    showByCategorie,
    showAlertes,
    update,
    reapprovisionner,
    deleteMateriel,
    getStatistiques
};