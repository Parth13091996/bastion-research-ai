import axiosInstance from "./axios";
import { endpoints } from "./endpoints";

const mailchimpNewsletterApi = {
  subscribe: (payload: {
    email: string;
    tags?: string[];
    merge_fields?: Record<string, string>;
  }) =>
    axiosInstance
      .post(endpoints.content.mailchimp.subscribe, payload)
      .then((res) => res.data),
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

    setHidden: (id: string, hidden: boolean): Promise<{ ok: boolean }> =>
      axiosInstance
        .put(endpoints.content.mailchimp.newsletters.admin.setHidden(id), {
          hidden,
        })
        .then((res) => res.data),
  },
};

export default mailchimpNewsletterApi;
