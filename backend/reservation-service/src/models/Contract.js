import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    carId: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    insuranceType: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'comprehensive'],
      required: true,
    },
    terms: {
      rentalPeriod: String,
      insuranceCoverage: String,
      deductible: Number,
      dailyRate: Number,
      totalAmount: Number,
      depositAmount: Number,
      paymentTerms: String,
      cancellationPolicy: String,
      lateReturnFee: {
        type: Number,
        default: 50,
        description: 'Fee per day for late return',
      },
      fuelPolicy: {
        type: String,
        enum: ['full-to-full', 'full-to-empty'],
        default: 'full-to-full',
      },
      mileageLimit: {
        type: Number,
        default: null,
        description: 'Null means unlimited mileage',
      },
      excessCharge: {
        type: Number,
        default: 0.25,
        description: 'Charge per km over the limit',
      },
    },
    rules: [
      {
        title: String,
        description: String,
        category: {
          type: String,
          enum: ['vehicle-condition', 'fuel', 'mileage', 'driving', 'smoking', 'pets', 'damage', 'payment'],
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'signed', 'active', 'completed', 'terminated'],
      default: 'draft',
    },
    signedAt: Date,
    completedAt: Date,
    pdfUrl: String,
    pdfFileName: String,
    clientSignature: {
      data: Buffer,
      timestamp: Date,
    },
    agencySignature: {
      data: Buffer,
      timestamp: Date,
    },
    // Versioning: keep snapshots of previous contract versions
    versions: [
      {
        versionAt: Date,
        snapshot: {},
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches courantes
contractSchema.index({ clientId: 1, createdAt: -1 });
contractSchema.index({ status: 1 });

export default mongoose.model('Contract', contractSchema);
