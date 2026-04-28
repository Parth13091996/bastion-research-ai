import { Router } from 'express'
import { getAnalyticsSummary } from '../controllers/analytics.controller'
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
} from '../controllers/content.controller'
import {
  getAdminSettings,
  getContactRecipientEmail,
  updateAdminSettings,
  updateContactRecipientEmail,
} from '../controllers/settings.controller'
import { admin, protect, requireSectionEdit, staff } from '../middleware/auth.middleware'
import {
  listEmployeesSectionEditAccess,
  setEmployeeSectionEditAccess,
} from '../controllers/employeeSectionPermissions.controller'
import {
  getUserActivitySummary,
  getUserPageVisits,
  getUserRecommendationVisits,
} from '../controllers/userActivity.controller'
import {
  getMailchimpNewsletter,
  listMailchimpNewsletters,
  setMailchimpNewsletterHidden,
} from '../controllers/mailchimp.controller'
import {
  deleteWebinarRegistration,
  listWebinarRegistrations,
} from '../controllers/webinar-registrations.controller'

const router = Router()

// Example protected admin route
router.get('/dashboard', protect, admin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard' })
})

// Analytics summary for admin dashboard
router.get('/analytics/summary', protect, staff, getAnalyticsSummary)
// User-level analytics for Manage Members
router.get('/users/activity-summary', protect, staff, getUserActivitySummary)
// Detailed user activity - page visits and recommendation visits
router.get('/users/:userId/page-visits', protect, staff, getUserPageVisits)
router.get(
  '/users/:userId/recommendation-visits',
  protect,
  staff,
  getUserRecommendationVisits
)

// Settings: Contact recipient email
router.get('/settings/contact-email', protect, admin, getContactRecipientEmail)
router.put(
  '/settings/contact-email',
  protect,
  admin,
  updateContactRecipientEmail
)

router.get('/mailchimp/newsletters', protect, staff, listMailchimpNewsletters)
router.get('/mailchimp/newsletters/:id', protect, staff, getMailchimpNewsletter)
router.put(
  '/mailchimp/newsletters/:id/hide',
  protect,
  staff,
  requireSectionEdit('content_newsletter'),
  setMailchimpNewsletterHidden
)

// Content management - Manual Newsletters (CMS)
router.get('/content/newsletters', protect, staff, listNewsletters)
router.get('/content/newsletters/:id', protect, staff, getNewsletter)
router.post(
  '/content/newsletters',
  protect,
  staff,
  requireSectionEdit('content_newsletter'),
  createNewsletter
)
router.put(
  '/content/newsletters/:id',
  protect,
  staff,
  requireSectionEdit('content_newsletter'),
  updateNewsletter
)
router.delete(
  '/content/newsletters/:id',
  protect,
  staff,
  requireSectionEdit('content_newsletter'),
  deleteNewsletter
)

// Content management - Webinars
router.get('/content/webinars', protect, staff, listWebinars)
router.get('/content/webinars/:id', protect, staff, getWebinar)
router.post(
  '/content/webinars',
  protect,
  staff,
  requireSectionEdit('content_webinars'),
  createWebinar
)
router.put(
  '/content/webinars/:id',
  protect,
  staff,
  requireSectionEdit('content_webinars'),
  updateWebinar
)
router.delete(
  '/content/webinars/:id',
  protect,
  staff,
  requireSectionEdit('content_webinars'),
  deleteWebinar
)

// Content management - Podcasts
router.get('/content/podcasts', protect, staff, listPodcasts)
router.get('/content/podcasts/:id', protect, staff, getPodcast)
router.post(
  '/content/podcasts',
  protect,
  staff,
  requireSectionEdit('content_podcasts'),
  createPodcast
)
router.put(
  '/content/podcasts/:id',
  protect,
  staff,
  requireSectionEdit('content_podcasts'),
  updatePodcast
)
router.delete(
  '/content/podcasts/:id',
  protect,
  staff,
  requireSectionEdit('content_podcasts'),
  deletePodcast
)

// Content management - Testimonials
router.get('/content/testimonials', protect, staff, listTestimonials)
router.get('/content/testimonials/:id', protect, staff, getTestimonial)
router.post(
  '/content/testimonials',
  protect,
  staff,
  requireSectionEdit('content_testimonials'),
  createTestimonial
)
router.put(
  '/content/testimonials/:id',
  protect,
  staff,
  requireSectionEdit('content_testimonials'),
  updateTestimonial
)
router.delete(
  '/content/testimonials/:id',
  protect,
  staff,
  requireSectionEdit('content_testimonials'),
  deleteTestimonial
)

// Webinar registrations (admin only)
router.get('/webinar-registrations', protect, staff, listWebinarRegistrations)
router.delete(
  '/webinar-registrations/:id',
  protect,
  staff,
  requireSectionEdit('content_webinar_registrations'),
  deleteWebinarRegistration
)

// Admin settings (full object)
router.get('/settings', protect, admin, getAdminSettings)
router.put('/settings', protect, admin, updateAdminSettings)

// Staff section edit-access matrix (admin only)
router.get(
  '/staff/section-edit-access',
  protect,
  admin,
  listEmployeesSectionEditAccess
)
router.put(
  '/staff/section-edit-access',
  protect,
  admin,
  setEmployeeSectionEditAccess
)

export default router
