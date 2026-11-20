import { ArrowLeft, Info } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/onboarding-apis";

const OnboardStep: React.FC<OnboardStepProps> = ({
  formData,
  updateFormData,
  onNext,
  setCurrentStep,
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useAuth();

  const onBackHandler = () => {
    if (user?.id) {
      return;
    }
    setCurrentStep(1);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    updateFormData(field, value);
  };

  const handleContinue = () => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!formData.firstName.trim()) {
      errors.firstName = "Please enter first name.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Please enter last name.";
    }
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = "Please enter date of birth.";
    }
    if (!formData.address1.trim()) {
      errors.address1 = "Please enter address line 1.";
    }
    if (!formData.state.trim()) {
      errors.state = "Please enter state.";
    }
    if (!formData.city.trim()) {
      errors.city = "Please enter city.";
    }
    if (!formData.pinCode || !formData.pinCode.trim()) {
      errors.pinCode = "Please enter PIN code.";
    } else {
      const cleanPin = formData.pinCode.trim().replace(/\D/g, "");
      if (cleanPin.length !== 6) {
        errors.pinCode = "PIN code must be a 6-digit number.";
      }
    }
    if (!formData.company.trim()) {
      errors.company = "Please enter company name.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const cleanPin = formData.pinCode.trim().replace(/\D/g, "");

    // Store trimmed & cleaned values in formData
    updateFormData("firstName", formData.firstName.trim());
    updateFormData("lastName", formData.lastName.trim());
    updateFormData("dateOfBirth", formData.dateOfBirth.trim());
    updateFormData("address1", formData.address1.trim());
    updateFormData("address2", (formData.address2 || "").trim());
    updateFormData("state", formData.state.trim());
    updateFormData("city", formData.city.trim());
    updateFormData("company", formData.company.trim());
    updateFormData("pinCode", cleanPin);

    if (user?.id) {
      updateUser(user.id, {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        date_of_birth: formData.dateOfBirth.trim(),
        address_1: formData.address1.trim(),
        address_2: (formData.address2 || "").trim() || null,
        state: formData.state.trim(),
        city: formData.city.trim(),
        pin_code: cleanPin,
        company: formData.company.trim(),
      }).catch((e) => console.error("Auto-save user details error:", e));
    }

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
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.firstName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="First name"
            />
            {fieldErrors.firstName && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.lastName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="Last name"
            />
            {fieldErrors.lastName && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth*
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.dateOfBirth ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
              }`}
          />
          {fieldErrors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.dateOfBirth}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1*
            </label>
            <input
              type="text"
              value={formData.address1 || ""}
              onChange={(e) => handleFieldChange("address1", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.address1 ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="House/Flat, Street"
            />
            {fieldErrors.address1 && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.address1}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              value={formData.address2 || ""}
              onChange={(e) => handleFieldChange("address2", e.target.value)}
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
              onChange={(e) => handleFieldChange("state", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.state ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="State"
            />
            {fieldErrors.state && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.city ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="City"
            />
            {fieldErrors.city && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code*
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.pinCode || ""}
              onChange={(e) =>
                handleFieldChange(
                  "pinCode",
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.pinCode ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="6-digit PIN"
              maxLength={6}
            />
            {fieldErrors.pinCode && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.pinCode}</p>
            )}
          </div >

          {/* Company Required + Tooltip */}
          < div className="relative" >
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

            {
              showTooltip && (
                <div className="absolute z-10 bg-black text-white text-xs rounded-lg px-3 py-2 -top-2 left-24 w-52 shadow-lg">
                  If not belongs to any company then write "Individual investor"
                </div>
              )
            }

            <input
              type="text"
              value={formData.company || ""}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${fieldErrors.company ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="Company name or Individual investor"
            />
            {fieldErrors.company && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.company}</p>
            )}
          </div >
        </div >
      </div >

      <div className="flex space-x-3">
        {!user?.id && (
          <button
            onClick={onBackHandler}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-1" /> Back
          </button>
        )}

        <button
          onClick={handleContinue}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue
        </button>
      </div >
    </div >
  );
};

export default OnboardStep;
