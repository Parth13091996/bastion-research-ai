import React, { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../api/axios";

declare const Cashfree: any;

interface SignUpFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Plan {
  code: string;
  name: string;
  amount: number;
  currency: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: ["", "", "", "", "", ""],
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    panCard: "",
    aadharCard: "",
    bankAccount: "",
    ifscCode: "",
    agreeToTerms: false,
    selectedPlan: "",
  });
  const [otpTimer, setOtpTimer] = useState(51);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      let sessionIdFromStorage = localStorage.getItem("onboardingSessionId");
      const formDataFromStorage = localStorage.getItem("onboardingFormData");

      if (formDataFromStorage) {
        setFormData(JSON.parse(formDataFromStorage));
      }

      if (sessionIdFromStorage) {
        setSessionId(sessionIdFromStorage);
      } else {
        try {
          const response = await axiosInstance.post("/api/onboarding/session");
          sessionIdFromStorage = response.data.sessionId;
          setSessionId(sessionIdFromStorage);
          localStorage.setItem("onboardingSessionId", sessionIdFromStorage);
        } catch (err) {
          setError("Failed to create an onboarding session. Please try again.");
          console.error(err);
        }
      }
    };

    initializeSession();
  }, []);

  const steps = [
    { id: 1, name: "Register", icon: "👤" },
    { id: 2, name: "Verify", icon: "✓" },
    { id: 3, name: "Onboard", icon: "📋" },
    { id: 4, name: "KYC", icon: "🆔" },
    { id: 5, name: "Plans", icon: "📋" },
    { id: 6, name: "Agreement", icon: "📄" },
    { id: 7, name: "Payment", icon: "💳" },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      updateFormData("otp", newOtp);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[name="otp-${index + 1}"]`
        );
        //@ts-ignore
        if (nextInput) nextInput?.focus();
      }
    }
  };

  const nextStep = () => {
    setError(null);
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateSessionData = async () => {
    if (!sessionId) return;
    try {
      await axiosInstance.put(`/api/onboarding/session/${sessionId}`, {
        session_data: formData,
      });
    } catch (err) {
      console.error("Failed to update session data", err);
      // We can choose to show an error to the user here
    }
  };

  // This function will be called whenever the form data changes, to keep the backend in sync.
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("onboardingFormData", JSON.stringify(formData));
      updateSessionData();
    }
  }, [formData, sessionId]);

  const handleRegister = async () => {
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      // Data is already updated in the session via useEffect
      await axiosInstance.post("/api/otp/send", {
        sessionId: sessionId,
      });
      nextStep();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    const otp = formData.otp.join("");
    try {
      await axiosInstance.post("/api/otp/verify", {
        sessionId: sessionId,
        otp: otp,
      });
      nextStep();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axiosInstance.post("/api/otp/send", {
        sessionId: sessionId,
      });
      setOtpTimer(51); // Reset timer
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const orderResponse = await axiosInstance.post("/api/cashfree/orders", {
        plan: formData.selectedPlan,
        customer_id: formData.email,
        customer_email: formData.email,
        customer_phone: formData.phone,
        sessionId: sessionId,
      });

      const { payment_session_id } = orderResponse.data.order;
      const cashfree = new Cashfree(payment_session_id);

      cashfree
        .checkout({
          paymentSessionId: payment_session_id,
          returnUrl: `http://localhost:5173/`, // This can be a proper success page
        })
        .then(async (result: any) => {
          if (result.error) {
            setError(result.error.message);
            setIsLoading(false);
            return;
          }
          if (result.paymentDetails.paymentStatus === "SUCCESS") {
            // The backend webhook will handle user creation.
            // We can just show a success message here or redirect to a success page.
            alert(
              "Payment successful! Welcome to TripleEdge! Your account is being created."
            );
            onClose();
          }
        });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      setIsLoading(false); // Set loading to false on error
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      // Handle timer expiration
    }
    return () => clearInterval(timer);
  }, [currentStep, otpTimer]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (currentStep === 5) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get("/api/cashfree/plans");
          setPlans(response.data.plans);
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to fetch plans.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchPlans();
  }, [currentStep]);

  if (!isOpen) return null;

  // Step 1: Register
  const RegisterStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 text-sm">
          Join TripleEdge to start your investment journey
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email*
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone*
          </label>
          <div className="flex">
            <select className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
              <option>🇮🇳 +91</option>
            </select>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password*
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
              placeholder="Create password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password*
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Confirm password"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Get OTP →"}
      </button>
    </div>
  );

  // Step 2: Verify
  const VerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Enter OTP to verify
        </h2>
        <p className="text-gray-600 text-sm">
          We have sent you a message with a 6-digit verification code on
          <br />
          {formData.email} & {formData.phone}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {formData.otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
              maxLength={1}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Expire in 0:{otpTimer.toString().padStart(2, "0")}
          </p>
          <button
            onClick={handleResendOtp}
            disabled={isLoading || otpTimer > 0}
            className="text-red-600 text-sm hover:underline mt-1 disabled:text-gray-400"
          >
            Didn't receive the OTP? Resend OTP
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="flex space-x-3">
        <button
          onClick={prevStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={handleVerifyOtp}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
        >
          {isLoading ? (
            "Verifying..."
          ) : (
            <>
              <Check size={20} className="mr-1" /> Verify OTP
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Step 3: Onboard
  const OnboardStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600 text-sm">
          Please provide your basic details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth*
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={prevStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={nextStep}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Step 4: KYC
  const KYCStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          KYC Verification
        </h2>
        <p className="text-gray-600 text-sm">
          Please provide your identity documents
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Card Number*
          </label>
          <input
            type="text"
            value={formData.panCard}
            onChange={(e) =>
              updateFormData("panCard", e.target.value.toUpperCase())
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aadhar Card Number*
          </label>
          <input
            type="text"
            value={formData.aadharCard}
            onChange={(e) => updateFormData("aadharCard", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="1234 5678 9012"
            maxLength={12}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account*
            </label>
            <input
              type="text"
              value={formData.bankAccount}
              onChange={(e) => updateFormData("bankAccount", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Account number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code*
            </label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) =>
                updateFormData("ifscCode", e.target.value.toUpperCase())
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="SBIN0001234"
              maxLength={11}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={prevStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={nextStep}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const PlansStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 text-sm">
          Select the investment plan that suits you best
        </p>
      </div>

      {isLoading ? (
        <p className="text-center">Loading plans...</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer hover:border-red-500 ${formData.selectedPlan === plan.code ? "border-red-500 border-2" : ""}`}
              onClick={() => updateFormData("selectedPlan", plan.code)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{plan.name}</h3>
                <span className="text-red-600 font-bold">₹{plan.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={prevStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={nextStep}
          disabled={!formData.selectedPlan || isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Step 7: Agreement
  const AgreementStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Terms & Agreement
        </h2>
        <p className="text-gray-600 text-sm">
          Please review and accept our terms
        </p>
      </div>

      <div className="max-h-48 overflow-y-auto border rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-semibold mb-2">Terms of Service</h3>
        <p className="mb-4">
          By using TripleEdge services, you agree to the following terms and
          conditions...
        </p>
        <p className="mb-4">
          1. Investment Risks: All investments carry risk of loss. Past
          performance does not guarantee future results.
        </p>
        <p className="mb-4">
          2. Service Agreement: You agree to pay applicable fees for the
          services provided.
        </p>
        <p className="mb-4">
          3. Privacy Policy: We will protect your personal information as
          outlined in our privacy policy.
        </p>
      </div>

      <label className="flex items-start">
        <input
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
          className="mt-1 mr-2"
        />
        <span className="text-sm text-gray-700">
          I agree to the Terms of Service and Privacy Policy
        </span>
      </label>

      <div className="flex space-x-3">
        <button
          onClick={prevStep}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={nextStep}
          disabled={!formData.agreeToTerms}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );

  // Step 8: Payment
  const PaymentStep = () => {
    const selectedPlanDetails = plans.find(
      (p) => p.code === formData.selectedPlan
    );

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
              <span className="font-semibold">
                ₹{selectedPlanDetails.amount}
              </span>
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
            onClick={prevStep}
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegisterStep />;
      case 2:
        return <VerifyStep />;
      case 3:
        return <OnboardStep />;
      case 4:
        return <KYCStep />;
      case 5:
        return <PlansStep />;
      case 6:
        return <AgreementStep />;
      case 7:
        return <PaymentStep />;
      default:
        return <RegisterStep />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 p-6 border-r">
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm mr-3">
                  B
                </div>
                <span className="font-bold text-lg">BASTION</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                TripleEdge
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>Creation date: 31 Jul 2025</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈</span>
                  <span>Returns: 58.15%</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⚡</span>
                  <span>Risk: Aggressive</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>Volatility: High</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-red-100 text-red-700 border-l-4 border-red-500"
                      : currentStep > step.id
                        ? "bg-green-50 text-green-700"
                        : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 ${
                      currentStep === step.id
                        ? "bg-red-500 text-white"
                        : currentStep > step.id
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? <Check size={12} /> : step.id}
                  </div>
                  <span className="font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Subscribe to invest in <strong>TripleEdge</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
