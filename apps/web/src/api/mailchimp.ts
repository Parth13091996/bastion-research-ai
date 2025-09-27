import axiosInstance from "./axios";
import { endpoints } from "./endpoints";

export const mailchimpNewsletterApi = {
  getAll: (): Promise<Newsletter[]> =>
    axiosInstance
      .get(endpoints.content.mailchimp.newsletters.base)
      .then((res) => res.data),

  getById: (id: string): Promise<Newsletter> =>
    axiosInstance
      .get(endpoints.content.mailchimp.newsletters.byId(id))
      .then((res) => res.data),

  refresh: (): Promise<Newsletter[]> =>
    axiosInstance
      .get(endpoints.content.mailchimp.newsletters.base, {
        params: { force: true },
      })
      .then((res) => res.data),

  admin: {
    getAll: (): Promise<Newsletter[]> =>
      axiosInstance
        .get(endpoints.content.mailchimp.newsletters.admin.base)
        .then((res) => res.data),

    getById: (id: string): Promise<Newsletter> =>
      axiosInstance
        .get(endpoints.content.mailchimp.newsletters.admin.byId(id))
        .then((res) => res.data),

    refresh: (): Promise<Newsletter[]> =>
      axiosInstance
        .get(endpoints.content.mailchimp.newsletters.admin.base, {
          params: { force: true },
        })
        .then((res) => res.data),
  },
};

export default mailchimpNewsletterApi;
