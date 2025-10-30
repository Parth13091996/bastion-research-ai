interface Newsletter {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  created_at: string;
  contents?: string;
  link?: string;
  guid?: string;
  author?: string;
  plain_text?: string;
  source?: "mailchimp" | "cms";
}

interface Webinar {
  id: string;
  title: string;
  video_url?: string;
  contents?: string;
  created_at: string;
}

interface ScratchPadNewsletter {
  id: string; // uuid
  title: string;
  slug: string;
  description?: string | null;
  content: string;
  featured_image?: string | null;
  author?: string | null;
  published_date?: string | null; // ISO date string or null
  is_published?: boolean | null;
  tags?: string[] | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

interface Podcast {
  id: string;
  title: string;
  html_content?: string;
  video_url?: string;
  created_at: string;
}

interface Research {
  id: string;
  company: string;
  coverage_initiation_date?: string; // ISO date string
  sector?: string;
  action?: string;
  comments?: string;
  percent_return_since_recommendation?: number;
  percent_irr_potential_from_cmp?: number;
  research_material_url?: string; // public URL to PDF
  created_at: string;
}
