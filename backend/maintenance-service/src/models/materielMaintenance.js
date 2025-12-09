const mongo = require('mongoose');
const Schema = mongo.Schema;

const MaterielMaintenanceSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
        unique: true,
        trim: true
    },
    quantiteDisponible: {
        type: Number,
        required: [true, 'La quantité disponible est requise'],
        min: [0, 'La quantité ne peut pas être négative'],
        max: [999999, 'La quantité ne peut pas dépasser 999999'],
        default: 0
    },
    prixUnitaire: {
        type: Number,
        required: [true, 'Le prix unitaire est requis'],
        min: [0, 'Le prix doit être positif'],
        max: [1000000, 'Le prix ne peut pas dépasser 1000000']
    },
    reference: {
        type: String,
        trim: true
    },
    categorie: {
        type: String,
        enum: ['Pièce mécanique', 'Électrique', 'Carrosserie', 'Pneumatique', 'Fluide', 'Accessoire', 'Autre'],
        default: 'Autre'
    },
    seuilAlerte: {
        type: Number,
        default: 10,
        min: [0, 'Le seuil d\'alerte doit être positif']
    },
    description: {
        type: String,
        maxlength: [300, 'La description ne peut pas dépasser 300 caractères']
    }
}, {
    timestamps: true
});

MaterielMaintenanceSchema.index({ nom: 1 });
MaterielMaintenanceSchema.index({ categorie: 1 });

MaterielMaintenanceSchema.methods.verifierStock = function(quantiteDemandee) {
    return this.quantiteDisponible >= quantiteDemandee;
};

MaterielMaintenanceSchema.methods.decrementerStock = async function(quantite) {
    if (!this.verifierStock(quantite)) {
        throw new Error(`Stock insuffisant pour ${this.nom}. Disponible: ${this.quantiteDisponible}, Demandé: ${quantite}`);
    }
    this.quantiteDisponible -= quantite;
    return await this.save();
};

MaterielMaintenanceSchema.methods.incrementerStock = async function(quantite) {
    this.quantiteDisponible += quantite;
    return await this.save();
};

MaterielMaintenanceSchema.virtual('enAlerte').get(function() {
    return this.quantiteDisponible <= this.seuilAlerte;
});

module.exports = mongo.model('MaterielMaintenance', MaterielMaintenanceSchema);