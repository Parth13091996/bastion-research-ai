import { Router } from 'express';
import {
  listNewsletters,
  listPodcasts,
  listWebinars,
  getNewsletter,
  getWebinar,
  getPodcast,
  createNewsletter,
  createWebinar,
  createPodcast,
  updateNewsletter,
  updateWebinar,
  updatePodcast,
  deleteNewsletter,
  deleteWebinar,
  deletePodcast,
} from '../controllers/content.controller';

const router = Router();

// Public routes (no auth required)
router.get('/newsletters', listNewsletters);
router.get('/webinars', listWebinars);
router.get('/podcasts', listPodcasts);
router.get('/newsletters/:id', getNewsletter);
router.get('/webinars/:id', getWebinar);
router.get('/podcasts/:id', getPodcast);

// Admin routes (auth required - will be protected in admin.routes.ts)
router.post('/newsletters', createNewsletter);
router.post('/webinars', createWebinar);
router.post('/podcasts', createPodcast);
router.put('/newsletters/:id', updateNewsletter);
router.put('/webinars/:id', updateWebinar);
router.put('/podcasts/:id', updatePodcast);
router.delete('/newsletters/:id', deleteNewsletter);
router.delete('/webinars/:id', deleteWebinar);
router.delete('/podcasts/:id', deletePodcast);

export default router;

