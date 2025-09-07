import axiosInstance from "@/api/axios";
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
  const handleRegister = async () => {
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      // Data is already updated in the session via useEffect
      await axiosInstance.post("/api/otp/send", {
        phone: "+91" + formData.phone,
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 text-sm">
          Join TripleEdge to start your investment journey
        </p>
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
            <select className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
              <option>🇮🇳 +91</option>
            </select>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Get OTP →"}
      </button>
    </div>
  );
};

export default RegisterStep;
