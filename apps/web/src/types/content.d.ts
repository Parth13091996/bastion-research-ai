interface Newsletter {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  created_at: string;
}

interface Webinar {
  id: string;
  title: string;
  video_url?: string;
  created_at: string;
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
