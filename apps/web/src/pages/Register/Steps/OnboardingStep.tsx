import { ArrowLeft } from "lucide-react";

const OnboardStep: React.FC<OnboardStepProps> = ({
  formData,
  updateFormData,
  onBack,
  onNext,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Personal Information
      </h2>
      <p className="text-gray-600 text-sm">Please provide your basic details</p>
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
    </div>

    <div className="flex space-x-3">
      <button
        onClick={onBack}
        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>
      <button
        onClick={onNext}
        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

export default OnboardStep;
