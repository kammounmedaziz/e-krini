const mongo = require('mongoose');
const Schema = mongo.Schema;

const VehiculeSchema = new Schema({
    immatriculation: {
        type: String,
        required: [true, 'L\'immatriculation est requise'],
        unique: true,
        trim: true,
        uppercase: true
    },
    marque: {
        type: String,
        required: [true, 'La marque est requise'],
        trim: true
    },
    modele: {
        type: String,
        required: [true, 'Le modèle est requis'],
        trim: true
    },
    annee: {
        type: Number,
        required: [true, 'L\'année est requise'],
        min: [1900, 'Année invalide'],
        max: [new Date().getFullYear() + 1, 'Année invalide']
    },
    kilometrage: {
        type: Number,
        default: 0,
        min: [0, 'Le kilométrage ne peut pas être négatif']
    },
    typeCarburant: {
        type: String,
        enum: ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL'],
        required: true
    },
    etat: {
        type: String,
        enum: ['En service', 'En maintenance', 'Hors service', 'Disponible'],
        default: 'Disponible'
    }
}, {
    timestamps: true
});

VehiculeSchema.index({ immatriculation: 1 });

module.exports = mongo.model('Vehicule', VehiculeSchema);