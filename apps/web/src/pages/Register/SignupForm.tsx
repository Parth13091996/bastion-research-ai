import { Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import AgreementStep from "./Steps/AgreementStep";
import KYCStep from "./Steps/KYCStep";
import OnboardStep from "./Steps/OnboardingStep";
import PaymentStep from "./Steps/PaymentStep";
import PlansStep from "./Steps/PlansStep";
import RegisterStep from "./Steps/RegisterStep";
import VerifyStep from "./Steps/VerifyStep";

const SignUpForm: React.FC<SignUpFormProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
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
  // OTP countdown timer in seconds (10 minutes)
  const [otpTimer, setOtpTimer] = useState(600);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const formDataFromStorage = localStorage.getItem("onboardingFormData");
    const stepFromStorage = localStorage.getItem("onboardingCurrentStep");
    const otpTimerFromStorage = localStorage.getItem("onboardingOtpTimer");
    if (formDataFromStorage) {
      try {
        setFormData(JSON.parse(formDataFromStorage));
      } catch {}
    }
    if (stepFromStorage) {
      const step = parseInt(stepFromStorage, 10);
      if (!Number.isNaN(step) && step >= 1 && step <= 7) {
        setCurrentStep(step);
      }
    }
    if (otpTimerFromStorage) {
      const t = parseInt(otpTimerFromStorage, 10);
      if (!Number.isNaN(t) && t >= 0) {
        setOtpTimer(t);
      }
    }
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

  const nextStep = () => {
    setError(null);
    if (currentStep < 8) {
      const next = currentStep + 1;
      setCurrentStep(next);
      try {
        localStorage.setItem("onboardingCurrentStep", String(next));
      } catch {}
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      try {
        localStorage.setItem("onboardingCurrentStep", String(prev));
      } catch {}
    }
  };

  // Persist form data locally for continuity between steps
  useEffect(() => {
    localStorage.setItem("onboardingFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (otpTimer === 0) {
      // Handle timer expiration
    }
    return () => clearInterval(timer);
  }, [currentStep, otpTimer]);

  // Persist current step and OTP timer
  useEffect(() => {
    try {
      localStorage.setItem("onboardingCurrentStep", String(currentStep));
    } catch {}
  }, [currentStep]);

  useEffect(() => {
    try {
      localStorage.setItem("onboardingOtpTimer", String(otpTimer));
    } catch {}
  }, [otpTimer]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (currentStep === 5) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get("/api/cashfree/plans");
          const apiPlans: Plan[] = response.data.plans || [];
          const freePlan: Plan = { code: "free", name: "Freemium", amount: 0, currency: "INR" };
          setPlans([freePlan, ...apiPlans]);
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RegisterStep
            formData={{
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
            error={error}
            isLoading={isLoading}
            showPassword={showPassword}
            setError={setError}
            nextStep={nextStep}
            setIsLoading={setIsLoading}
            updateFormData={updateFormData}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        );
      case 2:
        return (
          <VerifyStep
            error={error}
            otp={formData.otp}
            otpTimer={otpTimer}
            formData={formData}
            isLoading={isLoading}
            email={formData.email}
            phone={formData.phone}
            onBack={prevStep}
            setError={setError}
            nextStep={nextStep}
            setOtpTimer={setOtpTimer}
            setIsLoading={setIsLoading}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <OnboardStep
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              dateOfBirth: formData.dateOfBirth,
            }}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <KYCStep
            formData={{
              panCard: formData.panCard,
              aadharCard: formData.aadharCard,
              bankAccount: formData.bankAccount,
              ifscCode: formData.ifscCode,
            }}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <PlansStep
            plans={plans}
            error={error}
            isLoading={isLoading}
            selectedPlan={formData.selectedPlan}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 6:
        return (
          <AgreementStep
            agreeToTerms={formData.agreeToTerms}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 7:
        return (
          <PaymentStep
            error={error}
            plans={plans}
            formData={formData}
            isLoading={isLoading}
            selectedPlan={formData.selectedPlan}
            onBack={prevStep}
            onClose={onClose}
            setError={setError}
            setOtpTimer={setOtpTimer}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return (
          <RegisterStep
            formData={{
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
            error={error}
            isLoading={isLoading}
            showPassword={showPassword}
            setError={setError}
            nextStep={nextStep}
            setIsLoading={setIsLoading}
            updateFormData={updateFormData}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        );
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
