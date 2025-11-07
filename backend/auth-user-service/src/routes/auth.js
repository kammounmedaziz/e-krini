import express from 'express';
import {validate,registerValidation,loginValidation} from '../middlewares/validationMiddleware.js';
import { register, login, refreshToken, logout } from '../controllers/authController.js';

//public routes
const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
