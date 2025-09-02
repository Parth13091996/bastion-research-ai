import { Router } from 'express';
import {
    register,
    completeProfile,
    signIn,
    forgotPassword,
    getMe,
    logout
} from '../controllers/auth.controller';

const router = Router();

// Standard Authentication
router.post('/register', register);
router.post('/complete-profile', completeProfile);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);

// User session routes
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
