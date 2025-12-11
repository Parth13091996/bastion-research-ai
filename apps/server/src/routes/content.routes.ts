import { Router } from "express";
import {
  createNewsletter,
  createPodcast,
  createTestimonial,
  createWebinar,
  deleteNewsletter,
  deletePodcast,
  deleteTestimonial,
  deleteWebinar,
  getNewsletter,
  getPodcast,
  getTestimonial,
  getWebinar,
  listNewsletters,
  listPodcasts,
  listTestimonials,
  listWebinars,
  updateNewsletter,
  updatePodcast,
  updateTestimonial,
  updateWebinar,
} from "../controllers/content.controller";

const router = Router();

// Public routes (no auth required)
router.get("/newsletters", listNewsletters);
router.get("/newsletters/:id", getNewsletter);
router.get("/webinars", listWebinars);
router.get("/podcasts", listPodcasts);
router.get("/testimonials", listTestimonials);
router.get("/webinars/:id", getWebinar);
router.get("/podcasts/:id", getPodcast);
router.get("/testimonials/:id", getTestimonial);

// Admin routes (auth required - will be protected in admin.routes.ts)
// Note: POST/PUT/DELETE for newsletters are only exposed via /api/admin/content/newsletters
router.post("/webinars", createWebinar);
router.post("/podcasts", createPodcast);
router.post("/testimonials", createTestimonial);
router.put("/webinars/:id", updateWebinar);
router.put("/podcasts/:id", updatePodcast);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/webinars/:id", deleteWebinar);
router.delete("/podcasts/:id", deletePodcast);
router.delete("/testimonials/:id", deleteTestimonial);

export default router;
