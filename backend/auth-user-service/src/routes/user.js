import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';]
//protected routes
const router = express.Router();

router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;
