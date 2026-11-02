import React, { useRef, useState, useEffect } from "react";
import { sendOtp } from "@/api/onboarding-apis";
import { Eye, EyeOff } from "lucide-react";

const RegisterStep: React.FC<RegisterStepProps> = ({
  formData,
  showPassword,
  onTogglePassword,
  updateFormData,
  error,
  isLoading,
  setIsLoading,
  setError,
  nextStep,
}) => {
  const isSubmittingRef = useRef(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  // Dynamic countdown timer for "Please wait XX seconds before requesting otp again."
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds !== null]);

  const handleRegister = async () => {
    if (isSubmittingRef.current || isLoading || cooldownSeconds !== null) return;
    setError(null);

    // Validate mandatory fields
    if (!formData.email.trim()) {
      setError("Please enter email.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter phone.");
      return;
    }
    if (!formData.password.trim()) {
      setError("Please enter password.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!formData.confirmPassword.trim()) {
      setError("Please enter confirm password.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const cleanPhone = formData.phone.trim().replace(/^(\+91|91|0)/, "");
      await sendOtp("+91" + cleanPhone);
      nextStep();
    } catch (err: any) {
      const remainingSeconds =
        err?.response?.data?.remainingSeconds ??
        err?.response?.data?.cooldown;

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred.";

      if (typeof remainingSeconds === "number" && remainingSeconds > 0) {
        setCooldownSeconds(remainingSeconds);
        setError(null);
      } else {
        const match =
          typeof errorMessage === "string"
            ? errorMessage.match(/(\d+)\s*second/i)
            : null;
        if (match && match[1]) {
          setCooldownSeconds(parseInt(match[1], 10));
          setError(null);
        } else {
          setError(errorMessage);
        }
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Start with Creating Your Free Account
        </h2>
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
            <span className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
              +91
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                updateFormData("phone", e.target.value);
                if (cooldownSeconds !== null) setCooldownSeconds(null);
              }}
              className="w-full flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              onClick={onTogglePassword}
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
      {(cooldownSeconds !== null || error) && (
        <p className="text-red-500 text-sm text-center">
          {cooldownSeconds !== null
            ? `Please wait ${cooldownSeconds} second${cooldownSeconds === 1 ? "" : "s"} before requesting otp again.`
            : error}
        </p>
      )}
      <button
        onClick={handleRegister}
        disabled={isLoading || cooldownSeconds !== null}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {"Get OTP →"}
      </button>
    </div>
  );
};

export default RegisterStep;
