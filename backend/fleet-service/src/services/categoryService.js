import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Car from '../models/Car.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createCategory = async (data) => {
  // Check if category with same name already exists (case-insensitive)
  const existing = await Category.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
  if (existing) {
    throw new Error('Category with this name already exists');
  }
  const category = new Category(data);
  await category.save();
  return category;
};

const getCategories = async (query = {}) => {
  // Pagination
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Filters
  const filters = {};
  if (query.search) {
    filters.name = new RegExp(query.search, 'i');
  }

  const [total, items] = await Promise.all([
    Category.countDocuments(filters),
    Category.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
    items,
  };
};

const getCategoryById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return Category.findById(id);
};

const updateCategory = async (id, payload) => {
  if (!isValidObjectId(id)) throw new Error('Invalid id');

  const category = await Category.findById(id);
  if (!category) return null;

  // If updating name, check for duplicates (case-insensitive, but not itself)
  if (payload.name && payload.name !== category.name) {
    const existing = await Category.findOne({
      name: new RegExp(`^${payload.name}$`, 'i'),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error('Category with this name already exists');
    }
  }

  Object.assign(category, payload);
  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  if (!isValidObjectId(id)) throw new Error('Invalid id');

  const category = await Category.findById(id);
  if (!category) return null;

  // Check if any cars use this category
  const carCount = await Car.countDocuments({ category: id, isDeleted: false });
  if (carCount > 0) {
    throw new Error(`Cannot delete category: ${carCount} car(s) still use this category`);
  }

  await Category.findByIdAndDelete(id);
  return category;
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
