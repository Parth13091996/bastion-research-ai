import axiosInstance from "@/api/axios";
import { ArrowLeft } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";

const PaymentStep: React.FC<PaymentStepProps> = ({
  plans,
  formData,
  selectedPlan,
  isLoading,
  error,
  onBack,
  onClose,
  setError,
  setIsLoading,
}) => {
  const selectedPlanDetails = plans.find((p) => p.code === selectedPlan);
  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const orderResponse = await axiosInstance.post("/api/cashfree/orders", {
        plan: formData.selectedPlan,
        customer_id: formData.email,
        customer_email: formData.email,
        customer_phone: formData.phone,
      });

      const { payment_session_id } = orderResponse.data.order;

      // Persist a flag so success page knows to finalize onboarding
      try {
        localStorage.setItem("onboardingPending", "true");
      } catch {}

      // Initialize Cashfree SDK and redirect to hosted checkout
      const cashfree = await load({ mode: "sandbox" });
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false); // Set loading to false on error
    }
  };
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Payment
        </h2>
        <p className="text-gray-600 text-sm">
          Secure payment to activate your account
        </p>
      </div>

      {selectedPlanDetails && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span>{selectedPlanDetails.name}</span>
            <span className="font-semibold">₹{selectedPlanDetails.amount}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Setup fee</span>
            <span>₹0</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span>₹{selectedPlanDetails.amount}</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          {isLoading
            ? "Processing..."
            : `Pay ₹${selectedPlanDetails?.amount || ""}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
