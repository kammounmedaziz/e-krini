import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    optional: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
