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
  category?: string;
  hidden?: boolean;
  published_date?: string;
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

interface PaymentRow {
  transaction_id: string;
  invoice_id?: string;
  payment_gateway?: string;
  payment_type?: string;
  payer_email?: string;
  transaction_status?: string;
  user_id?: string;
  plan_id?: number;
  payment_date?: string | null;
  amount?: number | string | null;
  membership?: string | null;
  plan_code?: string | null;
  coupon_code?: string | null;
}
