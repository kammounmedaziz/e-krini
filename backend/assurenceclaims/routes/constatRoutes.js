const express = require('express');
const router = express.Router();
const Constat = require('../models/constat');

// GET all constats
router.get('/', async (req, res) => {
    try {
        const constats = await Constat.find();
        res.json(constats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single constat
router.get('/:id', async (req, res) => {
    try {
        const constat = await Constat.findById(req.params.id);
        if (!constat) {
            return res.status(404).json({ message: 'Constat not found' });
        }
        res.json(constat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour analyse de risque
router.get('/:id/analyse-risque', async (req, res) => {
    try {
        const constat = await Constat.findById(req.params.id);
        if (!constat) {
            return res.status(404).json({ message: 'Constat not found' });
        }

        const analyseRisque = evaluerRisque(constat);

        res.json({
            constat: constat.constatNumber,
            client: constat.clientName,
            montantEstime: constat.estimatedAmount,
            analyseRisque: {
                scoreRisque: analyseRisque.score,
                niveauRisque: analyseRisque.niveau,
                indicateurs: analyseRisque.indicateurs,
                actionsRecommandees: analyseRisque.actions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function evaluerRisque(constat) {
    let score = 0;
    const indicateurs = [];

    // Indicateurs de risque
    // 1. Montant élevé
    if (constat.estimatedAmount > 10000) {
        score += 30;
        indicateurs.push("Montant anormalement élevé");
    }

    // 2. Description courte
    if (constat.description && constat.description.length < 50) {
        score += 20;
        indicateurs.push("Description trop sommaire");
    }

    // 3. Déclaration tardive
    if (constat.incidentDate) {
        const delaiDeclaration = (new Date() - new Date(constat.incidentDate)) / (1000 * 60 * 60 * 24);
        if (delaiDeclaration > 30) {
            score += 25;
            indicateurs.push("Déclaration tardive");
        }
    }

    // 4. Constat amiable
    if (constat.isAmicable) {
        score -= 10;
        indicateurs.push("Constat amiable - risque réduit");
    }

    // 5. Nombre de parties impliquées
    if (constat.involvedParties && constat.involvedParties.length > 2) {
        score += 15;
        indicateurs.push("Multiples parties impliquées");
    }

    let niveau, actions;
    if (score >= 50) {
        niveau = "ÉLEVÉ";
        actions = ["Expertise approfondie requise", "Vérification documents", "Signalement direction"];
    } else if (score >= 25) {
        niveau = "MOYEN";
        actions = ["Vérification complémentaire", "Contrôle cohérence informations"];
    } else {
        niveau = "FAIBLE";
        actions = ["Traitement standard"];
    }

    return { score, niveau, indicateurs, actions };
}

// ADD new constat
router.post('/', async (req, res) => {
    const constat = new Constat({
        constatNumber: req.body.constatNumber,
        policyNumber: req.body.policyNumber,
        clientName: req.body.clientName,
        incidentType: req.body.incidentType,
        incidentDate: req.body.incidentDate,
        incidentLocation: req.body.incidentLocation,
        description: req.body.description,
        estimatedAmount: req.body.estimatedAmount,
        status: req.body.status,
        involvedParties: req.body.involvedParties,
        documents: req.body.documents,
        isAmicable: req.body.isAmicable
    });

    try {
        const newConstat = await constat.save();
        res.status(201).json(newConstat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE constat
router.put('/:id', async (req, res) => {
    try {
        const constat = await Constat.findById(req.params.id);
        if (!constat) {
            return res.status(404).json({ message: 'Constat not found' });
        }

        // Update fields
        if (req.body.constatNumber) constat.constatNumber = req.body.constatNumber;
        if (req.body.policyNumber) constat.policyNumber = req.body.policyNumber;
        if (req.body.clientName) constat.clientName = req.body.clientName;
        if (req.body.incidentType) constat.incidentType = req.body.incidentType;
        if (req.body.incidentDate) constat.incidentDate = req.body.incidentDate;
        if (req.body.incidentLocation) constat.incidentLocation = req.body.incidentLocation;
        if (req.body.description) constat.description = req.body.description;
        if (req.body.estimatedAmount) constat.estimatedAmount = req.body.estimatedAmount;
        if (req.body.status) constat.status = req.body.status;
        if (req.body.involvedParties) constat.involvedParties = req.body.involvedParties;
        if (req.body.documents) constat.documents = req.body.documents;
        if (req.body.isAmicable !== undefined) constat.isAmicable = req.body.isAmicable;

        const updatedConstat = await constat.save();
        res.json(updatedConstat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE constat
router.delete('/:id', async (req, res) => {
    try {
        const constat = await Constat.findById(req.params.id);
        if (!constat) {
            return res.status(404).json({ message: 'Constat not found' });
        }

        await Constat.findByIdAndDelete(req.params.id);
        res.json({ message: 'Constat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour évaluation préliminaire
router.get('/:id/evaluation-preliminaire', async (req, res) => {
    try {
        const constat = await Constat.findById(req.params.id);
        if (!constat) {
            return res.status(404).json({ message: 'Constat not found' });
        }

        const evaluation = evaluerConstat(constat);

        res.json({
            constat: constat.constatNumber,
            client: constat.clientName,
            typeIncident: constat.incidentType,
            montantEstime: constat.estimatedAmount + "€",
            evaluationPreliminaire: evaluation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fonction d'évaluation préliminaire
function evaluerConstat(constat) {
    const montantEstime = constat.estimatedAmount;

    // Évaluations spécifiques selon le type d'incident
    switch (constat.incidentType) {
        case 'accident':
            return evaluerAccident(montantEstime, constat);
        case 'theft':
            return evaluerVol(montantEstime, constat);
        case 'damage':
            return evaluerDegats(montantEstime, constat);
        case 'medical':
            return evaluerMedical(montantEstime, constat);
        default:
            return evaluerStandard(montantEstime, constat);
    }
}

// Évaluation pour accidents
function evaluerAccident(montant, constat) {
    const franchiseBase = 400;
    const coefficient = constat.isAmicable ? 0.8 : 1.0; // Réduction si constat amiable
    const franchise = franchiseBase * coefficient;
    const estimationBrute = Math.max(0, montant - franchise);

    return {
        estimationBrute: Math.round(estimationBrute) + "€",
        franchise: Math.round(franchise) + "€",
        typeEvaluation: "Accident",
        details: [
            `Franchise accident: ${Math.round(franchise)}€`,
            "Expertise véhicule obligatoire",
            "Délai de traitement: 7-15 jours",
            constat.isAmicable ? "Constat amiable - traitement accéléré" : "Procédure standard"
        ],
        recommandations: [
            "Contrôler permis de conduire",
            "Vérifier assurance tiers",
            "Expertise préalable requise"
        ],
        tauxCouverture: "Jusqu'à 50,000€"
    };
}

// Évaluation pour vols
function evaluerVol(montant, constat) {
    const franchise = montant * 0.10;
    const plafond = 15000;
    const montantPlafonne = Math.min(montant, plafond);
    const estimationBrute = Math.max(0, montantPlafonne - franchise);

    return {
        estimationBrute: Math.round(estimationBrute) + "€",
        franchise: Math.round(franchise) + "€",
        typeEvaluation: "Vol",
        details: [
            "Franchise proportionnelle: 10%",
            "Plafond garantie vol: 15,000€",
            "Déclaration police obligatoire",
            "Justificatifs de propriété requis"
        ],
        recommandations: [
            "Vérifier déclaration de vol",
            "Contrôler factures d'achat",
            "Expertise bijoux/valeurs si > 5,000€"
        ],
        tauxCouverture: "80% après franchise"
    };
}

// Évaluation pour dégâts matériels
function evaluerDegats(montant, constat) {
    const franchise = 200;
    const estimationBrute = Math.max(0, montant - franchise);

    return {
        estimationBrute: Math.round(estimationBrute) + "€",
        franchise: franchise + "€",
        typeEvaluation: "Dégâts matériels",
        details: [
            "Franchise fixe: 200€",
            "Devis réparation obligatoire",
            "Photos des dégâts requises",
            "Expertise si montant > 5,000€"
        ],
        recommandations: [
            "Obtenir 2 devis minimum",
            "Photographier tous les dégâts",
            "Conserver pièces remplacées"
        ],
        tauxCouverture: "100% après franchise"
    };
}

// Évaluation pour frais médicaux
function evaluerMedical(montant, constat) {
    const franchise = 50;
    const estimationBrute = Math.max(0, montant - franchise);

    return {
        estimationBrute: Math.round(estimationBrute) + "€",
        franchise: franchise + "€",
        typeEvaluation: "Frais médicaux",
        details: [
            "Franchise médicale: 50€",
            "Feuilles de soins obligatoires",
            "Ordonnances requises",
            "Délai de carence: 48h"
        ],
        recommandations: [
            "Vérifier feuilles de soins",
            "Contrôler concordance dates",
            "Expert médical si > 2,000€"
        ],
        tauxCouverture: "80% des frais réels"
    };
}

// Évaluation standard
function evaluerStandard(montant, constat) {
    const franchise = 100;
    const estimationBrute = Math.max(0, montant - franchise);

    return {
        estimationBrute: Math.round(estimationBrute) + "€",
        franchise: franchise + "€",
        typeEvaluation: "Standard",
        details: [
            "Franchise standard: 100€",
            "Documentation complète requise",
            "Délai de traitement: 15 jours",
            "Conditions générales applicables"
        ],
        recommandations: [
            "Vérifier complétude dossier",
            "Contrôler éligibilité garantie",
            "Analyser historique client"
        ],
        tauxCouverture: "90% après franchise"
    };
}

// Route pour statistiques des constats
router.get('/stats/tableau-de-bord', async (req, res) => {
    try {
        const stats = await Constat.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$estimatedAmount' }
                }
            }
        ]);

        const typeStats = await Constat.aggregate([
            {
                $group: {
                    _id: '$incidentType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            parStatut: stats,
            parType: typeStats,
            totalConstats: await Constat.countDocuments(),
            constatsAmiables: await Constat.countDocuments({ isAmicable: true })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
