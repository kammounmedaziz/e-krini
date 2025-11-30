import mongoose from 'mongoose';

const couponUtilisationSchema = new mongoose.Schema(
  {
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    reservation_id: {
      type: String,
      required: true,
    },
    montant_original: {
      type: Number,
      required: true,
    },
    montant_reduction: {
      type: Number,
      required: true,
    },
    montant_final: {
      type: Number,
      required: true,
    },
    date_utilisation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
couponUtilisationSchema.index({ coupon_id: 1, user_id: 1 });
couponUtilisationSchema.index({ user_id: 1 });
couponUtilisationSchema.index({ reservation_id: 1 });

const CouponUtilisation = mongoose.model('CouponUtilisation', couponUtilisationSchema);

export default CouponUtilisation;