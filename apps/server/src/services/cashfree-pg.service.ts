import axios from "axios";
import { Cashfree } from "cashfree-pg";
import {
  CF_API_VERSION,
  ensureCashfreeConfigured,
  getBaseUrl,
  getCashfreeAuthHeaders,
} from "./cashfree-config";

export const pgCreateOrder = async (request: any) => {
  try {
    const anyCF = Cashfree as any;
    if (typeof anyCF.PGCreateOrder === "function") {
      ensureCashfreeConfigured();
      return await anyCF.PGCreateOrder(request);
    }
    throw new Error("SDK PGCreateOrder missing; using REST fallback");
  } catch {
    const url = `${getBaseUrl()}/orders`;
    const headers = {
      ...getCashfreeAuthHeaders(),
      "Content-Type": "application/json",
    } as const;
    const resp = await axios.post(url, request, { headers });
    return { data: resp.data };
  }
};

export const pgFetchOrder = async (orderId: string) => {
  try {
    const anyCF = Cashfree as any;
    if (typeof anyCF.PGFetchOrder === "function") {
      ensureCashfreeConfigured();
      return await anyCF.PGFetchOrder(orderId);
    }
    throw new Error("SDK PGFetchOrder missing; using REST fallback");
  } catch {
    const url = `${getBaseUrl()}/orders/${orderId}`;
    const headers = getCashfreeAuthHeaders() as any;
    const resp = await axios.get(url, { headers });
    return { data: resp.data };
  }
};
