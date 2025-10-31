import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing your subscription...");

  useEffect(() => {
    const orderId = params.get("order_id");
    if (!orderId) {
      setMessage("Missing payment reference. Redirecting...");
      const t = setTimeout(() => navigate("/login", { replace: true }), 1000);
      return () => clearTimeout(t);
    }
    const run = async () => {
      try {
        await axiosInstance.post(`/api/cashfree/reconcile/${orderId}`);
        setMessage("Subscription activated. Redirecting...");
      } catch (e: any) {
        // Even if reconciliation fails (e.g., already reconciled), move on
        setMessage("Checked payment status. Redirecting...");
      } finally {
        const t = setTimeout(() => navigate("/login", { replace: true }), 1200);
        return () => clearTimeout(t);
      }
    };
    run();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-700">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

