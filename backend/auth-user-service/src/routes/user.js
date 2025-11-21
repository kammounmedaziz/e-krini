import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authMiddleware as authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;
