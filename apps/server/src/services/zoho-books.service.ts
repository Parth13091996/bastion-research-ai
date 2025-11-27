import axios, { AxiosRequestConfig } from "axios";
import { supabase } from "../supabase";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_BOOKS_ORGANIZATION_ID;
const ZOHO_ACCOUNTS_BASE_URL =
  process.env.ZOHO_BOOKS_ACCOUNTS_BASE_URL || "https://accounts.zoho.com";
const ZOHO_API_DOMAIN =
  process.env.ZOHO_BOOKS_API_DOMAIN || "https://www.zohoapis.com";
const ZOHO_CLIENT_ID = process.env.ZOHO_BOOKS_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_BOOKS_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_BOOKS_REFRESH_TOKEN;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.token;
  }

  // Fallback: if refresh flow is not configured, try legacy static token
  const staticToken = process.env.ZOHO_BOOKS_ACCESS_TOKEN;
  if (!ZOHO_REFRESH_TOKEN || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    if (!staticToken) {
      throw new Error(
        "Zoho Books OAuth is not configured. Set ZOHO_BOOKS_REFRESH_TOKEN, ZOHO_BOOKS_CLIENT_ID, ZOHO_BOOKS_CLIENT_SECRET or provide ZOHO_BOOKS_ACCESS_TOKEN."
      );
    }
    return staticToken;
  }

  const url = `${ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`;

  const response = await axios.post(
    url,
    null,
    {
      params: {
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = response.data as {
    access_token: string;
    expires_in?: number;
    api_domain?: string;
  };

  const expiresInMs = (data.expires_in || 3600) * 1000;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  return data.access_token;
}

function getZohoBaseUrl() {
  return `${ZOHO_API_DOMAIN}/books/v3`;
}

async function zohoRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  if (!ZOHO_ORGANIZATION_ID) {
    throw new Error("ZOHO_BOOKS_ORGANIZATION_ID is not configured");
  }

  const accessToken = await getAccessToken();

  const headers = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    "Content-Type": "application/json",
    ...(config.headers || {}),
  };

  const url = `${getZohoBaseUrl()}${config.url}`;

  const finalConfig: AxiosRequestConfig = {
    ...config,
    url,
    headers,
    params: {
      ...(config.params || {}),
      organization_id: ZOHO_ORGANIZATION_ID,
    },
  };

  const response = await axios(finalConfig);
  return response.data as T;
}

export interface ZohoContactPayload {
  contact_name: string;
  company_name?: string;
  contact_type?: "customer" | "vendor";
  email?: string;
  phone?: string;
}

export interface ZohoInvoiceLineItem {
  name: string;
  quantity: number;
  rate: number;
}

export interface ZohoInvoicePayload {
  customer_id: string;
  line_items: ZohoInvoiceLineItem[];
  reference_number?: string;
  invoice_number?: string;
  payment_terms?: number;
  status?: string;
  notes?: string;
}

export async function createZohoContact(payload: ZohoContactPayload) {
  const data = await zohoRequest({
    method: "POST",
    url: "/contacts",
    data: payload,
  });
  return data;
}

export async function listZohoContactsByEmail(email: string) {
  const data = await zohoRequest({
    method: "GET",
    url: "/contacts",
    params: {
      email,
    },
  });
  return data;
}

export async function ensureZohoCustomer(params: {
  email: string;
  fullName: string;
  companyName?: string;
  phone?: string;
}) {
  const existing = await listZohoContactsByEmail(params.email);
  const existingContacts = (existing as any)?.contacts || [];
  if (existingContacts.length > 0) {
    return existingContacts[0];
  }

  const payload: ZohoContactPayload = {
    contact_name: params.fullName || params.email,
    company_name: params.companyName,
    contact_type: "customer",
    email: params.email,
    phone: params.phone,
  };

  const created = await createZohoContact(payload);
  return (created as any)?.contact || created;
}

export async function createZohoInvoice(payload: ZohoInvoicePayload, options?: { send?: boolean }) {
  const data = await zohoRequest({
    method: "POST",
    url: "/invoices",
    params: {
      ...(options?.send != null ? { send: options.send } : {}),
    },
    data: payload,
  });
  return data;
}

export async function createZohoInvoiceForPayment(transactionId: string) {
  const { data: payment, error: paymentError } = await supabase
    .from("payment_history")
    .select(
      "transaction_id, payer_email, user_id, plan_id, zoho_invoice_id, created_at"
    )
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (!payment.payer_email) {
    throw new Error("Payment does not have payer_email");
  }

  if (payment.zoho_invoice_id) {
    return { zoho_invoice_id: payment.zoho_invoice_id, skipped: true };
  }

  const { data: user } = await supabase
    .from("users")
    .select("first_name, last_name, phone")
    .eq("id", payment.user_id)
    .maybeSingle();

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("plan_name, price_amount, currency")
    .eq("plan_id", payment.plan_id)
    .maybeSingle();

  const fullName =
    user && (user as any).first_name
      ? `${(user as any).first_name || ""} ${(user as any).last_name || ""}`.trim()
      : payment.payer_email;

  const contact = await ensureZohoCustomer({
    email: payment.payer_email,
    fullName,
    companyName: undefined,
    phone: (user as any)?.phone || undefined,
  });

  const contactId = (contact as any)?.contact_id || (contact as any)?.id;
  if (!contactId) {
    throw new Error("Zoho contact ID missing from response");
  }

  const amount = plan?.price_amount || 0;
  const lineItemName = plan?.plan_name || "Membership Plan";

  const invoicePayload: ZohoInvoicePayload = {
    customer_id: contactId,
    line_items: [
      {
        name: lineItemName,
        quantity: 1,
        rate: amount,
      },
    ],
    reference_number: payment.transaction_id,
    notes: `Invoice for payment transaction ${payment.transaction_id}`,
  };

  const invoiceResponse = await createZohoInvoice(invoicePayload, {
    send: true,
  });

  const invoiceId =
    (invoiceResponse as any)?.invoice?.invoice_id ||
    (invoiceResponse as any)?.invoice_id;

  if (!invoiceId) {
    throw new Error("Zoho invoice ID missing from response");
  }

  const { error: updateError } = await supabase
    .from("payment_history")
    .update({ zoho_invoice_id: invoiceId })
    .eq("transaction_id", transactionId);

  if (updateError) {
    throw new Error(
      `Invoice created but failed to update payment_history: ${updateError.message}`
    );
  }

  return { zoho_invoice_id: invoiceId, invoice: invoiceResponse, skipped: false };
}
