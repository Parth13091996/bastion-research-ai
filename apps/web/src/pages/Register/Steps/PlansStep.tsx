import { createCashfreeOrder, updateUser } from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useEffect } from "react";

const PlansStep: React.FC<PlansStepProps> = ({
  plans,
  formData,
  updateFormData,
  onBack,
  onNext,
  isLoading,
  error,
}) => {
  const { user } = useAuth();
  const plansStepNextHandler = async () => {
    const selectedPlanDetails = plans.find(
      (p) => p.code === formData.selectedPlan
    );
    const isFree = selectedPlanDetails?.plan_code === "freemium";
    if (isFree) {
      const userId = user?.id || formData.email;
      const planCode = selectedPlanDetails?.code || "1";
      await updateUser(userId, {
        status: "active",
        plan_id: planCode,
      });

      await createCashfreeOrder({
        plan: formData.selectedPlan,
        customer_id: userId,
        customer_email: formData.email,
        customer_phone: formData.phone,
        source: "register",
        is_free: true,
        discount_amount: 0,
      });

      // Redirect to login/dashboard
      window.location.href = location.origin + "/login";
      return;
    }
    onNext();
  };

  useEffect(() => {
    if (formData && formData?.selectedPlan !== undefined) {
      updateFormData("selectedPlan", "");
    }
  }, []);

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
        <div className="flex items-center justify-center h-24">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans
            .sort((a, b) =>
              ((a as any)?.plan_code || "").localeCompare(
                (b as any)?.plan_code || ""
              )
            )
            .map((plan, index) => {
              const isSelected = formData?.selectedPlan === plan.code;
              const pc =
                ((plan as any)?.plan_code as string | undefined) || undefined;
              const isFree = String(plan.amount) === "0" || pc === "freemium";
              const isPopular = pc === "core_annual";

              const featuresByPlan: Record<string, string[]> = {
                freemium: [
                  "Newsletter & Podcast access",
                  "IPO desk: names only",
                  "Dashboard: blurred live numbers",
                  "Upside % & Past performance",
                ],
                core: [
                  "Access to Bastion CORE research",
                  "Full Dashboard access (CORE)",
                  "Company Flash Cards (All)",
                  "Upside % & Past performance",
                ],
                core_annual: [
                  "Everything in Bastion CORE",
                  "Best value yearly pricing",
                  "Priority updates",
                  "Company Flash Cards (All)",
                ],
              };

              const featureKey = (pc || "").toLowerCase();
              const features = featuresByPlan[featureKey] || [];

              return (
                <div
                  key={index}
                  className={`relative rounded-xl border p-4 transition-colors cursor-pointer bg-white ${
                    isSelected
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                  onClick={() => updateFormData("selectedPlan", plan.code)}
                >
                  {isPopular && (
                    <div className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </div>
                  )}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isFree
                          ? "Free forever"
                          : pc === "core_annual"
                            ? "Billed yearly"
                            : "Billed quarterly"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${isFree ? "text-gray-700" : "text-red-600"}`}
                      >
                        {isFree ? "₹0" : `₹${plan.amount}`}
                      </div>
                      {!isFree && (
                        <div className="text-[11px] text-gray-400">
                          Incl. GST
                        </div>
                      )}
                    </div>
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-2 text-sm">
                      {features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <Check className="h-4 w-4 mt-[2px] text-green-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {isSelected
                        ? "Selected"
                        : isFree
                          ? "Choose Free"
                          : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
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
          disabled={!formData?.selectedPlan || isLoading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PlansStep;
