import mongoose from 'mongoose';
import categoryService from '../services/categoryService.js';
import { createCategorySchema, updateCategorySchema } from '../validation/categoryValidation.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createCategory = async (req, res, next) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const category = await categoryService.createCategory(value);
    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories(req.query);
    return res.json({ success: true, message: 'Categories fetched', data: result });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const category = await categoryService.getCategoryById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.json({ success: true, message: 'Category fetched', data: category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const category = await categoryService.updateCategory(id, value);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.json({ success: true, message: 'Category updated', data: category });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const category = await categoryService.deleteCategory(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.json({ success: true, message: 'Category deleted', data: category });
  } catch (err) {
    if (err.message.includes('Cannot delete category')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
