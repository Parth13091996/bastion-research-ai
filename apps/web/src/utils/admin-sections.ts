export const ADMIN_EDIT_SECTIONS = [
  { key: "ar_manage_members", label: "Manage Members" },
  { key: "ar_profile", label: "Profile" },
  { key: "ar_manage_plans", label: "Manage Plans" },
  { key: "ar_payment_history", label: "Payment History" },
  { key: "ar_coupon_management", label: "Coupon Management" },
  { key: "content_newsletter", label: "News Letter" },
  { key: "content_recommendations", label: "Recommendations" },
  { key: "content_podcasts", label: "Podcasts" },
  { key: "content_webinars", label: "Webinars" },
  { key: "content_webinar_registrations", label: "Webinar Registrations" },
  { key: "content_testimonials", label: "Testimonials" },
  { key: "content_red_flag_analytics", label: "Red Flag Analytics" },
  { key: "content_scratch_pad", label: "Scratch Pad" },
  { key: "content_qna", label: "QnA" },
  { key: "jobs_job_openings", label: "Job Openings" },
  { key: "jobs_add_new_job", label: "Add New Job" },
  { key: "jobs_applications", label: "Applications" },
  { key: "leads", label: "Leads" },
] as const;

export type AdminEditSectionKey = (typeof ADMIN_EDIT_SECTIONS)[number]["key"];
