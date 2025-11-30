import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Create a new category
router.post('/', categoryController.createCategory);

// List categories (supports pagination and search)
router.get('/', categoryController.getCategories);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;
