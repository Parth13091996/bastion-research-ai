import { createFreeAccount } from "@/api/onboarding-apis";
import mailchimpNewsletterApi from "@/api/mailchimp-api";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, sleep } from "@/utils";
import { ArrowLeft, Check, Info, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingPayload } from "@/api/onboarding-apis";

interface Plan {
  code: string;
  name: string;
  amount: string | number;
  plan_code?: string;
}

interface PlansStepProps {
  plans: Plan[];
  formData: OnboardingFormData;
  updateFormData: (key: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
  setIsLoading: (loading: boolean) => void;
}

const PlansStep: React.FC<PlansStepProps> = ({
  plans,
  formData,
  updateFormData,
  onBack,
  onNext,
  isLoading,
  error,
  setIsLoading,
}) => {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const getOnboardTag = (plan?: Plan) => {
    const code = plan?.plan_code?.toLowerCase().trim();
    const name = (plan?.name || "").toLowerCase();
    const isFree =
      String(plan?.amount ?? "") === "0" || code === "freemium";
    if (code === "core") return "onboard_onetime";
    if (code === "core_annual") return "onboard_premium";
    if (isFree) return "onboard_free";
    if (name.includes("annual")) return "onboard_premium";
    if (name.includes("freemium")) return "onboard_free";
    return "onboard_onetime";
  };
  const plansStepNextHandler = async () => {
    try {
      setIsLoading(true);
      const selectedPlan = formData.selectedPlan as string;
      const selectedPlanDetails = plans.find((p) => p.code === selectedPlan);
      if (formData.email) {
        const tag = getOnboardTag(selectedPlanDetails);
        if (tag) {
          void mailchimpNewsletterApi
            .subscribe({ email: formData.email as string, tags: [tag] })
            .catch(() => null);
        }
      }
      const isFree = selectedPlanDetails?.plan_code === "freemium";
      if (isFree) {
        const response = await createFreeAccount({
          ...(formData as unknown as OnboardingPayload),
          status: "free",
          role: "free_subscriber",
          plan_id: 1,
        });
        setIsLoading(false);
        await refetchUser();
        await sleep(500);
        navigate("/user/app/dashboard");
        return;
      }
      // Don't mark as `drop_off` immediately; the backend will flip the role
      // after a configurable delay if onboarding isn't completed.
      // If the user is already `drop_off` (e.g. timer already triggered),
      // preserve that value.
      updateFormData(
        "role",
        formData?.role === "drop_off" ? "drop_off" : "employee"
      );
      onNext();
    } catch (error) {
      setIsLoading(false);
      if (error?.response?.data?.message?.includes("users_email_key")) {
        toast.error(
          "Duplicate email address, can't create account with an existing email."
        );
      }
      console.error("Error in plansStepNextHandler:", error);
    }
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
        <div className="flex items-center justify-center h-24">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans
            .sort((a, b) =>
              (a.plan_code || "").localeCompare(
                b.plan_code || ""
              )
            )
            .map((plan, index) => {
              const isSelected = formData?.selectedPlan === plan.code;
              const pc = plan.plan_code;
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
                  className={`relative rounded-xl border p-4 flex flex-col h-full transition-colors cursor-pointer bg-white ${isSelected
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
                  {pc === "core" && (
                    <div className="absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
                      <Sparkles className="h-3 w-3" /> Once in a lifetime access
                    </div>
                  )}
                  <div className="mb-3 flex items-start justify-between plan-wrapper">

                    <div>
                      <h3 className="font-semibold text-base text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 ">
                        {isFree
                          ? "Free forever"
                          : pc === "core_annual"
                            ? "Billed yearly"
                            : "Billed quarterly"}
                      </p>
                    </div>
                    <div className="text-right flex items-start gap-1 relative ml-3">
                      {/* Info icon only for CORE plan */}
                      {pc === "core" && (
                        <div className="relative group">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />

                          {/* Tooltip ABOVE the icon */}
                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-60 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg z-20 text-center">
                            This plan is once in a lifetime access. It is
                            available only for 3 months. After that, you will
                            not be able to purchase it again in your lifetime.
                          </div>
                        </div>
                      )}

                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${isFree ? "text-gray-700" : "text-red-600"}`}
                        >
                          {formatINR(isFree ? 0 : Number(plan.amount || 0))}
                        </div>
                        {!isFree && (
                          <div className="text-[11px] text-gray-400">
                            Incl. GST
                          </div>
                        )}
                      </div>
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

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${isSelected
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
