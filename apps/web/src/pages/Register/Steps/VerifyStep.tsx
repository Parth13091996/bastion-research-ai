import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
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
  const handleVerifyOtp = async () => {
    if (!formData || !formData.otp || !formData.phone) {
      setError && setError("Missing OTP or phone number.");
      return;
    }
    setError && setError(null);
    setIsLoading && setIsLoading(true);
    setStartOtpTimer(true);
    const otp = Array.isArray(formData.otp) ? formData.otp.join("") : "";
    try {
      const response = await axiosInstance.post(endpoints.otp.verify, {
        phone: "+91" + formData.phone,
        otp: otp,
      });
      toast.success(response?.data?.message || "OTP verified");
      nextStep && nextStep();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred.";
      setError && setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading && setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData || !formData.phone) {
      setError && setError("Missing phone number.");
      return;
    }
    setError && setError(null);
    setIsLoading && setIsLoading(true);
    setStartOtpTimer(true);

    try {
      await axiosInstance.post(endpoints.otp.send, {
        phone: "+91" + formData.phone,
      });
      setOtpTimer(600); // Reset timer to 10 minutes
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred.";
      setError && setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading && setIsLoading(false);
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
          {email ?? "your email"} & {phone ?? "your phone"}
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
          <button className="text-secondary text-sm mt-1 disabled:text-gray-400">
            Didn't receive the OTP?{` `}
            <span
              onClick={isLoading ? () => null : handleResendOtp}
              className={`text-red-600 hover:underline ${isLoading ? "cursor-not-allowed" : ""}`}
            >
              Resend OTP
            </span>
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="flex space-x-3">
        <button
          onClick={onBack ? onBack : () => {}}
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
