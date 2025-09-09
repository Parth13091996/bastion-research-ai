import { ArrowLeft } from "lucide-react";

const KYCStep: React.FC<KYCStepProps> = ({
  formData,
  updateFormData,
  onBack,
  onNext,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        KYC Verification
      </h2>
      <p className="text-gray-600 text-sm">
        Please provide your identity documents
      </p>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Card*
          </label>
          <input
            type="text"
            value={formData.panCard}
            onChange={(e) =>
              updateFormData("panCard", e.target.value.toUpperCase())
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aadhar Card*
          </label>
          <input
            type="text"
            value={formData.aadharCard}
            onChange={(e) => updateFormData("aadharCard", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="1234 5678 9012"
            maxLength={12}
          />
        </div>
      </div>

      {/* Removed Bank Account and IFSC Code fields as per updated KYC requirements */}
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

export default KYCStep;
