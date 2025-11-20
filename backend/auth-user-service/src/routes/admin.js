import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    changeUserRole,
    getUserStatistics,
    exportUsersToCSV,
    bulkDeleteUsers,
    bulkUpdateRole,
    bulkBanUsers
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/admin.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/statistics', getUserStatistics);
router.get('/users/export', exportUsersToCSV);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// User status management
router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);
router.put('/users/:userId/role', changeUserRole);

// Bulk operations
router.post('/users/bulk/delete', bulkDeleteUsers);
router.post('/users/bulk/role', bulkUpdateRole);
router.post('/users/bulk/ban', bulkBanUsers);

export default router;
