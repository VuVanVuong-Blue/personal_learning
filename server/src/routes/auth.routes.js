import express from 'express';
import { register, login, googleLogin, getMe, forgotPassword } from '../controllers/auth.controller.js';
// Import middleware protection later

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
// router.get('/me', protect, getMe);

export default router;
