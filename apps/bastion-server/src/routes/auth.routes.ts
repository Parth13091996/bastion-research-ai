import { Router } from 'express';
import {
    signUp,
    signIn,
    forgotPassword,
    googleOAuthStart,
    googleOAuthCallback,
    completeGoogleProfile
} from '../controllers/auth.controller';

const router = Router();

// Standard Authentication
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);

// Google OAuth Routes
router.get('/google', googleOAuthStart);
router.get('/google/callback', googleOAuthCallback);
router.post('/google/complete-profile', completeGoogleProfile);

export default router;
