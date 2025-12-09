const Maintenance = require('../models/maintenance');
const MaterielMaintenance = require('../models/materielMaintenance');
const Vehicule = require('../models/vehicule');

async function add(req, res) {
    try {
        const vehicule = await Vehicule.findById(req.body.idVehicule);
        if (!vehicule) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        if (req.body.idMateriaux && req.body.idMateriaux.length > 0) {
            for (let item of req.body.idMateriaux) {
                const materiel = await MaterielMaintenance.findById(item.materiel);
                
                if (!materiel) {
                    return res.status(404).json({ 
                        error: `Matériel non trouvé: ${item.materiel}` 
                    });
                }

                if (!materiel.verifierStock(item.quantiteUtilisee)) {
                    return res.status(400).json({ 
                        error: `Stock insuffisant pour ${materiel.nom}. Disponible: ${materiel.quantiteDisponible}, Demandé: ${item.quantiteUtilisee}` 
                    });
                }
            }

            for (let item of req.body.idMateriaux) {
                const materiel = await MaterielMaintenance.findById(item.materiel);
                await materiel.decrementerStock(item.quantiteUtilisee);
            }
        }

        const newMaintenance = new Maintenance(req.body);
        const saved = await newMaintenance.save();
        
        if (saved.etat === 'en cours') {
            vehicule.etat = 'En maintenance';
            await vehicule.save();
        }

        const populated = await Maintenance.findById(saved._id)
            .populate('idVehicule')
            .populate('idMateriaux.materiel');

        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function show(req, res) {
    try {
        const maintenances = await Maintenance.find()
            .populate('idVehicule')
            .populate('idMateriaux.materiel')
            .sort({ dateMaintenance: -1 });
        res.json(maintenances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showbyId(req, res) {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate('idVehicule')
            .populate('idMateriaux.materiel');
        
        if (!maintenance) {
            return res.status(404).json({ error: 'Maintenance non trouvée' });
        }
        
        res.json(maintenance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showByVehicule(req, res) {
    try {
        const maintenances = await Maintenance.find({ idVehicule: req.params.idVehicule })
            .populate('idVehicule')
            .populate('idMateriaux.materiel')
            .sort({ dateMaintenance: -1 });
        
        res.json(maintenances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function showByType(req, res) {
    try {
        const maintenances = await Maintenance.find({ typeMaintenance: req.params.type })
            .populate('idVehicule')
            .populate('idMateriaux.materiel')
            .sort({ dateMaintenance: -1 });
        
        res.json(maintenances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function historiqueVehicule(req, res) {
    try {
        const maintenances = await Maintenance.find({ idVehicule: req.params.idVehicule })
            .populate('idVehicule')
            .populate('idMateriaux.materiel')
            .sort({ dateMaintenance: -1 });

        const stats = {
            nombreMaintenances: maintenances.length,
            coutTotal: maintenances.reduce((sum, m) => sum + m.coutTotal, 0),
            parType: {}
        };

        maintenances.forEach(m => {
            if (!stats.parType[m.typeMaintenance]) {
                stats.parType[m.typeMaintenance] = {
                    nombre: 0,
                    cout: 0
                };
            }
            stats.parType[m.typeMaintenance].nombre++;
            stats.parType[m.typeMaintenance].cout += m.coutTotal;
        });

        res.json({
            maintenances,
            statistiques: stats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const oldMaintenance = await Maintenance.findById(req.params.id)
            .populate('idMateriaux.materiel');
        
        if (!oldMaintenance) {
            return res.status(404).json({ error: 'Maintenance non trouvée' });
        }

        if (req.body.idMateriaux) {
            for (let item of oldMaintenance.idMateriaux) {
                const materiel = await MaterielMaintenance.findById(item.materiel._id);
                if (materiel) {
                    await materiel.incrementerStock(item.quantiteUtilisee);
                }
            }

            for (let item of req.body.idMateriaux) {
                const materiel = await MaterielMaintenance.findById(item.materiel);
                
                if (!materiel) {
                    return res.status(404).json({ 
                        error: `Matériel non trouvé: ${item.materiel}` 
                    });
                }

                if (!materiel.verifierStock(item.quantiteUtilisee)) {
                    return res.status(400).json({ 
                        error: `Stock insuffisant pour ${materiel.nom}` 
                    });
                }
                
                await materiel.decrementerStock(item.quantiteUtilisee);
            }
        }

        if (req.body.etat && req.body.etat !== oldMaintenance.etat) {
            const vehicule = await Vehicule.findById(oldMaintenance.idVehicule);
            if (vehicule) {
                if (req.body.etat === 'terminée') {
                    vehicule.etat = 'Disponible';
                } else if (req.body.etat === 'en cours') {
                    vehicule.etat = 'En maintenance';
                }
                await vehicule.save();
            }
        }

        const maintenance = await Maintenance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('idVehicule')
        .populate('idMateriaux.materiel');

        res.json(maintenance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deletemaintenance(req, res) {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate('idMateriaux.materiel');
        
        if (!maintenance) {
            return res.status(404).json({ error: 'Maintenance non trouvée' });
        }

        for (let item of maintenance.idMateriaux) {
            const materiel = await MaterielMaintenance.findById(item.materiel._id);
            if (materiel) {
                await materiel.incrementerStock(item.quantiteUtilisee);
            }
        }

        const vehicule = await Vehicule.findById(maintenance.idVehicule);
        if (vehicule && vehicule.etat === 'En maintenance') {
            vehicule.etat = 'Disponible';
            await vehicule.save();
        }

        await Maintenance.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Maintenance supprimée avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCoutsDetailles(req, res) {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate('idVehicule')
            .populate('idMateriaux.materiel');
        
        if (!maintenance) {
            return res.status(404).json({ error: 'Maintenance non trouvée' });
        }

        const details = {
            maintenance: maintenance,
            detailsCouts: {
                mainOeuvre: maintenance.coutMainOeuvre,
                materiel: {
                    total: maintenance.coutMateriel,
                    details: maintenance.idMateriaux.map(item => ({
                        nom: item.materiel.nom,
                        quantite: item.quantiteUtilisee,
                        prixUnitaire: item.materiel.prixUnitaire,
                        sousTotal: item.quantiteUtilisee * item.materiel.prixUnitaire
                    }))
                },
                tva: maintenance.coutTVA,
                total: maintenance.coutTotal
            }
        };

        res.json(details);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    add,
    show,
    showbyId,
    showByVehicule,
    showByType,
    historiqueVehicule,
    update,
    deletemaintenance,
    getCoutsDetailles
};
