import express from 'express';
import {validate,registerValidation,loginValidation} from '../middlewares/validations.js';
import { register, login, refreshToken, logout, enableFaceAuth, loginWithFace } from '../controllers/authController.js';

//public routes
const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/enable-face-auth', enableFaceAuth);
router.post('/login-face', loginWithFace);

export default router;
