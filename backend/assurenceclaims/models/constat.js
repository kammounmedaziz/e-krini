const mongoose = require('mongoose');

const constatSchema = new mongoose.Schema({
    constatNumber: {
        type: String,
        required: true,
        unique: true
    },
    policyNumber: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    incidentType: {
        type: String,
        required: true,
        enum: ['accident', 'theft', 'damage', 'medical', 'other']
    },
    incidentDate: {
        type: Date,
        required: true
    },
    incidentLocation: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    estimatedAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'processed', 'closed'],
        default: 'draft'
    },
    involvedParties: [{
        name: String,
        contact: String,
        role: String // 'insured', 'third_party', 'witness'
    }],
    documents: [{
        name: String,
        url: String,
        type: { type: String } // 'photo', 'report', 'invoice', 'other'
    }],
    isAmicable: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Vérifier si le modèle existe déjà avant de le créer
module.exports = mongoose.models.Constat || mongoose.model('Constat', constatSchema);
