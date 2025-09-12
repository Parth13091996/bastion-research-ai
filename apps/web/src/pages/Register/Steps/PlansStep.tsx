import { ArrowLeft } from "lucide-react";

const PlansStep: React.FC<PlansStepProps> = ({
  plans,
  selectedPlan,
  updateFormData,
  onBack,
  onNext,
  isLoading,
  error,
  setCurrentStep,
}) => {
  const plansStepNextHandler = () => {
    const currentPlan = plans.find((r) => r.code === selectedPlan);
    if (currentPlan.name == "Freemium") {
      setCurrentStep(7);
      return;
    }
    onNext();
  };
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 text-sm">
          Select the investment plan that suits you best
        </p>
      </div>

      {isLoading ? (
        <p className="text-center">Loading plans...</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer hover:border-red-500 ${selectedPlan === plan.code ? "border-red-500 border-2" : ""}`}
              onClick={() => updateFormData("selectedPlan", plan.code)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{plan.name}</h3>
                <span className="text-red-600 font-bold">₹{plan.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        <button
          onClick={plansStepNextHandler}
          disabled={!selectedPlan || isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PlansStep;
