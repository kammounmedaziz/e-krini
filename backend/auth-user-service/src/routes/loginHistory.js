import express from 'express';
import {
    getUserLoginHistory,
    getRecentLoginActivity,
    getLoginStatistics,
    clearOldLoginHistory
} from '../controllers/loginHistoryController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/admin.js';

const router = express.Router();

// User routes (protected)
router.get('/my-history', authMiddleware, getRecentLoginActivity);
router.get('/my-history/full', authMiddleware, getUserLoginHistory);

// Admin routes
router.get('/users/:userId/history', authMiddleware, adminMiddleware, getUserLoginHistory);
router.get('/statistics', authMiddleware, adminMiddleware, getLoginStatistics);
router.post('/clear-old', authMiddleware, adminMiddleware, clearOldLoginHistory);

export default router;
