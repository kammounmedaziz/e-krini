import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la promotion est obligatoire'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
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
    categorie_voiture: {
      type: String,
      enum: {
        values: ['SUV', 'Économique', 'Luxe', 'Berline', 'Compacte', 'Utilitaire', ''],
        message: 'Catégorie de voiture invalide',
      },
      default: '',
    },
    id_voiture: {
      type: Number,
      default: null,
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
    jour_specifique: {
      type: String,
      enum: {
        values: [
          '',
          'Lundi',
          'Mardi',
          'Mercredi',
          'Jeudi',
          'Vendredi',
          'Samedi',
          'Dimanche',
          'Weekend',
          'Vacances',
          'JoursFeries',
        ],
        message: 'Jour spécifique invalide',
      },
      default: '',
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
promotionSchema.index({ actif: 1, date_debut: 1, date_fin: 1 });
promotionSchema.index({ categorie_voiture: 1 });
promotionSchema.index({ id_voiture: 1 });

// Virtuel pour vérifier si la promotion est valide
promotionSchema.virtual('isValid').get(function () {
  const now = new Date();
  const isDateValid = now >= this.date_debut && now <= this.date_fin;
  return this.actif && isDateValid;
});

// Méthode pour vérifier si la promotion s'applique à une voiture
promotionSchema.methods.appliesTo = function (voiture) {
  if (!this.isValid) return false;

  // Vérifier la catégorie si spécifiée
  if (this.categorie_voiture && voiture.categorie !== this.categorie_voiture) {
    return false;
  }

  // Vérifier l'ID de la voiture si spécifié
  if (this.id_voiture && voiture.id !== this.id_voiture) {
    return false;
  }

  // Vérifier le jour spécifique si défini
  if (this.jour_specifique) {
    return this.checkDayMatch();
  }

  return true;
};

// Méthode pour vérifier si le jour actuel correspond
promotionSchema.methods.checkDayMatch = function () {
  if (!this.jour_specifique) return true;

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Dimanche, 6 = Samedi

  const joursFrancais = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];

  switch (this.jour_specifique) {
    case 'Weekend':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case joursFrancais[dayOfWeek]:
      return true;
    case 'Vacances':
    case 'JoursFeries':
      // Cette logique nécessiterait une liste de jours fériés/vacances
      return false; // À implémenter selon les besoins
    default:
      return true;
  }
};

// Méthode pour appliquer la réduction
promotionSchema.methods.applyDiscount = function (amount) {
  if (!this.isValid) {
    throw new Error('Cette promotion n\'est pas valide');
  }

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
  } else if (this.type === 'amount') {
    discount = Math.min(this.value, amount);
  }

  return {
    montant_original: amount,
    reduction: discount,
    montant_final: Math.max(0, amount - discount),
    type_reduction: this.type,
    valeur_reduction: this.value,
    promotion_nom: this.nom,
  };
};

// Méthode statique pour trouver les promotions applicables
promotionSchema.statics.findApplicablePromotions = async function (voiture) {
  const now = new Date();

  return this.find({
    actif: true,
    date_debut: { $lte: now },
    date_fin: { $gte: now },
    $or: [
      { categorie_voiture: voiture.categorie },
      { id_voiture: voiture.id },
      { categorie_voiture: '', id_voiture: null },
    ],
  });
};

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;