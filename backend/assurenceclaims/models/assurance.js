const mongoose = require('mongoose');

const assuranceSchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientAddress: {
    type: String,
    required: false,
    default: "Paris, France"
  },
  clientPhone: {
    type: String,
    required: false,
    default: "+33123456789"
  },
  insuranceType: {
    type: String,
    required: true,
    enum: ['auto', 'health', 'home', 'life', 'travel']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  premiumAmount: {
    type: Number,
    required: true
  },
  coverageDetails: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà avant de le créer
module.exports = mongoose.models.Assurance || mongoose.model('Assurance', assuranceSchema);