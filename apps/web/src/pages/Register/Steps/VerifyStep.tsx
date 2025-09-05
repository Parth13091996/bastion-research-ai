import axiosInstance from "@/api/axios";
import { ArrowLeft, Check } from "lucide-react";

const VerifyStep: React.FC<VerifyStepProps> = ({
  otp,
  otpTimer,
  isLoading,
  error,
  onBack,
  setOtpTimer,
  updateFormData,
  formData,
  email,
  phone,
  setIsLoading,
  setError,
  nextStep,
}) => {
  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    const otp = formData.otp.join("");
    try {
      await axiosInstance.post("/api/otp/verify", {
        phone: formData.phone,
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
  const handleResendOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await axiosInstance.post("/api/otp/send", {
        phone: formData.phone,
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Enter OTP to verify
        </h2>
        <p className="text-gray-600 text-sm">
          We have sent you a message with a 6-digit verification code on
          <br />
          {email} & {phone}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
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
          onClick={onBack}
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
};

export default VerifyStep;
