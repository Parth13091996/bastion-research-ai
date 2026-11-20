import { sendOtp, verifyOtp } from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import OTPInput from "react-otp-input";
import { toast } from "sonner";

const VerifyStep: React.FC<VerifyStepProps> = ({
  isLoading,
  error,
  onBack,
  updateFormData,
  formData,
  email,
  phone,
  setIsLoading,
  setError,
  nextStep,
}) => {
  const [startOtpTimer, setStartOtpTimer] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(600);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const isSubmittingRef = useRef(false);
  const { login, refetchUser } = useAuth();

  const handleVerifyOtp = async () => {
    if (isSubmittingRef.current || isLoading) return;
    if (!formData || !formData.otp || !formData.phone) {
      setError && setError("Missing OTP or phone number.");
      return;
    }
    setError && setError(null);
    isSubmittingRef.current = true;
    setIsLoading && setIsLoading(true);
    setStartOtpTimer(true);
    const otp = Array.isArray(formData.otp) ? formData.otp.join("") : "";
    try {
      const cleanPhone = formData.phone.trim().replace(/^(\+91|91|0)/, "");
      const response = await verifyOtp("+91" + cleanPhone, otp, {
        email: formData.email,
        password: formData.password,
      });
      toast.success(response?.message || "OTP verified");
      if (response?.user && login) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("onboarding_open", "true");
          } catch { }
        }
        login(response.user, response.token, response.refreshToken);
        void refetchUser();
      }
      nextStep && nextStep();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setError && setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading && setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendOtp = async () => {
    if (isSubmittingRef.current || isLoading || (cooldownSeconds !== null && cooldownSeconds > 0)) return;
    if (!formData || !formData.phone) {
      setError && setError("Missing phone number.");
      return;
    }
    isSubmittingRef.current = true;
    updateFormData("otp", null);
    setError && setError(null);
    setIsLoading && setIsLoading(true);
    setStartOtpTimer(true);

    try {
      const cleanPhone = formData.phone.trim().replace(/^(\+91|91|0)/, "");
      await sendOtp("+91" + cleanPhone);
      toast.success("OTP resent successfully.");
      setOtpTimer(600); // Reset timer to 10 minutes
      setCooldownSeconds(30);
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
        setError && setError(null);
      } else {
        const match =
          typeof errorMessage === "string"
            ? errorMessage.match(/(\d+)\s*second/i)
            : null;
        if (match && match[1]) {
          setCooldownSeconds(parseInt(match[1], 10));
          setError && setError(null);
        } else {
          setError && setError(errorMessage);
        }
      }
      console.error(err);
    } finally {
      setIsLoading && setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const renderOtpTimer = () => {
    if (!startOtpTimer) return null;
    const timer = typeof otpTimer === "number" ? otpTimer : 0;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `Expire in ${minutes.toString().padStart(1, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    // On initial render, delete the otp value and reset the expires timer
    if (formData && formData.otp !== undefined) {
      delete formData.otp;
    }
    setOtpTimer(600);
    setStartOtpTimer(true);
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds !== null]);

  // Countdown effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (startOtpTimer && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startOtpTimer, otpTimer]);

  // Removed localStorage persistence of OTP timer

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Enter OTP to verify
        </h2>
        <p className="text-gray-600 text-sm">
          We have sent you a message with a 6-digit verification code on
          <br />
          {phone ?? "your phone"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <OTPInput
            value={
              formData && Array.isArray(formData.otp)
                ? formData.otp.join("")
                : ""
            }
            onChange={(value: string) => {
              const digits = value.split("");
              while (digits.length < 6) digits.push("");
              updateFormData && updateFormData("otp", digits.slice(0, 6));
            }}
            numInputs={6}
            shouldAutoFocus={false}
            containerStyle="flex gap-3"
            inputStyle="!w-10 !h-12 md:!w-12 md:h-14 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">{renderOtpTimer()}</p>
          <div className="text-sm mt-1 text-gray-600">
            Didn't receive the OTP?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || (cooldownSeconds !== null && cooldownSeconds > 0)}
              className="text-red-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
      {(error || cooldownSeconds !== null) && (
        <p className="text-red-500 text-sm text-center">
          {error
            ? error
            : `Please wait ${cooldownSeconds} second${cooldownSeconds === 1 ? "" : "s"} before requesting otp again.`}
        </p>
      )}
      <div className="flex space-x-3">
        <button
          onClick={onBack ? onBack : () => { }}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={handleVerifyOtp}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
        >
          <>
            <Check size={20} className="mr-1" /> Verify OTP
          </>
        </button>
      </div>
    </div>
  );
};

export default VerifyStep;
