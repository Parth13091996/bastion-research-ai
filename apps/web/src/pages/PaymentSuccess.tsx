import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { AppRoutes } from "@/routes/app-routes";

const isOrderPaid = (data: any): boolean => {
  // Try common fields that may indicate a successful payment
  const statusCandidates = [
    data?.order_status,
    data?.status,
    data?.payment_status,
    data?.paymentDetails?.paymentStatus,
  ]
    .filter(Boolean)
    .map((s: any) => String(s).toUpperCase());

  return statusCandidates.some((s) =>
    ["PAID", "SUCCESS", "COMPLETED", "CAPTURED"].includes(s)
  );
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing your account...");
  const [error, setError] = useState<string | null>(null);

  const orderId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("order_id");
  }, []);

  useEffect(() => {
    const finalize = async () => {
      if (!orderId) {
        setError("Missing order_id in URL.");
        return;
      }

      try {
        setMessage("Verifying payment status...");
        const orderResp = await axiosInstance.get(`/api/cashfree/orders/${orderId}`);
        const paid = isOrderPaid(orderResp?.data);
        if (!paid) {
          setError("Payment not confirmed. If amount was deducted, contact support.");
          return;
        }

        setMessage("Creating your account...");
        const formRaw = localStorage.getItem("onboardingFormData");
        if (!formRaw) {
          setError("Onboarding data not found. Please register again.");
          return;
        }
        const formData = JSON.parse(formRaw);

        await axiosInstance.post("/api/auth/onboard", formData);

        // Cleanup onboarding state
        try {
          localStorage.removeItem("onboardingFormData");
          localStorage.removeItem("onboardingCurrentStep");
          localStorage.removeItem("onboardingOtpTimer");
          localStorage.removeItem("onboardingPending");
          localStorage.setItem("onboardingOpen", "false");
        } catch {}

        // Redirect to login after successful creation
        navigate(AppRoutes.login(), { replace: true });
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Something went wrong.";
        setError(msg);
      }
    };

    // Only finalize when coming from Cashfree redirect
    const pending = localStorage.getItem("onboardingPending");
    if (pending === "true") {
      finalize();
    } else if (orderId) {
      // If no pending flag, still attempt verification for resilience
      finalize();
    }
  }, [navigate, orderId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {!error ? (
          <>
            <div className="text-2xl font-semibold mb-2">Payment Successful</div>
            <p className="text-gray-600">{message}</p>
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold mb-2">We hit a snag</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(AppRoutes.register())}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Go back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}

