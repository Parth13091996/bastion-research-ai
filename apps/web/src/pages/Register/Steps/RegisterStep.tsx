import React, { useRef, useState, useEffect } from "react";
import { sendOtp } from "@/api/onboarding-apis";
import { Eye, EyeOff } from "lucide-react";
import { validateEmail } from "@/utils";

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
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUntil = sessionStorage.getItem("bastion_otp_cooldown_until");
      if (storedUntil) {
        const remaining = Math.ceil((parseInt(storedUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : null;
      }
    } catch { }
    return null;
  });

  // Dynamic countdown timer for cooldown
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          try {
            sessionStorage.removeItem("bastion_otp_cooldown_until");
          } catch { }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds !== null]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least 1 lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least 1 number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password)) {
      return "Password must contain at least 1 special character.";
    }

    const weakPasswords = [
      "password",
      "password123",
      "12345678",
      "123456789",
      "admin123",
      "bastion123",
      "qwerty123",
      "pass1234",
      "abcdefgh",
    ];
    if (weakPasswords.includes(password.toLowerCase().trim())) {
      return "This password is too common or weak. Please choose a stronger password.";
    }

    return null;
  };

  const handleRegister = async () => {
    if (isSubmittingRef.current || isLoading || cooldownSeconds !== null) return;
    setError(null);

    // Validate email
    const trimmedEmail = formData.email.trim();
    const emailErr = validateEmail(trimmedEmail);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    // Validate phone
    const cleanPhone = formData.phone.trim().replace(/\D/g, "").slice(-10);
    if (!cleanPhone) {
      setError("Please enter phone.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    if (/^(\d)\1{9}$/.test(cleanPhone)) {
      setError("Invalid mobile number. Repeated digits are not allowed.");
      return;
    }
    const sequentialPatterns = ["1234567890", "0123456789", "9876543210"];
    if (sequentialPatterns.includes(cleanPhone)) {
      setError("Invalid mobile number. Sequential digits are not allowed.");
      return;
    }

    // Validate password
    if (!formData.password.trim()) {
      setError("Please enter password.");
      return;
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
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
      await sendOtp("+91" + cleanPhone, trimmedEmail);
      // Set a 30-second cooldown in sessionStorage upon successfully dispatching OTP
      const cooldownMs = 30000;
      try {
        sessionStorage.setItem(
          "bastion_otp_cooldown_until",
          String(Date.now() + cooldownMs)
        );
      } catch { }
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
        try {
          sessionStorage.setItem(
            "bastion_otp_cooldown_until",
            String(Date.now() + remainingSeconds * 1000)
          );
        } catch { }
        setError(null);
      } else {
        const match =
          typeof errorMessage === "string"
            ? errorMessage.match(/(\d+)\s*second/i)
            : null;
        if (match && match[1]) {
          const secs = parseInt(match[1], 10);
          setCooldownSeconds(secs);
          try {
            sessionStorage.setItem(
              "bastion_otp_cooldown_until",
              String(Date.now() + secs * 1000)
            );
          } catch { }
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
            onChange={(e) => {
              updateFormData("email", e.target.value);
              if (error) setError(null);
            }}
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
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                updateFormData("phone", digits);
                if (error) setError(null);
              }}
              className="w-full flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter 10-digit mobile number"
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
    </div >
  );
};

export default RegisterStep;
