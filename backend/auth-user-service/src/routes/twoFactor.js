import express from 'express';
import {
    enable2FA,
    verify2FASetup,
    disable2FA,
    verify2FAToken,
    get2FAStatus,
    regenerateBackupCodes
} from '../controllers/twoFactorController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/enable', enable2FA);
router.post('/verify-setup', verify2FASetup);
router.post('/disable', disable2FA);
router.post('/verify', verify2FAToken);
router.get('/status', get2FAStatus);
router.post('/regenerate-backup-codes', regenerateBackupCodes);

export default router;
