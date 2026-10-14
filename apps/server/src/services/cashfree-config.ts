import { Cashfree } from "cashfree-pg";

export const CF_API_VERSION = "2023-08-01";

const getAppId = () => (process.env.CASHFREE_APP_ID || "").trim();
const getSecret = () => (process.env.CASHFREE_SECRET || "").trim();
const getEnv = () => ((process.env.CASHFREE_ENV || "SANDBOX").trim().toUpperCase() as "SANDBOX" | "PRODUCTION");

const getVerificationEnv = () =>
  ((process.env.CASHFREE_VERIFICATION_ENV || process.env.CASHFREE_ENV || "SANDBOX")
    .trim()
    .toUpperCase() as "SANDBOX" | "PRODUCTION");

const getVerificationClientId = () => (process.env.CASHFREE_VERIFICATION_CLIENT_ID || getAppId()).trim();
const getVerificationClientSecret = () => (process.env.CASHFREE_VERIFICATION_CLIENT_SECRET || getSecret()).trim();

export const getBaseUrl = () =>
  getEnv() === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const getVerificationBaseUrl = () =>
  getVerificationEnv() === "PRODUCTION"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

export const ensureCashfreeConfigured = () => {
  const appId = getAppId();
  const secret = getSecret();
  if (!appId || !secret) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
};

export const getVerificationHeaders = () => {
  const clientId = getVerificationClientId();
  const clientSecret = getVerificationClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Cashfree verification credentials are not configured. Set CASHFREE_VERIFICATION_CLIENT_ID and CASHFREE_VERIFICATION_CLIENT_SECRET or reuse CASHFREE_APP_ID/CASHFREE_SECRET."
    );
  }
  return {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "Content-Type": "application/json",
  } as const;
};

export const getCashfreeAuthHeaders = () => {
  const appId = getAppId();
  const secret = getSecret();
  if (!appId || !secret) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  return {
    "x-api-version": CF_API_VERSION,
    "x-client-id": appId,
    "x-client-secret": secret,
  } as const;
};

export const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
