
const mongo = require('mongoose');
const Schema = mongo.Schema;

const MaintenanceSchema = new Schema({
    idVehicule: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: [true, 'Le véhicule est requis']
    },
    idMateriaux: [{
        materiel: {
            type: Schema.Types.ObjectId,
            ref: 'MaterielMaintenance',
            required: true
        },
        quantiteUtilisee: {
            type: Number,
            required: [true, 'La quantité utilisée est requise'],
            min: [0, 'La quantité doit être positive']
        }
    }],
    typeMaintenance: {
        type: String,
        required: [true, 'Le type de maintenance est requis'],
        enum: {
            values: ['Preventive', 'Corrective', 'Révision', 'Réparation', 'Vidange', 'Contrôle technique'],
            message: 'Type de maintenance invalide'
        }
    },
    dateMaintenance: {
        type: Date,
        required: [true, 'La date de maintenance est requise'],
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'La date de maintenance ne peut pas être dans le futur'
        }
    },
    coutMainOeuvre: {
        type: Number,
        required: [true, 'Le coût de main d\'œuvre est requis'],
        min: [0, 'Le coût doit être positif'],
        max: [100000, 'Le coût ne peut pas dépasser 100000']
    },
    etat: {
        type: String,
        enum: ['planifiée', 'en cours', 'terminée', 'annulée'],
        default: 'planifiée'
    },
    coutMateriel: {
        type: Number,
        default: 0
    },
    coutTVA: {
        type: Number,
        default: 0
    },
    coutTotal: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    }
}, {
    timestamps: true
});

MaintenanceSchema.pre('save', async function(next) {
    try {
        let coutMateriel = 0;
        
        if (this.idMateriaux && this.idMateriaux.length > 0) {
            const MaterielMaintenance = mongo.model('MaterielMaintenance');
            
            for (let item of this.idMateriaux) {
                const materiel = await MaterielMaintenance.findById(item.materiel);
                if (materiel) {
                    coutMateriel += materiel.prixUnitaire * item.quantiteUtilisee;
                }
            }
        }
        
        this.coutMateriel = coutMateriel;
        const sousTotal = this.coutMainOeuvre + coutMateriel;
        this.coutTVA = sousTotal * 0.19;
        this.coutTotal = sousTotal + this.coutTVA;
        
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongo.model('Maintenance', MaintenanceSchema);