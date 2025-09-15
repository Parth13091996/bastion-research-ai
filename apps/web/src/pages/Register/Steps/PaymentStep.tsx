import axiosInstance from "@/api/axios";
import { ArrowLeft } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/routes/app-routes";

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
  setCurrentStep,
}) => {
  const selectedPlanDetails = plans.find((p) => p.code === selectedPlan);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (selectedPlanDetails?.name === "Freemium") {
        // Directly onboard without payment
        await axiosInstance.post("/api/auth/onboard", formData);
        try {
          localStorage.removeItem("onboardingFormData");
          localStorage.removeItem("onboardingCurrentStep");
          localStorage.removeItem("onboardingOtpTimer");
          localStorage.removeItem("onboardingPending");
          localStorage.setItem("onboardingOpen", "false");
        } catch {}
        navigate(AppRoutes.login(), { replace: true });
        return;
      }
      const orderResponse = await axiosInstance.post("/api/cashfree/orders", {
        plan: formData.selectedPlan,
        customer_id: formData.email,
        customer_email: formData.email,
        customer_phone: formData.phone,
        source: "register",
        return_url: location.origin + "/login",
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

  const onBackHandler = () => {
    if (selectedPlanDetails?.name === "Freemium") {
      setCurrentStep(3);
      return;
    }
    onBack();
  };

  // Show different content for Freemium plan
  if (selectedPlanDetails?.name === "Freemium") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Free Plan Selected
          </h2>
          <p className="text-gray-600 text-sm">
            You're using our free plan with limited features
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Welcome to TripleEdge!
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              You're starting with our free plan. While features are limited,
              you can always upgrade later for full access.
            </p>
            <div className="text-xs text-blue-700">
              <p className="mb-1">• Basic portfolio tracking</p>
              <p className="mb-1">• Limited market data</p>
              <p>• Community support</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm text-center">
            <strong>Want more features?</strong> Upgrade anytime to unlock
            advanced analytics, real-time data, and premium support.
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex space-x-3">
          <button
            onClick={onBackHandler}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-1" /> Back
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </div>
      </div>
    );
  }

  // Original payment flow for paid plans
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
          onClick={onBackHandler}
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
            : selectedPlanDetails?.code === "free"
              ? "Complete Signup"
              : `Pay ₹${selectedPlanDetails?.amount || ""}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
