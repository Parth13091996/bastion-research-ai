import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";

const OnboardStep: React.FC<OnboardStepProps> = ({
  formData,
  updateFormData,
  onNext,
  setCurrentStep,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const onBackHandler = () => {
    setCurrentStep(1);
  };

  const handleContinue = () => {
    setError(null);

    // Required fields
    if (!formData.firstName.trim()) {
      setError("Please enter first name.");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Please enter last name.");
      return;
    }
    if (!formData.dateOfBirth.trim()) {
      setError("Please enter date of birth.");
      return;
    }
    if (!formData.address1.trim()) {
      setError("Please enter address line 1.");
      return;
    }
    if (!formData.state.trim()) {
      setError("Please enter state.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please enter city.");
      return;
    }
    if (!formData.company.trim()) {
      setError("Please enter company name.");
      return;
    }

    // Optional: address2, pinCode

    onNext();
  };

  return (
    <div className="space-y-6 relative">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600 text-sm">
          Please provide your basic details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth*
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1*
            </label>
            <input
              type="text"
              value={formData.address1 || ""}
              onChange={(e) => updateFormData("address1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="House/Flat, Street"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              value={formData.address2 || ""}
              onChange={(e) => updateFormData("address2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Area, Landmark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State*
            </label>
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) => updateFormData("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => updateFormData("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code (optional)
            </label>
            <input
              type="text"
              value={formData.pinCode || ""}
              onChange={(e) => updateFormData("pinCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="6-digit PIN"
              maxLength={6}
            />
          </div>

          {/* Company Required + Tooltip */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Company*
              <span
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info size={16} />
              </span>
            </label>

            {showTooltip && (
              <div className="absolute z-10 bg-black text-white text-xs rounded-lg px-3 py-2 -top-2 left-24 w-52 shadow-lg">
                If not belongs to any company then write "Individual investor"
              </div>
            )}

            <input
              type="text"
              value={formData.company || ""}
              onChange={(e) => updateFormData("company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Company name or Individual investor"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBackHandler}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>

        <button
          onClick={handleContinue}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default OnboardStep;
