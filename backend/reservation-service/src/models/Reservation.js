import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      unique: true,
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
      index: true,
    },
    carModel: {
      type: String,
      required: true,
    },
    carBrand: {
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
      default: 'standard',
    },
    insuranceDetails: {
      coverage: String,
      deductible: Number,
      dailyRate: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalDays: {
      type: Number,
      required: true,
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    insuranceAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    promoCode: {
      type: String,
      default: null,
      index: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    notes: String,
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ clientId: 1, createdAt: -1 });
reservationSchema.index({ startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Reservation', reservationSchema);
