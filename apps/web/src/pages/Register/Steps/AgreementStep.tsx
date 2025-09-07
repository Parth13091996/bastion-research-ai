import { ArrowLeft } from "lucide-react";

const AgreementStep: React.FC<AgreementStepProps> = ({
  agreeToTerms,
  updateFormData,
  onBack,
  onNext,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Terms & Agreement
      </h2>
      <p className="text-gray-600 text-sm">
        Please review and accept our terms
      </p>
    </div>

    <div className="max-h-48 overflow-y-auto border rounded-lg p-4 text-sm text-gray-700">
      <h3 className="font-semibold mb-2">Terms of Service</h3>
      <p className="mb-4">
        By using TripleEdge services, you agree to the following terms and
        conditions...
      </p>
      <p className="mb-4">
        1. Investment Risks: All investments carry risk of loss. Past
        performance does not guarantee future results.
      </p>
      <p className="mb-4">
        2. Service Agreement: You agree to pay applicable fees for the services
        provided.
      </p>
      <p className="mb-4">
        3. Privacy Policy: We will protect your personal information as outlined
        in our privacy policy.
      </p>
    </div>

    <label className="flex items-start">
      <input
        type="checkbox"
        checked={agreeToTerms}
        onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
        className="mt-1 mr-2"
      />
      <span className="text-sm text-gray-700">
        I agree to the Terms of Service and Privacy Policy
      </span>
    </label>

    <div className="flex space-x-3">
      <button
        onClick={onBack}
        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>
      <button
        onClick={onNext}
        disabled={!agreeToTerms}
        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Accept & Continue
      </button>
    </div>
  </div>
);

export default AgreementStep;
