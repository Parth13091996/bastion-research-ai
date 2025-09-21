import axiosInstance from "@/api/axios";
import Modal from "@/components/core/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/hooks/useLoader";
import AgreementStep from "../../Register/Steps/AgreementStep";
import { load } from "@cashfreepayments/cashfree-js";
import { Check, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";

type ApiPlan = {
  code: string;
  name: string;
  amount: number;
  currency: string;
};

type UpgradeFormState = {
  panCard: string;
  agreeToTerms: boolean;
  digioDocId?: string;
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const planFeatures: Record<string, string[]> = {
  free: [
    "Access to public research posts",
    "Community newsletter",
    "Email support",
  ],
  "3m": [
    "Full access to premium research",
    "Expert Q&A sessions",
    "Priority email support",
  ],
  "12m": [
    "Everything in 3 months plan",
    "Exclusive annual insights",
    "Early access to new features",
    "Priority support",
  ],
};

const getFeatureKey = (plan: ApiPlan) => {
  if (plan.amount <= 0) return "free";
  const normalized = plan.name.toLowerCase();
  if (normalized.includes("annual") || normalized.includes("year")) {
    return "12m";
  }
  if (
    normalized.includes("core") ||
    normalized.includes("quarter") ||
    normalized.includes("3")
  ) {
    return "3m";
  }
  return plan.code;
};

const Subscription = () => {
  const {
    user,
    subscription,
    isSubscriptionLoading,
    refetchSubscription,
    refetchUser,
    isAuthenticated,
    isLoading,
  } = useAuth();
  const loader = useLoader();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycStep, setKycStep] = useState<"kyc" | "agreement">("kyc");
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ApiPlan | null>(null);

  const userPan = (user?.pan_card_number || "").toUpperCase();
  const [upgradeForm, setUpgradeForm] = useState<UpgradeFormState>({
    panCard: userPan,
    agreeToTerms: false,
    digioDocId: undefined,
  });

  const currentPlanCode = subscription?.currentPlan || "free";

  useEffect(() => {
    const fetchPlans = async () => {
      setIsPlansLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(endpoints.cashfree.plans);
        const apiPlans: ApiPlan[] = res.data?.plans || [];
        setPlans(apiPlans);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load plans");
      } finally {
        setIsPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    setUpgradeForm((prev) => ({ ...prev, panCard: userPan }));
  }, [userPan]);

  const planMatchesCurrent = (plan: ApiPlan) => {
    if (currentPlanCode === "free") {
      return plan.amount <= 0;
    }
    return plan.code === currentPlanCode;
  };

  const startUpgradeFlow = (plan: ApiPlan) => {
    setPendingPlan(plan);
    setUpgradeForm((prev) => ({
      ...prev,
      panCard: userPan,
      agreeToTerms: false,
    }));
    setKycStep("kyc");
    setKycError(null);
    setKycSubmitting(false);
    setKycModalOpen(true);
  };

  const handleKycModalClose = () => {
    setKycModalOpen(false);
    setKycStep("kyc");
    setKycError(null);
    setKycSubmitting(false);
    setUpgradeForm((prev) => ({
      ...prev,
      agreeToTerms: false,
      panCard: userPan,
    }));
    setPendingPlan(null);
  };

  const handleKycSubmit = async () => {
    const pan = upgradeForm.panCard.trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      setKycError("Please enter a valid PAN (e.g. ABCDE1234F)");
      return;
    }
    if (!user?.id) {
      setKycError("User details not available. Please re-login and try again.");
      return;
    }

    setKycSubmitting(true);
    setKycError(null);
    try {
      await axiosInstance.put(endpoints.users.byId(user.id), {
        pan_card_number: pan,
      });
      setUpgradeForm((prev) => ({ ...prev, panCard: pan }));
      await refetchUser();
      setKycStep("agreement");
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to update PAN";
      setKycError(message);
    } finally {
      setKycSubmitting(false);
    }
  };

  const handleAgreementBack = () => {
    setKycStep("kyc");
    setUpgradeForm((prev) => ({ ...prev, agreeToTerms: false }));
    setKycError(null);
  };

  const handleAgreementComplete = () => {
    const planToCheckout = pendingPlan;
    setKycModalOpen(false);
    setKycStep("kyc");
    setKycError(null);
    setUpgradeForm((prev) => ({ ...prev, agreeToTerms: false }));
    setPendingPlan(null);

    if (planToCheckout) {
      setTimeout(
        () => handleSubscribe(planToCheckout.code, { bypassKyc: true }),
        0
      );
    }
  };

  const handleSubscribe = async (
    code: string,
    opts?: { bypassKyc?: boolean }
  ) => {
    if (!user) return;
    const selectedPlan = plans.find((p) => p.code === code);
    if (!selectedPlan) return;

    if (selectedPlan.amount <= 0) {
      toast.info("The freemium plan is already available without checkout.");
      return;
    }

    const upgradingFromFree = currentPlanCode === "free";
    const hasKyc = PAN_REGEX.test(userPan);
    if (upgradingFromFree && !hasKyc && !opts?.bypassKyc) {
      startUpgradeFlow(selectedPlan);
      return;
    }

    try {
      setCheckingOut(selectedPlan.code);
      const resp = await loader.withLoader(
        axiosInstance.post(endpoints.cashfree.orders, {
          plan: selectedPlan.code,
          customer_id: user.id,
          customer_email: user.email,
          customer_phone: user.phone,
          return_url: location.href,
          source: "subscription",
        }),
        "Processing payment..."
      );

      const cashfree = await load({ mode: "sandbox" });
      const paymentSessionId = resp?.data?.order?.payment_session_id;
      if (!paymentSessionId) throw new Error("Payment session not created");
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to start checkout"
      );
    } finally {
      setCheckingOut(null);
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      await refetchSubscription();
      toast.success("Subscription status updated");
    } catch (e: any) {
      toast.error("Failed to refresh subscription status");
    }
  };

  const onFreePlan = currentPlanCode === "free";

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" /> Plans & Pricing
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Choose the plan that fits you best
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRefreshSubscription}
              variant="outline"
              size="sm"
              disabled={isSubscriptionLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isSubscriptionLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Current Plan */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Current Plan</CardTitle>
            <CardDescription className="text-sm">Your active membership</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubscriptionLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading current
                plan...
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {subscription?.subscription?.name ||
                      (onFreePlan
                        ? "Freemium"
                        : currentPlanCode.toUpperCase())}{" "}
                    Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {onFreePlan
                      ? "Limited access to public content"
                      : subscription?.isPremium
                        ? "Active paid subscription"
                        : "Subscription pending"}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-3">
                  <Badge
                    variant={subscription?.isPremium ? "default" : "secondary"}
                    className="self-start sm:self-auto"
                  >
                    {subscription?.isPremium ? "Active" : "Pending"}
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
                      {subscription.subscription.expireDate && (
                        <p>
                          Expires:{" "}
                          {new Date(
                            subscription.subscription.expireDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isPlansLoading && (
            <div className="col-span-full flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
            </div>
          )}
          {error && (
            <div className="col-span-full text-sm text-red-600">{error}</div>
          )}
          {!isPlansLoading &&
            !error &&
            plans.map((plan) => {
              const normalizedName = plan.name.toLowerCase();
              const popular = normalizedName.includes("annual");
              const limited = normalizedName.includes("core");
              const priceLabel =
                plan.amount > 0 ? formatINR(plan.amount) : "Free";
              const disabled =
                planMatchesCurrent(plan) || checkingOut === plan.code;
              const ctaLabel = planMatchesCurrent(plan)
                ? "Current Plan"
                : plan.amount > 0
                  ? "Subscribe"
                  : "Get Started";
              const featureKey = getFeatureKey(plan);

              return (
                <Card
                  key={plan.code}
                  className={`relative ${popular ? "border-red-400 shadow-md" : ""}`}
                >
                  {popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-xs">
                      Most Popular
                    </Badge>
                  )}
                  {limited && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 right-4 text-xs"
                    >
                      Limited
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-3 sm:pb-6">
                    <CardTitle className="text-xl sm:text-2xl">
                      {plan.amount <= 0 ? "Freemium" : plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plan.amount <= 0
                        ? "Try before you upgrade"
                        : limited
                          ? "One-time availability for lifetime"
                          : "Best value for serious investors"}
                    </CardDescription>
                    <div className="mt-3 sm:mt-4">
                      <span className="text-2xl sm:text-3xl font-bold">{priceLabel}</span>
                      {plan.amount > 0 && (
                        <span className="text-muted-foreground text-sm"> one-time</span>
                      )}
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
                        popular && !planMatchesCurrent(plan)
                          ? "default"
                          : "outline"
                      }
                      disabled={disabled}
                      onClick={() => handleSubscribe(plan.code)}
                      size="sm"
                    >
                      {checkingOut === plan.code ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Processing
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
      </div>

      <Modal
        open={kycModalOpen}
        onOpenChange={(open) => {
          if (!open) handleKycModalClose();
          else setKycModalOpen(true);
        }}
        title={kycStep === "kyc" ? "Complete KYC to upgrade" : undefined}
        className={kycStep === "kyc" ? "sm:max-w-lg" : "sm:max-w-3xl"}
      >
        {kycStep === "kyc" ? (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                KYC Verification Required
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                We need your PAN details before you can upgrade to a paid plan.
                This helps us comply with SEBI regulations.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription-pan" className="text-sm">PAN Card*</Label>
              <Input
                id="subscription-pan"
                value={upgradeForm.panCard}
                onChange={(e) =>
                  setUpgradeForm((prev) => ({
                    ...prev,
                    panCard: e.target.value.toUpperCase(),
                  }))
                }
                maxLength={10}
                placeholder="ABCDE1234F"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use uppercase letters exactly as they appear on your PAN card.
              </p>
            </div>
            {kycError && <p className="text-sm text-red-600">{kycError}</p>}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleKycModalClose}
                disabled={kycSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleKycSubmit} disabled={kycSubmitting} className="w-full sm:w-auto">
                {kycSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        ) : (
          <AgreementStep
            agreeToTerms={upgradeForm.agreeToTerms}
            formData={{ email: user?.email || "", phone: user?.phone || "" }}
            onBack={handleAgreementBack}
            onNext={handleAgreementComplete}
            updateFormData={(field, value) =>
              setUpgradeForm((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default Subscription;
