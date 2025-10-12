import { Router } from 'express';
import {
  listResearch,
  listNewsletters,
  listMailchimpNewsletters,
  listPodcasts,
  listWebinars,
  getResearch,
  getNewsletter,
  getMailchimpNewsletter,
  getWebinar,
  getPodcast,
  createResearch,
  createNewsletter,
  createWebinar,
  createPodcast,
  updateResearch,
  updateNewsletter,
  updateWebinar,
  updatePodcast,
  deleteResearch,
  deleteNewsletter,
  deleteWebinar,
  deletePodcast,
  createTestimonial,
  listTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/content.controller';

const router = Router();

// Public routes (no auth required)
router.get('/research', listResearch);
router.get('/newsletters', listNewsletters);
router.get('/mailchimp/newsletters', listMailchimpNewsletters);
router.get('/webinars', listWebinars);
router.get('/podcasts', listPodcasts);
router.get('/testimonials', listTestimonials);
router.get('/research/:id', getResearch);
router.get('/newsletters/:id', getNewsletter);
router.get('/mailchimp/newsletters/:id', getMailchimpNewsletter);
router.get('/webinars/:id', getWebinar);
router.get('/podcasts/:id', getPodcast);
router.get('/testimonials/:id', getTestimonial);

// Admin routes (auth required - will be protected in admin.routes.ts)
router.post('/research', createResearch);
router.post('/newsletters', createNewsletter);
router.post('/webinars', createWebinar);
router.post('/podcasts', createPodcast);
router.post('/testimonials', createTestimonial);
router.put('/research/:id', updateResearch);
router.put('/newsletters/:id', updateNewsletter);
router.put('/webinars/:id', updateWebinar);
router.put('/podcasts/:id', updatePodcast);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/research/:id', deleteResearch);
router.delete('/newsletters/:id', deleteNewsletter);
router.delete('/webinars/:id', deleteWebinar);
router.delete('/podcasts/:id', deletePodcast);
router.delete('/testimonials/:id', deleteTestimonial);

export default router;
