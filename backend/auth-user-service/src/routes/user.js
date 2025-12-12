import express from 'express';
import { getUserProfile, updateUserProfile, uploadProfilePicture, deleteProfilePicture } from '../controllers/userController.js';
import { authMiddleware as authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Alias /me to /profile for compatibility
router.get('/me', getUserProfile);
router.put('/me', updateUserProfile);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/profile/picture', uploadProfilePicture);
router.delete('/profile/picture', deleteProfilePicture);

export default router;
