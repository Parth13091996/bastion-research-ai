import axiosInstance from "./axios";
import { endpoints } from "./endpoints";

// Types are kept broad where the components currently don't enforce strict shapes.
// You can tighten these later as needed.

// ---------- OTP ----------

export async function sendOtp(phone: string) {
  const { data } = await axiosInstance.post(endpoints.otp.send, {
    phone,
  });
  return data;
}

export async function verifyOtp(phone: string, otp: string) {
  const { data } = await axiosInstance.post(endpoints.otp.verify, {
    phone,
    otp,
  });
  return data;
}

export async function sendEmailOtp(email: string) {
  const { data } = await axiosInstance.post(endpoints.otp.sendEmail, {
    email,
  });
  return data;
}

// ---------- Cashfree Plans / Orders ----------

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await axiosInstance.get(endpoints.cashfree.plans);
  return data.plans || [];
}

export async function createCashfreeOrder(payload: {
  plan: string;
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  source: string;
  is_free?: boolean;
  coupon_code?: string | null;
  discount_amount?: number;
  metadata?: Record<string, any>;
}) {
  const { data } = await axiosInstance.post(endpoints.cashfree.orders, payload);
  return data;
}

// ---------- Cashfree Verification (PAN) ----------

export async function verifyPan(payload: { pan: string; name: string }) {
  const { data } = await axiosInstance.post(
    endpoints.cashfreeVerification.verifyPan,
    payload
  );
  return data;
}

export async function getPanStatus(referenceId: string | number) {
  const { data } = await axiosInstance.get(
    endpoints.cashfreeVerification.panStatus(referenceId)
  );
  return data;
}

// ---------- Onboarding Auth ----------

export async function startOnboarding(payload: {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  company?: string;
  panCard: string;
  panVerification: any;
}) {
  const { data } = await axiosInstance.post(
    endpoints.auth.onboardStart,
    payload
  );
  return data;
}

// ---------- Digio E-sign ----------

export async function uploadDigioEsignJson(payload: {
  file_data: string;
  file_name: string;
  will_self_sign: boolean;
  include_authentication_url: boolean;
  signers: {
    identifier: string;
    name: string;
  }[];
}) {
  const { data } = await axiosInstance.post(
    endpoints.digio.esignUploadJson,
    payload
  );
  return data;
}

// ---------- Users ----------

export async function updateUser(id: string, payload: any) {
  const { data } = await axiosInstance.put(endpoints.users.update(id), payload);
  return data;
}

// ---------- Coupons ----------

export async function validateCoupon(code: string) {
  const { data } = await axiosInstance.get(
    `${endpoints.coupons.base}/validate`,
    {
      params: { code },
    }
  );
  return data;
}
