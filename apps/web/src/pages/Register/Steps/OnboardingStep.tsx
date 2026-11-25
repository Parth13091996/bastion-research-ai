import { ArrowLeft, Info } from "lucide-react";
import React, { useState, useMemo } from "react";
import { State, City } from "country-state-city";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/onboarding-apis";
import { SearchableSelect } from "@/components/common/SearchableSelect";

const COUNTRY_CODE = "IN";

const OnboardStep: React.FC<OnboardStepProps> = ({
  formData,
  updateFormData,
  onNext,
  setCurrentStep,
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useAuth();

  // Indian States & Cities list
  const indianStates = useMemo(() => {
    return State.getStatesOfCountry(COUNTRY_CODE).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, []);

  const selectedStateObj = useMemo(() => {
    if (!formData.state) return null;
    return (
      indianStates.find(
        (s) =>
          s.name.toLowerCase() === formData.state.toLowerCase() ||
          s.isoCode.toLowerCase() === formData.state.toLowerCase()
      ) || null
    );
  }, [formData.state, indianStates]);

  const stateCities = useMemo(() => {
    if (!selectedStateObj) return [];
    return City.getCitiesOfState(COUNTRY_CODE, selectedStateObj.isoCode).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [selectedStateObj]);

  // Date of Birth bounds: minimum 18 years old, maximum 100 years old
  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxAllowedDob = maxDobDate.toISOString().split("T")[0];
  const minDobDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const minAllowedDob = minDobDate.toISOString().split("T")[0];

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

    // 1. First Name Validation
    const trimmedFirstName = (formData.firstName || "").trim();
    if (!trimmedFirstName) {
      errors.firstName = "Please enter first name.";
    } else if (trimmedFirstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    } else if (trimmedFirstName.length > 50) {
      errors.firstName = "First name cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedFirstName)) {
      errors.firstName = "First name can only contain letters.";
    }

    // 2. Last Name Validation
    const trimmedLastName = (formData.lastName || "").trim();
    if (!trimmedLastName) {
      errors.lastName = "Please enter last name.";
    } else if (trimmedLastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters.";
    } else if (trimmedLastName.length > 50) {
      errors.lastName = "Last name cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedLastName)) {
      errors.lastName = "Last name can only contain letters.";
    }

    // 3. Date of Birth Validation
    const trimmedDob = (formData.dateOfBirth || "").trim();
    if (!trimmedDob) {
      errors.dateOfBirth = "Please enter date of birth.";
    } else {
      const selectedDob = new Date(trimmedDob);
      const birthYear = selectedDob.getFullYear();
      if (isNaN(selectedDob.getTime())) {
        errors.dateOfBirth = "Please enter a valid date of birth.";
      } else if (selectedDob > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future.";
      } else if (selectedDob > maxDobDate) {
        errors.dateOfBirth = "You must be at least 18 years old to register.";
      } else if (selectedDob < minDobDate || birthYear < 1920) {
        errors.dateOfBirth = "Please enter a valid date of birth (year 1920 or later).";
      }
    }

    // 4. Address Line 1 Validation
    const trimmedAddress1 = (formData.address1 || "").trim();
    if (!trimmedAddress1) {
      errors.address1 = "Please enter address line 1.";
    } else if (trimmedAddress1.length < 5) {
      errors.address1 = "Address must be at least 5 characters.";
    } else if (trimmedAddress1.length > 150) {
      errors.address1 = "Address cannot exceed 150 characters.";
    }

    // 5. State Validation
    const trimmedState = (formData.state || "").trim();
    if (!trimmedState) {
      errors.state = "Please select a state.";
    }

    // 6. City Validation
    const trimmedCity = (formData.city || "").trim();
    if (!trimmedCity) {
      errors.city = "Please select a city.";
    }

    // 7. PIN Code Validation
    const cleanPin = (formData.pinCode || "").trim().replace(/\D/g, "");
    if (!cleanPin) {
      errors.pinCode = "Please enter PIN code.";
    } else if (cleanPin.length !== 6) {
      errors.pinCode = "PIN code must be a 6-digit number.";
    } else if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      errors.pinCode = "Invalid PIN code. It must be a valid 6-digit postal code.";
    } else if (/^(\d)\1{5}$/.test(cleanPin)) {
      errors.pinCode = "Invalid PIN code. Repeated digits are not allowed.";
    }

    // 8. Company Validation
    const trimmedCompany = (formData.company || "").trim();
    if (!trimmedCompany) {
      errors.company = "Please enter company name.";
    } else if (/<[^>]*>/i.test(trimmedCompany) || /script/i.test(trimmedCompany)) {
      errors.company = "Invalid company name. HTML or script tags are not allowed.";
    } else if (trimmedCompany.length < 2) {
      errors.company = "Company name must be at least 2 characters.";
    } else if (trimmedCompany.length > 100) {
      errors.company = "Company name cannot exceed 100 characters.";
    } else if (!/^[a-zA-Z0-9\s.,&'-]+$/.test(trimmedCompany)) {
      errors.company = "Company name contains invalid characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    // Store trimmed & cleaned values in formData
    updateFormData("firstName", trimmedFirstName);
    updateFormData("lastName", trimmedLastName);
    updateFormData("dateOfBirth", trimmedDob);
    updateFormData("address1", trimmedAddress1);
    updateFormData("address2", (formData.address2 || "").trim());
    updateFormData("state", trimmedState);
    updateFormData("city", trimmedCity);
    updateFormData("company", trimmedCompany);
    updateFormData("pinCode", cleanPin);

    if (user?.id) {
      updateUser(user.id, {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        date_of_birth: trimmedDob,
        address_1: trimmedAddress1,
        address_2: (formData.address2 || "").trim() || null,
        state: trimmedState,
        city: trimmedCity,
        pin_code: cleanPin,
        company: trimmedCompany,
      }).catch((e) => console.error("Auto-save user details error:", e));
    }

    onNext();
  };

  return (
    <div className="space-y-6 relative pb-6">
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
              maxLength={50}
              value={formData.firstName}
              onChange={(e) =>
                handleFieldChange(
                  "firstName",
                  e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50)
                )
              }
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
              maxLength={50}
              value={formData.lastName}
              onChange={(e) =>
                handleFieldChange(
                  "lastName",
                  e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50)
                )
              }
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
            min={minAllowedDob}
            max={maxAllowedDob}
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
              maxLength={150}
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
              maxLength={150}
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
            <SearchableSelect
              options={indianStates.map((s) => ({ label: s.name, value: s.name }))}
              value={selectedStateObj ? selectedStateObj.name : formData.state || ""}
              onChange={(val) => {
                handleFieldChange("state", val);
                handleFieldChange("city", "");
              }}
              placeholder="Select State"
              searchPlaceholder="Search state..."
              hasError={Boolean(fieldErrors.state)}
            />
            {fieldErrors.state && (
              <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <SearchableSelect
              options={
                formData.city &&
                  !stateCities.some(
                    (c) => c.name.toLowerCase() === formData.city.toLowerCase()
                  )
                  ? [
                    { label: formData.city, value: formData.city },
                    ...stateCities.map((c) => ({ label: c.name, value: c.name })),
                  ]
                  : stateCities.map((c) => ({ label: c.name, value: c.name }))
              }
              value={formData.city || ""}
              onChange={(val) => handleFieldChange("city", val)}
              placeholder={formData.state ? "Select City" : "Select State first"}
              searchPlaceholder="Search city..."
              disabled={!formData.state}
              hasError={Boolean(fieldErrors.city)}
              emptyMessage={
                !formData.state
                  ? "Please select a state first"
                  : "No cities found"
              }
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
              maxLength={100}
              value={formData.company || ""}
              onChange={(e) =>
                handleFieldChange(
                  "company",
                  e.target.value.replace(/[<>]/g, "").slice(0, 100)
                )
              }
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
