import {
  createCashfreeOrder,
  updateUser,
  validateCoupon as apiValidateCoupon,
} from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import { Config } from "@/utils/config";
import { load } from "@cashfreepayments/cashfree-js";
import { ArrowLeft, Check, Tag, X } from "lucide-react";
import { useState } from "react";

const PaymentStep: React.FC<PaymentStepProps> = ({
  plans,
  formData,
  selectedPlan,
  isLoading,
  error,
  onBack,
  setError,
  setIsLoading,
}) => {
  const selectedPlanDetails = plans.find((p) => p.code === selectedPlan);
  const { user } = useAuth();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const formatMoney = (value: number) => {
    try {
      return (
        "₹ " +
        value.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } catch {
      return "₹ " + value.toFixed(2);
    }
  };

  // Calculate discount amount
  const calculateDiscount = (coupon, originalAmount) => {
    if (!coupon) return 0;

    if (coupon.discount_type === "percentage") {
      return (originalAmount * coupon.discount_value) / 100;
    } else if (coupon.discount_type === "fixed") {
      return Math.min(coupon.discount_value, originalAmount);
    }
    return 0;
  };

  // Final payable amount (no GST)
  const getFinalAmount = () => {
    if (!selectedPlanDetails) return 0;
    const originalAmount = selectedPlanDetails.amount;
    const discount = calculateDiscount(appliedCoupon, originalAmount);
    return Math.max(0, originalAmount - discount);
  };

  // Validate and apply coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const coupon = await apiValidateCoupon(couponCode.trim());
      setAppliedCoupon(coupon);
      setCouponError("");
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to validate coupon. Please try again.";
      setCouponError(errorMessage);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePayment = async () => {
    setError(null);

    if (!formData?.panVerification?.valid) {
      setError("Please complete PAN verification before proceeding to payment.");
      return;
    }

    setIsLoading(true);
    try {
      const finalAmount = getFinalAmount();
      const isFreeOrZero = finalAmount === 0 || selectedPlanDetails?.code === "1";

      if (isFreeOrZero) {
        const userId = user?.id || formData.email;
        const planCode = selectedPlanDetails?.code || "1";

        await updateUser(userId, {
          status: "active",
          plan_id: planCode,
        });

        await createCashfreeOrder({
          plan: formData.selectedPlan,
          customer_id: userId,
          customer_email: formData.email,
          customer_phone: formData.phone,
          source: "register",
          is_free: true,
          coupon_code: appliedCoupon?.coupon_code || null,
          discount_amount: 0,
        });

        window.location.href = location.origin + "/login";
        return;
      }

      const orderResponse = await createCashfreeOrder({
        plan: formData.selectedPlan,
        customer_id: user?.id || formData.firstName + "_" + formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        source: "register",
        coupon_code: appliedCoupon?.coupon_code || null,
        discount_amount: finalAmount,
        metadata: {
          panReference: formData.panVerification?.referenceId || null,
          panStatus: formData.panVerification?.status || null,
        },
      });

      const { payment_session_id } = (orderResponse as any).order;

      const cashfree = await load({ mode: Config.cashfree_environment });
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onBackHandler = () => {
    onBack();
  };

  const finalAmount = getFinalAmount();
  const isFreeOrZero = finalAmount === 0 || selectedPlanDetails?.code === "1";

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
          <h3 className="text-center text-lg font-semibold mb-3">
            Payment Summary
          </h3>

          <div className="text-center text-sm text-gray-700 mb-4">
            Your currently selected plan :
            <span className="font-semibold"> {selectedPlanDetails.name}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span>Plan Amount</span>
            <span className="font-semibold">
              {formatMoney(selectedPlanDetails.amount)}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between items-center text-xs text-green-700 mb-2">
              <span>Discount ({appliedCoupon.coupon_code})</span>
              <span>
                -
                {formatMoney(
                  calculateDiscount(appliedCoupon, selectedPlanDetails.amount)
                )}
              </span>
            </div>
          )}

          <hr className="my-2" />

          <div className="flex justify-between items-center font-semibold">
            <span>Final Payable Amount</span>
            <span>{formatMoney(finalAmount)}</span>
          </div>
        </div>
      )}

      {/* Coupon Code Input */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center mb-2">
          <Tag size={16} className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Coupon Code</span>
        </div>

        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isValidatingCoupon || isFreeOrZero}
            />
            <button
              onClick={validateCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isValidatingCoupon ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <Check size={16} className="text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {appliedCoupon.coupon_code} applied
              </span>
              <span className="text-green-600 text-sm ml-2">
                (
                {appliedCoupon.discount_type === "percentage"
                  ? `${appliedCoupon.discount_value}% off`
                  : `₹${appliedCoupon.discount_value} off`}
                )
              </span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
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
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          {selectedPlanDetails?.code === "free"
            ? "Complete Signup"
            : `Pay ${formatMoney(finalAmount)}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
