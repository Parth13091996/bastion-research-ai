type UpdateFormFn = (field: string, value: any) => void;

interface OnboardingFormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string[];
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  company?: string;
  panCard: string;
  panVerification?: PanVerificationSummary | null;
  agreeToTerms: boolean;
  selectedPlan: string;
  agreementSignatureUrl?: string;
  agreementSignaturePath?: string;
  agreementSignedAt?: string;
}

interface PanVerificationSummary {
  referenceId?: string;
  valid?: boolean;
  status?: "VALID" | "INVALID" | "PENDING" | "FAILED";
  registeredName?: string;
  nameMatchScore?: string;
  message?: string;
  checkedAt?: string;
}

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

interface RegisterStepProps {
  formData: {
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  showPassword: boolean;
  onTogglePassword: () => void;
  nextStep: () => void;
  updateFormData: UpdateFormFn;
  error: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

interface VerifyStepProps {
  otp: string[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  nextStep: () => void;
  updateFormData: (field: string, value: any) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  formData: OnboardingFormData;
  email: string;
  phone: string;
}

interface OnboardStepProps {
  formData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address1?: string;
    address2?: string;
    state?: string;
    city?: string;
    pinCode?: string;
    company?: string;
  };
  updateFormData: UpdateFormFn;
  setCurrentStep: any;
  onNext: () => void;
}

interface KYCStepProps {
  formData: {
    panCard: string;
    firstName: string;
    lastName: string;
    panVerification?: PanVerificationSummary | null;
  };
  updateFormData: UpdateFormFn;
  onBack: () => void;
  onNext: () => void;
}

interface PlansStepProps {
  plans: Plan[];
  formData: OnboardingFormData;
  updateFormData: UpdateFormFn;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

interface AgreementStepProps {
  agreeToTerms: boolean;
  updateFormData: UpdateFormFn;
  onBack: () => void;
  onNext: () => void;
  // Access to identifier for the agreement upload (email/phone)
  formData?: OnboardingFormData;
}

interface PaymentStepProps {
  plans: Plan[];
  selectedPlan: string;
  isLoading: boolean;
  error: string | null;
  formData: OnboardingFormData;
  onBack: () => void;
  onClose: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}
