import { Router } from "express";
import { getAnalyticsSummary } from "../controllers/analytics.controller";
import {
  createNewsletter,
  createPodcast,
  createTestimonial,
  createWebinar,
  deleteNewsletter,
  deletePodcast,
  deleteTestimonial,
  deleteWebinar,
  getMailchimpNewsletter,
  getNewsletter,
  getPodcast,
  getTestimonial,
  getWebinar,
  listMailchimpNewsletters,
  listNewsletters,
  listPodcasts,
  listTestimonials,
  listWebinars,
  updateNewsletter,
  updatePodcast,
  updateTestimonial,
  updateWebinar,
} from "../controllers/content.controller";
import {
  getAdminSettings,
  getContactRecipientEmail,
  updateAdminSettings,
  updateContactRecipientEmail,
} from "../controllers/settings.controller";
import { admin, protect } from "../middleware/auth.middleware";

const router = Router();

// Example protected admin route
router.get("/dashboard", protect, admin, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin dashboard" });
});

// Analytics summary for admin dashboard
router.get("/analytics/summary", protect, admin, getAnalyticsSummary);

// Settings: Contact recipient email
router.get("/settings/contact-email", protect, admin, getContactRecipientEmail);
router.put(
  "/settings/contact-email",
  protect,
  admin,
  updateContactRecipientEmail
);

router.get("/content/newsletters", protect, admin, listNewsletters);
router.get("/content/newsletters/:id", protect, admin, getNewsletter);
router.post("/content/newsletters", protect, admin, createNewsletter);
router.put("/content/newsletters/:id", protect, admin, updateNewsletter);
router.delete("/content/newsletters/:id", protect, admin, deleteNewsletter);
router.get(
  "/content/mailchimp/newsletters",
  protect,
  admin,
  listMailchimpNewsletters
);
router.get(
  "/content/mailchimp/newsletters/:id",
  protect,
  admin,
  getMailchimpNewsletter
);

// Content management - Webinars
router.get("/content/webinars", protect, admin, listWebinars);
router.get("/content/webinars/:id", protect, admin, getWebinar);
router.post("/content/webinars", protect, admin, createWebinar);
router.put("/content/webinars/:id", protect, admin, updateWebinar);
router.delete("/content/webinars/:id", protect, admin, deleteWebinar);

// Content management - Podcasts
router.get("/content/podcasts", protect, admin, listPodcasts);
router.get("/content/podcasts/:id", protect, admin, getPodcast);
router.post("/content/podcasts", protect, admin, createPodcast);
router.put("/content/podcasts/:id", protect, admin, updatePodcast);
router.delete("/content/podcasts/:id", protect, admin, deletePodcast);

// Content management - Testimonials
router.get("/content/testimonials", protect, admin, listTestimonials);
router.get("/content/testimonials/:id", protect, admin, getTestimonial);
router.post("/content/testimonials", protect, admin, createTestimonial);
router.put("/content/testimonials/:id", protect, admin, updateTestimonial);
router.delete("/content/testimonials/:id", protect, admin, deleteTestimonial);

// Admin settings (full object)
router.get("/settings", protect, admin, getAdminSettings);
router.put("/settings", protect, admin, updateAdminSettings);

export default router;
