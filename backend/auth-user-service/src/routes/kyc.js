import express from 'express';
import { submitKyc, getKycStatusController, deleteKycDocument, getPendingKyc, getKycDetails, reviewKyc, getKycStats } from '../controllers/kycController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/admin.js';
import { uploadKycDocuments } from '../middlewares/upload.js';

const router = express.Router();

// User routes
router.post('/submit', authMiddleware, uploadKycDocuments, submitKyc);
router.get('/status', authMiddleware, getKycStatusController);
router.delete('/documents/:id', authMiddleware, deleteKycDocument);

// Admin routes
router.get('/admin/pending', authMiddleware, adminMiddleware, getPendingKyc);
router.get('/admin/:userId', authMiddleware, adminMiddleware, getKycDetails);
router.post('/admin/:userId/review', authMiddleware, adminMiddleware, reviewKyc);
router.get('/admin/stats', authMiddleware, adminMiddleware, getKycStats);

export default router;