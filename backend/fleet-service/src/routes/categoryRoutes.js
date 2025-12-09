import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authMiddleware, authorize } from '../middlewares/auth.js';

const router = express.Router();

// List categories (public access)
router.get('/', categoryController.getCategories);

// Get single category (public access)
router.get('/:id', categoryController.getCategoryById);

// Create a new category (admin/agency only)
router.post('/', authMiddleware, authorize('admin', 'agency'), categoryController.createCategory);

// Update category (admin/agency only)
router.put('/:id', authMiddleware, authorize('admin', 'agency'), categoryController.updateCategory);

// Delete category (admin/agency only)
router.delete('/:id', authMiddleware, authorize('admin', 'agency'), categoryController.deleteCategory);

export default router;
