import { Router } from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import {
  createResearch,
  createNewsletter,
  createPodcast,
  createWebinar,
  updateResearch,
  updateNewsletter,
  updateWebinar,
  updatePodcast,
  deleteNewsletter,
  deleteWebinar,
  deletePodcast,
  deleteResearch,
  getNewsletter,
  getWebinar,
  getPodcast,
  getResearch,
  listResearch,
  listNewsletters,
  listMailchimpNewsletters,
  listWebinars,
  listPodcasts,
  getMailchimpNewsletter,
  createTestimonial,
  listTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/content.controller';
import { getContactRecipientEmail, updateContactRecipientEmail, getRecommendationsSpreadsheetSetting, updateRecommendationsSpreadsheetUrl, uploadRecommendationsSpreadsheet, getRecommendationsGsheetSetting, updateRecommendationsGsheetSetting } from '../controllers/settings.controller';
import multer from 'multer';

const router = Router();
const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_DOC_FILE_SIZE || 20 * 1024 * 1024),
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only CSV or XLSX files are allowed'));
  },
});

// Example protected admin route
router.get('/dashboard', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard' });
});

// Analytics summary for admin dashboard
router.get('/analytics/summary', protect, admin, getAnalyticsSummary);

// Settings: Contact recipient email
router.get('/settings/contact-email', protect, admin, getContactRecipientEmail);
router.put('/settings/contact-email', protect, admin, updateContactRecipientEmail);

// Settings: Recommendations spreadsheet (URL or uploaded file)
router.get('/settings/recommendations-sheet', protect, admin, getRecommendationsSpreadsheetSetting);
router.put('/settings/recommendations-sheet', protect, admin, updateRecommendationsSpreadsheetUrl);
router.post('/settings/recommendations-sheet/upload', protect, admin, uploadMem.single('file'), uploadRecommendationsSpreadsheet);

// Settings: Google Sheets (ID + Range)
router.get('/settings/recommendations-gsheet', protect, admin, getRecommendationsGsheetSetting);
router.put('/settings/recommendations-gsheet', protect, admin, updateRecommendationsGsheetSetting);

// Content management - Newsletters
router.get('/content/research', protect, admin, listResearch);
router.get('/content/research/:id', protect, admin, getResearch);
router.post('/content/research', protect, admin, createResearch);
router.put('/content/research/:id', protect, admin, updateResearch);
router.delete('/content/research/:id', protect, admin, deleteResearch);

// Content management - Newsletters
router.get('/content/newsletters', protect, admin, listNewsletters);
router.get('/content/newsletters/:id', protect, admin, getNewsletter);
router.post('/content/newsletters', protect, admin, createNewsletter);
router.put('/content/newsletters/:id', protect, admin, updateNewsletter);
router.delete('/content/newsletters/:id', protect, admin, deleteNewsletter);
router.get('/content/mailchimp/newsletters', protect, admin, listMailchimpNewsletters);
router.get('/content/mailchimp/newsletters/:id', protect, admin, getMailchimpNewsletter);

// Content management - Webinars
router.get('/content/webinars', protect, admin, listWebinars);
router.get('/content/webinars/:id', protect, admin, getWebinar);
router.post('/content/webinars', protect, admin, createWebinar);
router.put('/content/webinars/:id', protect, admin, updateWebinar);
router.delete('/content/webinars/:id', protect, admin, deleteWebinar);

// Content management - Podcasts
router.get('/content/podcasts', protect, admin, listPodcasts);
router.get('/content/podcasts/:id', protect, admin, getPodcast);
router.post('/content/podcasts', protect, admin, createPodcast);
router.put('/content/podcasts/:id', protect, admin, updatePodcast);
router.delete('/content/podcasts/:id', protect, admin, deletePodcast);

// Content management - Testimonials
router.get('/content/testimonials', protect, admin, listTestimonials);
router.get('/content/testimonials/:id', protect, admin, getTestimonial);
router.post('/content/testimonials', protect, admin, createTestimonial);
router.put('/content/testimonials/:id', protect, admin, updateTestimonial);
router.delete('/content/testimonials/:id', protect, admin, deleteTestimonial);

export default router;
