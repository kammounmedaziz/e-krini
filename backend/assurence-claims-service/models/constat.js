const mongoose = require('mongoose');

const constatSchema = new mongoose.Schema({
    constatNumber: {
        type: String,
        required: true,
        unique: true
    },
    assuranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assurance',
        required: true,
        index: true
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
    incidentType: {
        type: String,
        required: true,
        enum: ['accident', 'theft', 'damage', 'vandalism', 'fire', 'natural_disaster', 'collision', 'other']
    },
    incidentDate: {
        type: Date,
        required: true
    },
    incidentLocation: {
        address: {
            type: String,
            required: true
        },
        city: String,
        country: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    description: {
        type: String,
        required: true
    },
    estimatedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    approvedAmount: {
        type: Number,
        required: false,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'processed', 'closed'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    involvedParties: [{
        name: String,
        contact: String,
        email: String,
        role: {
            type: String,
            enum: ['insured', 'third_party', 'witness', 'police', 'expert']
        }
    }],
    documents: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['photo', 'police_report', 'medical_report', 'invoice', 'estimate', 'witness_statement', 'other']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isAmicable: {
        type: Boolean,
        default: false
    },
    policeReportNumber: {
        type: String,
        required: false
    },
    expertAssessment: {
        expertName: String,
        assessmentDate: Date,
        report: String,
        estimatedCost: Number
    },
    fraudDetection: {
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        flags: [String],
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        notes: String
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    reviewedAt: {
        type: Date,
        required: false
    },
    rejectionReason: {
        type: String,
        required: false
    },
    paymentDetails: {
        method: {
            type: String,
            enum: ['bank_transfer', 'check', 'cash', 'direct_deposit']
        },
        reference: String,
        paidAt: Date,
        amount: Number
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better query performance
constatSchema.index({ userId: 1, status: 1 });
constatSchema.index({ assuranceId: 1 });
constatSchema.index({ incidentDate: -1 });
constatSchema.index({ constatNumber: 1 });
constatSchema.index({ status: 1, priority: 1 });

// Virtual for days since incident
constatSchema.virtual('daysSinceIncident').get(function() {
    const now = new Date();
    const diff = now - this.incidentDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Method to check if claim is within valid timeframe (e.g., 30 days)
constatSchema.methods.isWithinValidTimeframe = function(maxDays = 30) {
    const daysSince = this.daysSinceIncident;
    return daysSince <= maxDays;
};

// Vérifier si le modèle existe déjà avant de le créer
module.exports = mongoose.models.Constat || mongoose.model('Constat', constatSchema);
