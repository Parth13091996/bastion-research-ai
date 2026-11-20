import { Cashfree } from "cashfree-pg";

const CF_APP_ID = process.env.CASHFREE_APP_ID;
const CF_SECRET = process.env.CASHFREE_SECRET;
const CF_ENV = (process.env.CASHFREE_ENV || "SANDBOX").toUpperCase() as
  | "SANDBOX"
  | "PRODUCTION";
export const CF_API_VERSION = "2023-08-01";

const CF_VERIFICATION_CLIENT_ID =
  process.env.CASHFREE_VERIFICATION_CLIENT_ID || CF_APP_ID;
const CF_VERIFICATION_CLIENT_SECRET =
  process.env.CASHFREE_VERIFICATION_CLIENT_SECRET || CF_SECRET;

export const getBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    // export const CF_API_VERSION = "2023-08-01";

    // const getAppId = () => (process.env.CASHFREE_APP_ID || "").trim();
    // const getSecret = () => (process.env.CASHFREE_SECRET || "").trim();
    // const getEnv = () => ((process.env.CASHFREE_ENV || "SANDBOX").trim().toUpperCase() as "SANDBOX" | "PRODUCTION");

    // const getVerificationEnv = () =>
    //   ((process.env.CASHFREE_VERIFICATION_ENV || process.env.CASHFREE_ENV || "SANDBOX")
    //     .trim()
    //     .toUpperCase() as "SANDBOX" | "PRODUCTION");

    // const getVerificationClientId = () => (process.env.CASHFREE_VERIFICATION_CLIENT_ID || getAppId()).trim();
    // const getVerificationClientSecret = () => (process.env.CASHFREE_VERIFICATION_CLIENT_SECRET || getSecret()).trim();

    // export const getBaseUrl = () =>
    // getEnv() === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const getVerificationBaseUrl = () =>
  CF_ENV === "PRODUCTION"
    // getVerificationEnv() === "PRODUCTION"
    ? "https://api.cashfree.com/verification"
    : "https://sandbox.cashfree.com/verification";

export const ensureCashfreeConfigured = () => {
  if (!CF_APP_ID || !CF_SECRET) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  const envConst =
    CF_ENV === "PRODUCTION"
      ? (Cashfree as any).PRODUCTION
      : (Cashfree as any).SANDBOX;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _cf = new (Cashfree as any)(envConst, CF_APP_ID, CF_SECRET);
};

export const getVerificationHeaders = () => {
  if (!CF_VERIFICATION_CLIENT_ID || !CF_VERIFICATION_CLIENT_SECRET) {
    //   const appId = getAppId();
    //   const secret = getSecret();
    //   if (!appId || !secret) {
    //     throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
    //   }
    // };

    // export const getVerificationHeaders = () => {
    //   const clientId = getVerificationClientId();
    //   const clientSecret = getVerificationClientSecret();
    //   if (!clientId || !clientSecret) {
    throw new Error(
      "Cashfree verification credentials are not configured. Set CASHFREE_VERIFICATION_CLIENT_ID and CASHFREE_VERIFICATION_CLIENT_SECRET or reuse CASHFREE_APP_ID/CASHFREE_SECRET."
    );
  }
  return {
    "x-client-id": CF_VERIFICATION_CLIENT_ID,
    "x-client-secret": CF_VERIFICATION_CLIENT_SECRET,
    // "x-cf-signature": cfSignature,
    // "x-client-id": clientId,
    // "x-client-secret": clientSecret,
    "Content-Type": "application/json",
  } as const;
};

export const getCashfreeAuthHeaders = () => {
  if (!CF_APP_ID || !CF_SECRET) {
    // const appId = getAppId();
    // const secret = getSecret();
    // if (!appId || !secret) {
    throw new Error("CASHFREE_APP_ID/CASHFREE_SECRET not configured");
  }
  return {
    "x-api-version": CF_API_VERSION,
    "x-client-id": CF_APP_ID,
    "x-client-secret": CF_SECRET,
    // "x-client-id": appId,
    // "x-client-secret": secret,
  } as const;
};

export const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
