import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Le code du coupon est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [4, 'Le code doit contenir au moins 4 caractères'],
      maxlength: [20, 'Le code ne peut pas dépasser 20 caractères'],
    },
    type: {
      type: String,
      required: [true, 'Le type est obligatoire'],
      enum: {
        values: ['percentage', 'amount'],
        message: 'Le type doit être "percentage" ou "amount"',
      },
    },
    value: {
      type: Number,
      required: [true, 'La valeur est obligatoire'],
      min: [0, 'La valeur doit être positive'],
      validate: {
        validator: function (v) {
          if (this.type === 'percentage') {
            return v >= 0 && v <= 100;
          }
          return v >= 0;
        },
        message: 'Pour un pourcentage, la valeur doit être entre 0 et 100',
      },
    },
    date_debut: {
      type: Date,
      required: [true, 'La date de début est obligatoire'],
    },
    date_fin: {
      type: Date,
      required: [true, 'La date de fin est obligatoire'],
      validate: {
        validator: function (v) {
          return v > this.date_debut;
        },
        message: 'La date de fin doit être après la date de début',
      },
    },
    max_utilisation: {
      type: Number,
      default: 0,
      min: [0, 'Le nombre maximum d\'utilisations doit être positif'],
    },
    max_utilisation_user: {
      type: Number,
      default: 1,
      min: [0, 'Le nombre maximum d\'utilisations par utilisateur doit être positif'],
    },
    utilises: {
      type: Number,
      default: 0,
      min: [0, 'Le nombre d\'utilisations ne peut pas être négatif'],
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances
couponSchema.index({ code: 1 });
couponSchema.index({ actif: 1, date_debut: 1, date_fin: 1 });

// Virtuel pour vérifier si le coupon est valide
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  const isDateValid = now >= this.date_debut && now <= this.date_fin;
  const isUsageValid =
    this.max_utilisation === 0 || this.utilises < this.max_utilisation;
  return this.actif && isDateValid && isUsageValid;
});

// Virtuel pour les utilisations restantes
couponSchema.virtual('utilisations_restantes').get(function () {
  if (this.max_utilisation === 0) return Infinity;
  return Math.max(0, this.max_utilisation - this.utilises);
});

// Méthode pour vérifier si un utilisateur peut utiliser le coupon
couponSchema.methods.canBeUsedByUser = async function (userId) {
  if (!this.isValid) return false;

  // Si pas de limite par utilisateur
  if (this.max_utilisation_user === 0) return true;

  // Vérifier l'historique d'utilisation de l'utilisateur
  // Cette logique nécessitera une collection séparée pour tracker les utilisations
  const Utilisation = mongoose.model('CouponUtilisation');
  const count = await Utilisation.countDocuments({
    coupon_id: this._id,
    user_id: userId,
  });

  return count < this.max_utilisation_user;
};

// Méthode pour appliquer le coupon à un montant
couponSchema.methods.applyDiscount = function (amount) {
  if (!this.isValid) {
    throw new Error('Ce coupon n\'est pas valide');
  }

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
  } else if (this.type === 'amount') {
    discount = Math.min(this.value, amount); // Ne pas dépasser le montant total
  }

  return {
    montant_original: amount,
    reduction: discount,
    montant_final: Math.max(0, amount - discount),
    type_reduction: this.type,
    valeur_reduction: this.value,
  };
};

// Middleware avant la sauvegarde
couponSchema.pre('save', function (next) {
  // S'assurer que le code est en majuscules
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;