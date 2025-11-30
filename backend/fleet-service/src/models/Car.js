import mongoose from 'mongoose';

const { Schema } = mongoose;

const CarSchema = new Schema({
  nom: { type: String, required: true, trim: true },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true,
  },
  prixParJour: { type: Number, required: true, min: 0 },
  originalPrixParJour: { type: Number },
  matricule: { type: String, required: true, unique: true, index: true, trim: true },
  modele: { type: String, required: true },
  marque: { type: String, required: true },
  disponibilite: { type: Boolean, default: true },
  dernierMaintenance: { type: Date, required: true },
  needsMaintenance: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Keep a consistent original price for seasonal revert
CarSchema.pre('save', function (next) {
  // Ensure original price is preserved for seasonal adjustments
  if (!this.originalPrixParJour && this.prixParJour) {
    this.originalPrixParJour = this.prixParJour;
  }

  // Compute needsMaintenance: dernierMaintenance older than 6 months
  try {
    if (this.dernierMaintenance) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      this.needsMaintenance = this.dernierMaintenance < sixMonthsAgo;
    } else {
      this.needsMaintenance = false;
    }
  } catch (e) {
    // keep default
  }

  next();
});

export default mongoose.models.Car || mongoose.model('Car', CarSchema);
