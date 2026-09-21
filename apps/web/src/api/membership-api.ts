import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

export async function getPaymentHistory() {
  const { data } = await axiosInstance.get(endpoints.paymentHistory.base);
  return data;
}

export async function getMyPaymentHistory() {
  const { data } = await axiosInstance.get(endpoints.paymentHistory.me);
  return data;
}

export async function deletePaymentHistory(id: string | number) {
  return axiosInstance.delete(endpoints.paymentHistory.byId(id));
}

export async function getMembershipPlans() {
  const { data } = await axiosInstance.get(endpoints.membershipPlans.base);
  return data;
}

// Subscriptions API paths are handled on the server under the same router.
export async function getSubscriptions() {
  const { data } = await axiosInstance.get("/api/membership/subscriptions");
  return data;
}

export async function cancelSubscription(membershipId: string | number) {
  return axiosInstance.delete(
    `/api/membership/subscriptions/${membershipId}`
  );
}

