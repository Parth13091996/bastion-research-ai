import { Router } from 'express';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

// Example protected admin route
router.get('/dashboard', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard' });
});

export default router;
