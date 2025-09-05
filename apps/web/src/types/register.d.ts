declare const Cashfree: any;

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
  panCard: string;
  aadharCard: string;
  bankAccount: string;
  ifscCode: string;
  agreeToTerms: boolean;
  selectedPlan: string;
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
  setError: React.Dispatch<React.SetStateAction<string>>;
}

interface VerifyStepProps {
  otp: string[];
  otpTimer: number;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  nextStep: () => void;
  updateFormData: (field: string, value: any) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setOtpTimer: React.Dispatch<React.SetStateAction<number>>;
  formData: OnboardingFormData;
  email: string;
  phone: string;
}

interface OnboardStepProps {
  formData: { firstName: string; lastName: string; dateOfBirth: string };
  updateFormData: UpdateFormFn;
  onBack: () => void;
  onNext: () => void;
}

interface KYCStepProps {
  formData: {
    panCard: string;
    aadharCard: string;
    bankAccount: string;
    ifscCode: string;
  };
  updateFormData: UpdateFormFn;
  onBack: () => void;
  onNext: () => void;
}

interface PlansStepProps {
  plans: Plan[];
  selectedPlan: string;
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
  setOtpTimer: React.Dispatch<React.SetStateAction<number>>;
}
