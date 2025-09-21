import { Router } from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import {
  createNewsletter,
  createPodcast,
  createWebinar,
} from '../controllers/content.controller';
import { getContactRecipientEmail, updateContactRecipientEmail } from '../controllers/settings.controller';

const router = Router();

// Example protected admin route
router.get('/dashboard', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard' });
});

// Analytics summary for admin dashboard
router.get('/analytics/summary', protect, admin, getAnalyticsSummary);

// Settings: Contact recipient email
router.get('/settings/contact-email', protect, admin, getContactRecipientEmail);
router.put('/settings/contact-email', protect, admin, updateContactRecipientEmail);

// Content management
router.post('/newsletters', protect, admin, createNewsletter);
router.post('/webinars', protect, admin, createWebinar);
router.post('/podcasts', protect, admin, createPodcast);

export default router;
