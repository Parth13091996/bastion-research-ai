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
import { endpoints } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import favicon from "../../../../server/public/favicon.webp";

const SignUpForm: React.FC<SignUpFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

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
    address1: "",
    address2: "",
    state: "",
    city: "",
    pinCode: "",
    company: "",
    panCard: "",
    panVerification: null,
    agreeToTerms: false,
    selectedPlan: "",
    agreementSignatureUrl: "",
    agreementSignaturePath: "",
    agreementSignedAt: "",
  });
  const stepsValues = [
    { id: 1, name: "Register", icon: "👤" },
    { id: 2, name: "Verify", icon: "✓" },
    { id: 3, name: "Onboard", icon: "📋" },
    { id: 4, name: "KYC", icon: "🆔" },
    { id: 5, name: "Agreement", icon: "📄" },
    { id: 6, name: "Plans", icon: "📋" },
    { id: 7, name: "Payment", icon: "💳" },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [steps, setSteps] = useState(stepsValues);
  const maxStep = stepsValues.length;

  useEffect(() => {
    const formDataFromStorage = localStorage.getItem("onboardingFormData");
    if (formDataFromStorage) {
      try {
        setFormData(JSON.parse(formDataFromStorage));
      } catch {}
    }
  }, [currentStep]);

  useEffect(() => {
    const shouldResumeOnboarding = user?.status === "onboarding";
    const agreementSigned = user?.status === "agreement_signed";
    if (shouldResumeOnboarding) {
      setCurrentStep(5);
    }
    if (agreementSigned) {
      setCurrentStep(6);
    }
  }, [user]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as OnboardingFormData;
      if (
        (field === "firstName" ||
          field === "lastName" ||
          field === "panCard") &&
        prev.panVerification
      ) {
        next.panVerification = null;
      }
      return next;
    });
  };

  const nextStep = () => {
    setError(null);
    if (currentStep < maxStep) {
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
    setError("");
  };

  useEffect(() => {
    if (Object.values(formData).flat(Infinity).filter(Boolean).length) {
      localStorage.setItem("onboardingFormData", JSON.stringify(formData));
      localStorage.setItem("onboardingStep", JSON.stringify(currentStep));
    }
  }, [formData]);

  useEffect(() => {
    setSteps(stepsValues);
  }, [plans.length]);

  useEffect(() => {
    try {
      localStorage.setItem("onboardingCurrentStep", String(currentStep));
    } catch {}
  }, [currentStep]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (currentStep >= 5) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(endpoints.cashfree.plans);
          const apiPlans: Plan[] = response.data.plans || [];
          setPlans(apiPlans);
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
    const registerFormData = {
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };
    const onboardFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      address1: formData.address1,
      address2: formData.address2,
      state: formData.state,
      city: formData.city,
      pinCode: formData.pinCode,
      company: formData.company,
    };
    const kycFormData = {
      panCard: formData.panCard,
      firstName: formData.firstName,
      lastName: formData.lastName,
      panVerification: formData.panVerification || null,
    };
    switch (currentStep) {
      case 1:
        return (
          <RegisterStep
            formData={registerFormData}
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
            formData={formData}
            isLoading={isLoading}
            email={formData.email}
            phone={formData.phone}
            onBack={prevStep}
            setError={setError}
            nextStep={nextStep}
            setIsLoading={setIsLoading}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <OnboardStep
            formData={onboardFormData}
            onNext={nextStep}
            setCurrentStep={setCurrentStep}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <KYCStep
            formData={kycFormData}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <AgreementStep
            agreeToTerms={formData.agreeToTerms}
            //@ts-ignore
            formData={{ email: formData.email, phone: formData.phone }}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 6:
        return (
          <PlansStep
            plans={plans}
            error={error}
            isLoading={isLoading}
            formData={formData}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="w-full sm:w-80 bg-gray-50 p-4 sm:p-6 border-b sm:border-b-0 sm:border-r overflow-y-auto pt-8 sm:pt-6">
          {/* ↑ Added pt-8 for mobile spacing */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-2">
              <img src={favicon} alt="BASTION" className="w-8 h-8 mr-3" />
              <span className="font-bold text-lg">BASTION</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              TripleEdge
            </h1>
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg transition-colors text-sm sm:text-base ${
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
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Subscribe to invest in <strong>TripleEdge</strong>
            </p>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;


