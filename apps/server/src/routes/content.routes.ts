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
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";

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
router.post("/webinars", protect, staff, requireSectionEdit("content_webinars"), createWebinar);
router.post("/podcasts", protect, staff, requireSectionEdit("content_podcasts"), createPodcast);
router.post(
  "/testimonials",
  protect,
  staff,
  requireSectionEdit("content_testimonials"),
  createTestimonial
);
router.put("/webinars/:id", protect, staff, requireSectionEdit("content_webinars"), updateWebinar);
router.put("/podcasts/:id", protect, staff, requireSectionEdit("content_podcasts"), updatePodcast);
router.put(
  "/testimonials/:id",
  protect,
  staff,
  requireSectionEdit("content_testimonials"),
  updateTestimonial
);
router.delete("/webinars/:id", protect, staff, requireSectionEdit("content_webinars"), deleteWebinar);
router.delete("/podcasts/:id", protect, staff, requireSectionEdit("content_podcasts"), deletePodcast);
router.delete(
  "/testimonials/:id",
  protect,
  staff,
  requireSectionEdit("content_testimonials"),
  deleteTestimonial
);

export default router;
