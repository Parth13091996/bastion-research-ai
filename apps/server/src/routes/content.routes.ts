import { Router } from "express";
import {
  createPodcast,
  createTestimonial,
  createWebinar,
  deletePodcast,
  deleteTestimonial,
  deleteWebinar,
  getPodcast,
  getTestimonial,
  getWebinar,
  listPodcasts,
  listTestimonials,
  listWebinars,
  updatePodcast,
  updateTestimonial,
  updateWebinar,
} from "../controllers/content.controller";

const router = Router();

// Public routes (no auth required)
router.get("/webinars", listWebinars);
router.get("/podcasts", listPodcasts);
router.get("/testimonials", listTestimonials);
router.get("/webinars/:id", getWebinar);
router.get("/podcasts/:id", getPodcast);
router.get("/testimonials/:id", getTestimonial);

// Admin routes (auth required - will be protected in admin.routes.ts)
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
