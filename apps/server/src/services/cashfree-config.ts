import { Cashfree } from "cashfree-pg";

const cleanEnv = (val?: string) =>
  (val || "").trim().replace(/^["']|["']$/g, "");

const CF_APP_ID = cleanEnv(process.env.CASHFREE_APP_ID);
const CF_SECRET = cleanEnv(process.env.CASHFREE_SECRET);
const CF_ENV = (cleanEnv(process.env.CASHFREE_ENV) || "SANDBOX").toUpperCase() as
  | "SANDBOX"
  | "PRODUCTION";
export const CF_API_VERSION = "2023-08-01";

const CF_VERIFICATION_CLIENT_ID =
  cleanEnv(process.env.CASHFREE_VERIFICATION_CLIENT_ID) || CF_APP_ID;
const CF_VERIFICATION_CLIENT_SECRET =
  cleanEnv(process.env.CASHFREE_VERIFICATION_CLIENT_SECRET) || CF_SECRET;

export const getBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const getVerificationBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

export const ensureCashfreeConfigured = () => {
  if (!CF_APP_ID || !CF_SECRET) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  const anyCF = Cashfree as any;
  if (anyCF.XClientId !== undefined) {
    anyCF.XClientId = CF_APP_ID;
    anyCF.XClientSecret = CF_SECRET;
    anyCF.XEnvironment =
      CF_ENV === "PRODUCTION"
        ? anyCF.Environment?.PRODUCTION || "PRODUCTION"
        : anyCF.Environment?.SANDBOX || "SANDBOX";
  }
};

export const getVerificationHeaders = () => {
  if (!CF_VERIFICATION_CLIENT_ID || !CF_VERIFICATION_CLIENT_SECRET) {
    throw new Error(
      "Cashfree verification credentials are not configured. Set CASHFREE_VERIFICATION_CLIENT_ID and CASHFREE_VERIFICATION_CLIENT_SECRET or reuse CASHFREE_APP_ID/CASHFREE_SECRET."
    );
  }
  return {
    "x-client-id": CF_VERIFICATION_CLIENT_ID,
    "x-client-secret": CF_VERIFICATION_CLIENT_SECRET,
    // "x-cf-signature": cfSignature,
    "Content-Type": "application/json",
  } as const;
};

export const getCashfreeAuthHeaders = () => {
  if (!CF_APP_ID || !CF_SECRET) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  return {
    "x-api-version": CF_API_VERSION,
    "x-client-id": CF_APP_ID,
    "x-client-secret": CF_SECRET,
  } as const;
};

export const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
