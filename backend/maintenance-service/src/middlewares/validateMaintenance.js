const yup = require('yup');

const validateMaintenance = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            idVehicule: yup.string()
                .required('Le véhicule est requis')
                .matches(/^[0-9a-fA-F]{24}$/, 'ID véhicule invalide'),
            
            idMateriaux: yup.array().of(
                yup.object().shape({
                    materiel: yup.string()
                        .required('ID matériel requis')
                        .matches(/^[0-9a-fA-F]{24}$/, 'ID matériel invalide'),
                    quantiteUtilisee: yup.number()
                        .required('Quantité utilisée requise')
                        .positive('La quantité doit être positive')
                        .integer('La quantité doit être un entier')
                })
            ).min(0, 'Le tableau de matériaux ne peut pas être vide'),
            
            typeMaintenance: yup.string()
                .required('Le type de maintenance est requis')
                .oneOf(
                    ['Préventive', 'Corrective', 'Révision', 'Réparation', 'Vidange', 'Contrôle technique'],
                    'Type de maintenance invalide. Types acceptés: Préventive, Corrective, Révision, Réparation, Vidange, Contrôle technique'
                ),
            
            dateMaintenance: yup.date()
                .required('La date de maintenance est requise')
                .max(new Date(), 'La date ne peut pas être dans le futur'),
            
            coutMainOeuvre: yup.number()
                .required('Le coût de main d\'œuvre est requis')
                .min(0, 'Le coût doit être positif')
                .max(100000, 'Le coût ne peut pas dépasser 100000'),
            
            etat: yup.string()
                .oneOf(
                    ['planifiée', 'en cours', 'terminée', 'annulée'], 
                    'État invalide. États acceptés: planifiée, en cours, terminée, annulée'
                ),
            
            description: yup.string()
                .max(500, 'La description ne peut pas dépasser 500 caractères')
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: err.errors 
            });
        }
        res.status(400).json({ error: err.message });
    }
};


const validateMaintenanceUpdate = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            idVehicule: yup.string()
                .matches(/^[0-9a-fA-F]{24}$/, 'ID véhicule invalide'),
            
            idMateriaux: yup.array().of(
                yup.object().shape({
                    materiel: yup.string()
                        .required('ID matériel requis')
                        .matches(/^[0-9a-fA-F]{24}$/, 'ID matériel invalide'),
                    quantiteUtilisee: yup.number()
                        .required('Quantité utilisée requise')
                        .positive('La quantité doit être positive')
                        .integer('La quantité doit être un entier')
                })
            ),
            
            typeMaintenance: yup.string()
                .oneOf(
                    ['Préventive', 'Corrective', 'Révision', 'Réparation', 'Vidange', 'Contrôle technique'],
                    'Type de maintenance invalide'
                ),
            
            dateMaintenance: yup.date()
                .max(new Date(), 'La date ne peut pas être dans le futur'),
            
            coutMainOeuvre: yup.number()
                .min(0, 'Le coût doit être positif')
                .max(100000, 'Le coût ne peut pas dépasser 100000'),
            
            etat: yup.string()
                .oneOf(['planifiée', 'en cours', 'terminée', 'annulée'], 'État invalide'),
            
            description: yup.string()
                .max(500, 'La description ne peut pas dépasser 500 caractères')
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: err.errors 
            });
        }
        res.status(400).json({ error: err.message });
    }
};

const validateMateriel = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            nom: yup.string()
                .required('Le nom est requis')
                .min(3, 'Le nom doit contenir au moins 3 caractères')
                .max(100, 'Le nom ne peut pas dépasser 100 caractères')
                .trim(),
            
            quantiteDisponible: yup.number()
                .required('La quantité disponible est requise')
                .min(0, 'La quantité ne peut pas être négative')
                .max(999999, 'La quantité ne peut pas dépasser 999999')
                .integer('La quantité doit être un entier'),
            
            prixUnitaire: yup.number()
                .required('Le prix unitaire est requis')
                .min(0, 'Le prix doit être positif')
                .max(1000000, 'Le prix ne peut pas dépasser 1000000'),
            
            reference: yup.string()
                .trim(),
            
            categorie: yup.string()
                .oneOf(
                    ['Pièce mécanique', 'Électrique', 'Carrosserie', 'Pneumatique', 'Fluide', 'Accessoire', 'Autre'],
                    'Catégorie invalide. Catégories acceptées: Pièce mécanique, Électrique, Carrosserie, Pneumatique, Fluide, Accessoire, Autre'
                ),
            
            seuilAlerte: yup.number()
                .min(0, 'Le seuil d\'alerte doit être positif')
                .integer('Le seuil doit être un entier'),
            
            description: yup.string()
                .max(300, 'La description ne peut pas dépasser 300 caractères')
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: err.errors 
            });
        }
        res.status(400).json({ error: err.message });
    }
};
const validateReapprovisionnement = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            quantite: yup.number()
                .required('La quantité est requise')
                .positive('La quantité doit être positive')
                .integer('La quantité doit être un entier')
                .max(999999, 'La quantité ne peut pas dépasser 999999')
        });

        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: err.errors 
            });
        }
        res.status(400).json({ error: err.message });
    }
};
module.exports = {
    validateMaintenance,
    validateMaintenanceUpdate,validateMateriel,
    validateReapprovisionnement
};
