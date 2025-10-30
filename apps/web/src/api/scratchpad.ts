import axiosInstance from "./axios";

export interface ScratchPadNewsletter {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  featured_image?: string;
  author?: string;
  published_date?: string;
  is_published: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const scratchPadApi = {
  // Public APIs
  getAll: (publishedOnly = false): Promise<ScratchPadNewsletter[]> =>
    axiosInstance
      .get(`/api/scratch-pad-newsletters${publishedOnly ? '?published_only=true' : ''}`)
      .then((res) => res.data),

  getById: (id: string): Promise<ScratchPadNewsletter> =>
    axiosInstance
      .get(`/api/scratch-pad-newsletters/${id}`)
      .then((res) => res.data),

  getBySlug: (slug: string): Promise<ScratchPadNewsletter> =>
    axiosInstance
      .get(`/api/scratch-pad-newsletters/slug/${slug}`)
      .then((res) => res.data),

  // Admin APIs
  create: (
    data: Omit<ScratchPadNewsletter, "id" | "created_at" | "updated_at">
  ): Promise<ScratchPadNewsletter> =>
    axiosInstance
      .post("/api/admin/scratch-pad-newsletters", data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<ScratchPadNewsletter, "id" | "created_at" | "updated_at">>
  ): Promise<ScratchPadNewsletter> =>
    axiosInstance
      .put(`/api/admin/scratch-pad-newsletters/${id}`, data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(`/api/admin/scratch-pad-newsletters/${id}`)
      .then((res) => res.data),
};
