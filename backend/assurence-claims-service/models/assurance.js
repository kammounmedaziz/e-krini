const mongoose = require('mongoose');

const assuranceSchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true
  },
  insuranceType: {
    type: String,
    required: true,
    enum: ['comprehensive', 'collision', 'liability', 'theft', 'fire', 'third-party']
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
    required: true,
    min: 0
  },
  coverageDetails: {
    type: String,
    required: true
  },
  coverageLimit: {
    type: Number,
    required: false
  },
  deductible: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'check'],
    required: false
  },
  renewalDate: {
    type: Date,
    required: false
  },
  documents: [{
    type: {
      type: String,
      enum: ['policy', 'payment_proof', 'id_card', 'vehicle_registration', 'other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  approvedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assuranceSchema.index({ userId: 1, status: 1 });
assuranceSchema.index({ endDate: 1 });
assuranceSchema.index({ policyNumber: 1 });

// Virtual for checking if policy is expired
assuranceSchema.virtual('isExpired').get(function() {
  return this.endDate < new Date();
});

// Method to check if policy is active
assuranceSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

// Vérifier si le modèle existe déjà avant de le créer
module.exports = mongoose.models.Assurance || mongoose.model('Assurance', assuranceSchema);