import express from 'express';
import {
    requestPasswordReset,
    resetPassword,
    changePassword
} from '../controllers/passwordResetController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/request-reset', requestPasswordReset);
router.post('/reset', resetPassword);

// Protected routes
router.post('/change', authMiddleware, changePassword);

export default router;
