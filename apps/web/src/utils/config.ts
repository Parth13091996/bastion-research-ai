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
    portfolio_red_flags_landing: 'Risk_webinar',
    webinar_registration: 'webinar-registration',
  },
}
