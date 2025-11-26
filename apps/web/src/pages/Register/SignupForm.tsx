import { Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AgreementStep from "./Steps/AgreementStep";
import KYCStep from "./Steps/KYCStep";
import OnboardStep from "./Steps/OnboardingStep";
import PaymentStep from "./Steps/PaymentStep";
import PlansStep from "./Steps/PlansStep";
import RegisterStep from "./Steps/RegisterStep";
import VerifyStep from "./Steps/VerifyStep";
import { fetchPlans } from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import favicon from "../../../../server/public/favicon.webp";

const SignUpForm: React.FC<SignUpFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAgreementSignedUser = user?.status === "agreement_signed";

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
    { id: 1, name: "Register", icon: "??" },
    { id: 2, name: "Verify", icon: "V" },
    { id: 3, name: "Onboard", icon: "??" },
    { id: 4, name: "Plans", icon: "??" },
    { id: 5, name: "KYC", icon: "??" },
    { id: 6, name: "Agreement", icon: "??" },
    { id: 7, name: "Payment", icon: "??" },
  ];

  // For users who have already completed Agreement (status === "agreement_signed"),
  // we show a lean flow with only Plans and Payment.
  const agreementSignedStepsValues = [
    { id: 1, name: "Plans", icon: "??" },
    { id: 2, name: "Payment", icon: "??" },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [steps, setSteps] = useState(
    isAgreementSignedUser ? agreementSignedStepsValues : stepsValues
  );
  const maxStep = isAgreementSignedUser
    ? agreementSignedStepsValues.length
    : stepsValues.length;

  useEffect(() => {
    const shouldResumeOnboarding = user?.status === "onboarded";
    const agreementSigned = user?.status === "agreement_signed";

    // Prefill common user details when resuming.
    if (shouldResumeOnboarding || agreementSigned) {
      setFormData((prev) => ({
        ...prev,
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        address1: user?.address_1 || "",
        address2: user?.address_2 || "",
        state: user?.state || "",
        city: user?.city || "",
        pinCode: user?.pin_code || "",
        dateOfBirth: user?.date_of_birth || "",
        company: user?.company || "",
        panCard: user?.pan_card_number || "",
        panVerification: user?.pan_card_number
          ? { valid: true }
          : prev.panVerification,
      }));
    }

    if (shouldResumeOnboarding) {
      // KYC is already completed in this state; resume from Agreement step.
      setCurrentStep(6);
    }
    // For agreement_signed users we intentionally start from step 1
    // of the lean (Plans + Payment) flow, so no currentStep jump here.
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
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
    }
    setError("");
  };

  useEffect(() => {
    setSteps(isAgreementSignedUser ? agreementSignedStepsValues : stepsValues);
  }, [plans.length, isAgreementSignedUser]);

  useEffect(() => {
    const loadPlans = async () => {
      // Plans are needed from the Plans step onwards.
      const plansStepIndex = isAgreementSignedUser ? 1 : 4;
      if (currentStep >= plansStepIndex) {
        setIsLoading(true);
        try {
          const apiPlans: Plan[] = await fetchPlans();
          setPlans(apiPlans);
        } catch (err: any) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to fetch plans."
          );
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadPlans();
  }, [currentStep, isAgreementSignedUser]);

  // ? Auto-scroll mobile step bar when step changes
  useEffect(() => {
    const activeStep = document.getElementById(`step-${currentStep}`);
    const scrollContainer = document.getElementById("mobile-steps");
    if (activeStep && scrollContainer) {
      const stepLeft =
        activeStep.offsetLeft -
        scrollContainer.clientWidth / 2 +
        activeStep.clientWidth / 2;
      scrollContainer.scrollTo({
        left: stepLeft,
        behavior: "smooth",
      });
    }
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

    // Lean flow for users who already signed the agreement:
    // only Plans (no free plan) and Payment.
    if (isAgreementSignedUser) {
      const paidPlans = plans.filter((plan) => {
        const planCode = (plan as any)?.plan_code as string | undefined;
        const isFree =
          String(plan.amount) === "0" ||
          (planCode && planCode.toLowerCase() === "freemium");
        return !isFree;
      });

      switch (currentStep) {
        case 1:
          return (
            <PlansStep
              plans={paidPlans}
              error={error}
              isLoading={isLoading}
              formData={formData}
              // For this lean flow, going "Back" from the first step
              // simply closes the signup dialog.
              onBack={onClose}
              onNext={nextStep}
              updateFormData={updateFormData}
              setIsLoading={setIsLoading}
            />
          );
        case 2:
          return (
            <PaymentStep
              error={error}
              plans={paidPlans}
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
          return null;
      }
    }

    // Default full onboarding flow.
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
          <PlansStep
            plans={plans}
            error={error}
            isLoading={isLoading}
            formData={formData}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
            setIsLoading={setIsLoading}
          />
        );
      case 5:
        return (
          <KYCStep
            formData={formData}
            onBack={prevStep}
            onNext={nextStep}
            updateFormData={updateFormData}
          />
        );
      case 6:
        return (
          <AgreementStep
            agreeToTerms={formData.agreeToTerms}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center  justify-center p-2 sm:p-4 z-[999999] top-0">
      <div className="bg-white rounded-xl shadow-2xl sm:mt-[0px] mt-[10vh] w-full max-w-5xl max-h-[84dvh] overflow-auto flex flex-col sm:flex-row">
        {/* Sidebar for larger screens */}
        <div className="hidden sm:block w-80 bg-gray-50 p-6 border-r overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <img src={favicon} alt="BASTION" className="w-8 h-8 mr-3" />
              <span className="font-bold text-lg">Bastion CORE</span>
            </div>
            {/* <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Bastion Core
            </h1> */}
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg transition-colors text-base ${
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
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="block sm:hidden bg-gray-50 p-4 border-b">
            {/* Logo + Title */}
            <div className="mb-4">
              <div className="flex items-center mb-1 sm:flex">
                <img src={favicon} alt="BASTION" className="w-8 h-8 mr-2" />
                <span className="font-bold text-lg">Bastion CORE</span>
              </div>
              {/* <h1 className="text-xl font-bold text-gray-900">Bastion Core</h1> */}
            </div>

            {/* ?? Horizontal Scroll Steps */}
            <div
              id="mobile-steps"
              className="flex overflow-x-auto no-scrollbar space-x-2 py-2"
            >
              {steps.map((step) => (
                <div
                  key={step.id}
                  id={`step-${step.id}`}
                  className={`flex flex-col items-center flex-shrink-0 px-3 py-2 rounded-lg transition-colors text-xs ${
                    currentStep === step.id
                      ? "bg-red-100 text-red-700"
                      : currentStep > step.id
                        ? "bg-green-50 text-green-700"
                        : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs mb-1 ${
                      currentStep === step.id
                        ? "bg-red-500 text-white"
                        : currentStep > step.id
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? <Check size={10} /> : step.id}
                  </div>
                  <span className="font-medium text-center whitespace-nowrap">
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600">
                Subscribe to <strong>Bastion CORE</strong>
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
    </div>
  );
};

export default SignUpForm;
