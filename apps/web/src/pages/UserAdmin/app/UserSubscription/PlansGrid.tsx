import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR, getFeatureKey, getRenewalAmountINR, planFeatures } from "@/utils";
import { Check, Loader2 } from "lucide-react";

const PlansGrid = ({
  availablePlans,
  isPlansLoading,
  error,
  planMatchesCurrent,
  renewalEligible,
  checkingOut,
  handleSubscribe,
}: {
  availablePlans: Plan[];
  isPlansLoading: boolean;
  error: string | null;
  planMatchesCurrent: (planKey: string) => boolean;
  renewalEligible: boolean;
  checkingOut: string | null;
  handleSubscribe: (planCode: string, amountOverride?: number) => void;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {isPlansLoading && (
        <div className="col-span-full flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {error && (
        <div className="col-span-full text-sm text-red-600">{error}</div>
      )}
      {!isPlansLoading && !error && availablePlans.length === 0 && (
        <div className="col-span-full text-sm text-muted-foreground">
          No plans available at the moment. Please check back later.
        </div>
      )}
      {!isPlansLoading &&
        !error &&
        availablePlans.map((plan) => {
          const normalizedName = plan.name.toLowerCase();
          const popular =
            plan.plan_code === "core_annual" ||
            normalizedName.includes("annual");
          const featureKey = getFeatureKey(plan);
          const isCurrentPlan = planMatchesCurrent(featureKey);
          const canRenewThisPlan = isCurrentPlan && renewalEligible;

          const displayAmount = canRenewThisPlan
            ? getRenewalAmountINR(plan.plan_code ?? featureKey, plan.amount)
            : plan.amount;
          const priceLabel = formatINR(displayAmount);

          const disabled =
            (!canRenewThisPlan && isCurrentPlan) || checkingOut === plan.code;
          const ctaLabel = isCurrentPlan
            ? canRenewThisPlan
              ? "Renew"
              : "Current Plan"
            : "Subscribe";

          return (
            <Card
              key={plan.code}
              className={`relative ${popular ? "border-red-400 shadow-md" : ""}`}
            >
              <CardHeader className="text-center pb-3 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {popular
                    ? "Best value for serious investors"
                    : "Flexible membership"}
                </CardDescription>
                <div className="mt-3 sm:mt-4">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {priceLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <ul className="space-y-2 sm:space-y-3">
                  {(planFeatures[featureKey] || []).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={
                    popular && !planMatchesCurrent(featureKey)
                      ? "default"
                      : "outline"
                  }
                  disabled={disabled}
                  onClick={() =>
                    handleSubscribe(
                      plan.code,
                      canRenewThisPlan ? displayAmount : undefined
                    )
                  }
                  size="sm"
                >
                  {checkingOut === plan.code ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  ) : (
                    ctaLabel
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
};

export default PlansGrid;
