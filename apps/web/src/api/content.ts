import { Testimonial } from "@repo/types";
import axiosInstance from "./axios";
import { endpoints } from "./endpoints";

export const newsletterApi = {
  getAll: (): Promise<Newsletter[]> =>
    axiosInstance
      .get(endpoints.content.newsletters.base)
      .then((res) => res.data),

  getById: (id: string): Promise<Newsletter> =>
    axiosInstance
      .get(endpoints.content.newsletters.byId(id))
      .then((res) => res.data),

  create: (data: Omit<Newsletter, "id" | "created_at">): Promise<Newsletter> =>
    axiosInstance
      .post(endpoints.content.newsletters.admin.base, data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<Newsletter, "id" | "created_at">>
  ): Promise<Newsletter> =>
    axiosInstance
      .put(endpoints.content.newsletters.admin.byId(id), data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(endpoints.content.newsletters.admin.byId(id))
      .then((res) => res.data),
};

export const webinarApi = {
  // Public APIs
  getAll: (): Promise<Webinar[]> =>
    axiosInstance.get(endpoints.content.webinars.base).then((res) => res.data),

  getById: (id: string): Promise<Webinar> =>
    axiosInstance
      .get(endpoints.content.webinars.byId(id))
      .then((res) => res.data),

  create: (data: Omit<Webinar, "id" | "created_at">): Promise<Webinar> =>
    axiosInstance
      .post(endpoints.content.webinars.admin.base, data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<Webinar, "id" | "created_at">>
  ): Promise<Webinar> =>
    axiosInstance
      .put(endpoints.content.webinars.admin.byId(id), data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(endpoints.content.webinars.admin.byId(id))
      .then((res) => res.data),
};

export const podcastApi = {
  getAll: (): Promise<Podcast[]> =>
    axiosInstance.get(endpoints.content.podcasts.base).then((res) => res.data),

  getById: (id: string): Promise<Podcast> =>
    axiosInstance
      .get(endpoints.content.podcasts.byId(id))
      .then((res) => res.data),

  create: (data: Omit<Podcast, "id" | "created_at">): Promise<Podcast> =>
    axiosInstance
      .post(endpoints.content.podcasts.admin.base, data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<Podcast, "id" | "created_at">>
  ): Promise<Podcast> =>
    axiosInstance
      .put(endpoints.content.podcasts.admin.byId(id), data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(endpoints.content.podcasts.admin.byId(id))
      .then((res) => res.data),
};

export const researchApi = {
  // Public APIs
  getAll: (): Promise<Research[]> =>
    axiosInstance.get(endpoints.content.research.base).then((res) => res.data),

  getById: (id: string): Promise<Research> =>
    axiosInstance
      .get(endpoints.content.research.byId(id))
      .then((res) => res.data),

  // Admin APIs
  create: (data: Omit<Research, "id" | "created_at">): Promise<Research> =>
    axiosInstance
      .post(endpoints.content.research.admin.base, data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<Research, "id" | "created_at">>
  ): Promise<Research> =>
    axiosInstance
      .put(endpoints.content.research.admin.byId(id), data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(endpoints.content.research.admin.byId(id))
      .then((res) => res.data),
};

export const testimonialApi = {
  getAll: (): Promise<Testimonial[]> =>
    axiosInstance
      .get(endpoints.content.testimonials.base)
      .then((res) => res.data),

  getById: (id: string): Promise<Testimonial> =>
    axiosInstance
      .get(endpoints.content.testimonials.byId(id))
      .then((res) => res.data),

  create: (
    data: Omit<Testimonial, "id" | "created_at">
  ): Promise<Testimonial> =>
    axiosInstance
      .post(endpoints.content.testimonials.admin.base, data)
      .then((res) => res.data),

  update: (
    id: string,
    data: Partial<Omit<Testimonial, "id" | "created_at">>
  ): Promise<Testimonial> =>
    axiosInstance
      .put(endpoints.content.testimonials.admin.byId(id), data)
      .then((res) => res.data),

  delete: (id: string): Promise<{ message: string }> =>
    axiosInstance
      .delete(endpoints.content.testimonials.admin.byId(id))
      .then((res) => res.data),
};
