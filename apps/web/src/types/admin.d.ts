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
