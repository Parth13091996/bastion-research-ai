function formatMailchimpTagDate(dateYmd?: string | null): string {
  const raw = dateYmd?.trim();
  if (raw) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw.replace(/-/g, "_");
    }
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) {
      return raw.replace(/\//g, "_");
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}_${m}_${d}`;
    }
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}_${m}_${d}`;
}

export const Config = {
  app_name: 'Bastion Research',
  digio_environment:
    import.meta.env.MODE === 'production'
      ? 'production'
      : ('sandbox' as 'production' | 'sandbox'),
  cashfree_environment:
    import.meta.env.MODE === 'production'
      ? 'production'
      : ('sandbox' as 'production' | 'sandbox'),
  connect_url: 'connect@bastionresearch.in',
  agreement_file_name: (formData) =>
    `${formData.firstName || formData.first_name}_${formData.lastName || formData?.last_name}_Agreement.pdf`,
  social_links: {
    twitter: 'https://x.com/bastionresearch',
    linkedin: 'https://www.linkedin.com/company/bastion-research-house/',
    instagram: 'https://www.instagram.com/bastionresearch/#',
    youtube: 'https://www.youtube.com/@BastionResearch',
    spotify:
      'https://open.spotify.com/show/4tBUa0orTDn3C76Yr16o5s?si=iiEnjhIWTv-pvG-xdqFB6w&nd=1&dlsi=06ffb913e9ce43f8',
    substack:
      'https://substack.com/@bastionresearch?utm_campaign=profile&utm_medium=profile-page',
  },
  logo: 'https://dev.bastionresearch.in/media/header-logo.webp',
  roles: {
    admin: 'admin',
    employee: 'employee',
    core_subscriber: 'core_subscriber',
    ipo_subscriber: 'ipo_subscriber',
    research_ally_subscriber: 'research_ally_subscriber',
  },
  mailchimp_tags: {
    portfolio_red_flags_landing: (dateYmd?: string | null) =>
      `Risk_webinar_${formatMailchimpTagDate(dateYmd)}`,
    webinar_registration: 'webinar-registration',
  },
  aisensy_source: "new-landing-page form"
}
