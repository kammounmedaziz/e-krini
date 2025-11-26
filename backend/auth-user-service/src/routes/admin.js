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
import {
    getAllAgencies,
    getAgencyById,
    approveAgency,
    rejectAgency,
    suspendAgency,
    deleteAgency,
    getAgencyStatistics
} from '../controllers/adminAgencyController.js';
import {
    getAllInsuranceCompanies,
    getInsuranceById,
    approveInsurance,
    rejectInsurance,
    suspendInsurance,
    deleteInsurance,
    getInsuranceStatistics
} from '../controllers/adminInsuranceController.js';
import { exportStatisticsPDF } from '../utils/pdfExport.js';
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

// Export comprehensive statistics as PDF
router.get('/statistics/export-pdf', exportStatisticsPDF);

// User status management
router.post('/users/bulk/ban', bulkBanUsers);
router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);
router.put('/users/:userId/role', changeUserRole);

// Bulk operations
router.post('/users/bulk/delete', bulkDeleteUsers);
router.post('/users/bulk/role', bulkUpdateRole);

// Agency management routes
router.get('/agencies', getAllAgencies);
router.get('/agencies/statistics', getAgencyStatistics);
router.get('/agencies/:agencyId', getAgencyById);
router.post('/agencies/:agencyId/approve', approveAgency);
router.post('/agencies/:agencyId/reject', rejectAgency);
router.post('/agencies/:agencyId/suspend', suspendAgency);
router.delete('/agencies/:agencyId', deleteAgency);

// Insurance management routes
router.get('/insurance', getAllInsuranceCompanies);
router.get('/insurance/statistics', getInsuranceStatistics);
router.get('/insurance/:insuranceId', getInsuranceById);
router.post('/insurance/:insuranceId/approve', approveInsurance);
router.post('/insurance/:insuranceId/reject', rejectInsurance);
router.post('/insurance/:insuranceId/suspend', suspendInsurance);
router.delete('/insurance/:insuranceId', deleteInsurance);

export default router;
