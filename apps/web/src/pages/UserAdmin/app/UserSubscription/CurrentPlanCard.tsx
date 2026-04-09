import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/utils";
import { Loader2 } from "lucide-react";

const CurrentPlanCard = ({
  isLoading,
  isError,
  subscription,
  hasAnyPlan,
  onFreePlan,
  currentPlanCode,
}: {
  isLoading: boolean;
  isError: boolean;
  subscription: SubscriptionData | undefined;
  hasAnyPlan: boolean;
  onFreePlan: boolean;
  currentPlanCode: string | null;
}) => {
  // Extract expiry date and check if expired
  const expireNextRenewal = subscription?.subscription?.expireNextRenewal;
  const isExpired =
    expireNextRenewal &&
    new Date(expireNextRenewal).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Current Plan</CardTitle>
        <CardDescription className="text-sm">
          Your active membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {isError && (
                <p className="text-xs text-red-600 mb-1">
                  Unable to load subscription details. Showing basic account
                  info.
                </p>
              )}
              <h3 className="text-base sm:text-lg font-semibold">
                {subscription?.subscription?.name
                  ? `${subscription.subscription.name.replace("_", " ")
                    .toUpperCase()} Plan`
                  : hasAnyPlan
                    ? `${
                        currentPlanCode === "freemium"
                          ? "Freemium"
                          : String(currentPlanCode)
                              .replace("_", " ")
                              .toUpperCase()
                      } Plan`
                    : "No Active Plan"}
                {isExpired && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium border border-red-200">
                    Expired
                  </span>
                )}
              </h3>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
              <Badge
                variant={
                  isExpired
                    ? "destructive"
                    : hasAnyPlan && subscription?.is_premium
                    ? "default"
                    : "secondary"
                }
                className="self-start sm:self-auto"
              >
                {!hasAnyPlan
                  ? "None"
                  : isExpired
                  ? "Expired"
                  : onFreePlan
                  ? "Free"
                  : subscription?.is_premium
                  ? "Active"
                  : "Pending"}
              </Badge>
              {subscription?.subscription && (
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>Amount: {formatINR(subscription.subscription.amount)}</p>
                  <p>
                    Started:{" "}
                    {new Date(
                      subscription.subscription.startDate
                    ).toLocaleDateString()}
                  </p>
                  {subscription.subscription.expireNextRenewal && (
                    <p>
                      Expires:{" "}
                      <span
                        className={isExpired ? "text-red-600 font-semibold" : ""}
                      >
                        {new Date(
                          subscription.subscription.expireNextRenewal
                        ).toLocaleDateString()}
                        {isExpired && " (Expired)"}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentPlanCard;
