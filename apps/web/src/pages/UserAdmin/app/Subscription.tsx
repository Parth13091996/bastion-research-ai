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
import { useLoader } from "@/hooks/use-loader";
import { load } from "@cashfreepayments/cashfree-js";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AgreementStep from "../../Register/Steps/AgreementStep";
import { Config } from "@/utils/config";
import { formatINR, getFeatureKey, PAN_REGEX, planFeatures } from "@/utils";
import { useSubscription } from "@/hooks/use-subscription";
import {
  createCashfreeOrder,
  fetchPlans,
  updateUser,
  verifyPan,
} from "@/api/onboarding-apis";

const Subscription = () => {
  const { user, refetchUser, isAuthenticated, isLoading } = useAuth();
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
  } = useSubscription() as { data: SubscriptionData | undefined } & {
    isLoading: boolean;
    isError: boolean;
  };
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycStep, setKycStep] = useState<"kyc" | "agreement">("kyc");
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [kycVerification, setKycVerification] =
    useState<PanVerificationSummary | null>(null);

  const userPan = (user?.pan_card_number || "").toUpperCase();
  const hasSignedAgreement = user?.status === "agreement_signed";
  const [upgradeForm, setUpgradeForm] = useState<UpgradeFormState>({
    panCard: userPan,
    agreeToTerms: false,
    agreementSignatureUrl: undefined,
    agreementSignaturePath: undefined,
    agreementSignedAt: undefined,
  });

  const currentPlanCode =
    subscription?.currentPlan || user?.membership_plans?.plan_code || null;
  useEffect(() => {
    const loadPlans = async () => {
      setIsPlansLoading(true);
      setError(null);
      try {
        const apiPlans = await fetchPlans();
        setPlans(apiPlans || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load plans");
      } finally {
        setIsPlansLoading(false);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    setUpgradeForm((prev) => ({ ...prev, panCard: userPan }));
  }, [userPan]);

  const planMatchesCurrent = (plan: string) => {
    return plan === currentPlanCode;
  };

  const availablePlans = useMemo(() => {
    if (!plans.length) return [];
    if (!hasSignedAgreement) return plans;

    return plans.filter((plan) => {
      const planCode = (plan.plan_code || "").toLowerCase();
      const isFree = String(plan.amount) === "0" || planCode === "freemium";
      return !isFree;
    });
  }, [plans, hasSignedAgreement]);

  const startUpgradeFlow = (plan: Plan) => {
    setPendingPlan(plan);
    setUpgradeForm((prev) => ({
      ...prev,
      panCard: userPan,
      agreeToTerms: false,
      agreementSignatureUrl: undefined,
      agreementSignaturePath: undefined,
      agreementSignedAt: undefined,
    }));
    setKycVerification(null);
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
      agreementSignatureUrl: undefined,
      agreementSignaturePath: undefined,
      agreementSignedAt: undefined,
    }));
    setKycVerification(null);
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
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`
      .trim()
      .replace(/\s+/g, " ");
    if (!fullName) {
      setKycError("Please update your name in the profile before proceeding.");
      return;
    }

    setKycSubmitting(true);
    setKycError(null);
    try {
      const data = await verifyPan({
        pan,
        name: fullName,
      });

      const verification: PanVerificationSummary = {
        referenceId: data.referenceId,
        valid: Boolean(data.valid),
        status: data.status,
        registeredName: data.registeredName,
        nameMatchScore: data.nameMatchScore,
        message: data.message,
        checkedAt: new Date().toISOString(),
      };
      setKycVerification(verification);

      if (!verification.valid) {
        setKycError(
          verification.message ||
            "We could not verify this PAN. Please double-check the details."
        );
        return;
      }

      toast.success("PAN verified successfully");

      await updateUser(String(user.id), {
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
    setUpgradeForm((prev) => ({
      ...prev,
      agreeToTerms: false,
      agreementSignatureUrl: undefined,
      agreementSignaturePath: undefined,
      agreementSignedAt: undefined,
    }));
    setKycError(null);
  };

  const handleAgreementComplete = () => {
    const planToCheckout = pendingPlan;
    const verification = kycVerification;
    setKycModalOpen(false);
    setKycStep("kyc");
    setKycError(null);
    setUpgradeForm((prev) => ({
      ...prev,
      agreeToTerms: false,
      agreementSignatureUrl: undefined,
      agreementSignaturePath: undefined,
      agreementSignedAt: undefined,
    }));
    setPendingPlan(null);
    setKycVerification(null);

    if (planToCheckout) {
      setTimeout(
        () =>
          handleSubscribe(planToCheckout.code, {
            bypassKyc: true,
            panVerification: verification,
          }),
        0
      );
    }
  };

  const handleSubscribe = async (
    code: string,
    opts?: {
      bypassKyc?: boolean;
      panVerification?: PanVerificationSummary | null;
    }
  ) => {
    if (!user) return;
    const selectedPlan = availablePlans.find((p) => p.code === code);
    if (!selectedPlan) return;

    const hasKyc = PAN_REGEX.test(userPan);
    const isPaidPlan =
      selectedPlan.amount > 0 && selectedPlan.plan_code !== "freemium";

    const upgradingFromFreeToPaid = onFreePlan && isPaidPlan;

    // When upgrading from free to a paid plan, normally go through
    // KYC + Agreement steps, unless the user has already signed
    // the agreement in a previous onboarding flow.
    const shouldRunKycAndAgreementFlow =
      (upgradingFromFreeToPaid || (isPaidPlan && !hasKyc)) &&
      !opts?.bypassKyc &&
      !hasSignedAgreement;

    if (shouldRunKycAndAgreementFlow) {
      startUpgradeFlow(selectedPlan);
      return;
    }

    try {
      setCheckingOut(selectedPlan.code);
      const orderResponse = await loader.withLoader(
        createCashfreeOrder({
          plan: selectedPlan.code,
          customer_id: String(user.id),
          customer_email: user.email,
          customer_phone: user.phone,
          // Let the server compose return_url with order_id for reconciliation
          source: "subscription",
          discount_amount: selectedPlan.amount,
          metadata: opts?.panVerification
            ? {
                panReference: opts?.panVerification?.referenceId || null,
                panStatus: opts?.panVerification?.status || null,
              }
            : undefined,
        })
      );

      const cashfree = await load({ mode: Config.cashfree_environment });
      const paymentSessionId = (orderResponse as any)?.order
        ?.payment_session_id;
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

  const onFreePlan =
    currentPlanCode === "freemium" ||
    user?.membership_plans?.plan_code === "freemium";

  const hasAnyPlan = Boolean(currentPlanCode);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" /> Plans
              & Pricing
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Choose the plan that fits you best
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Current Plan</CardTitle>
            <CardDescription className="text-sm">
              Your active membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubscriptionLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  {isSubscriptionError && (
                    <p className="text-xs text-red-600 mb-1">
                      Unable to load subscription details. Showing basic account
                      info.
                    </p>
                  )}
                  <h3 className="text-base sm:text-lg font-semibold">
                    {subscription?.subscription?.name
                      ? `${subscription.subscription.name} Plan`
                      : hasAnyPlan
                        ? `${
                            currentPlanCode === "freemium"
                              ? "Freemium"
                              : String(currentPlanCode)
                                  .replace("_", " ")
                                  .toUpperCase()
                          } Plan`
                        : "No Active Plan"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {!hasAnyPlan
                      ? "No active subscription"
                      : onFreePlan
                        ? "Free plan active"
                        : subscription?.is_premium
                          ? "Active subscription"
                          : "Subscription pending"}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-3">
                  <Badge
                    variant={
                      hasAnyPlan && subscription?.is_premium
                        ? "default"
                        : "secondary"
                    }
                    className="self-start sm:self-auto"
                  >
                    {!hasAnyPlan
                      ? "None"
                      : onFreePlan
                        ? "Free"
                        : subscription?.is_premium
                          ? "Active"
                          : "Pending"}
                  </Badge>
                  {subscription?.subscription && (
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p>
                        Amount: {formatINR(subscription.subscription.amount)}
                      </p>
                      <p>
                        Started:{" "}
                        {new Date(
                          subscription.subscription.startDate
                        ).toLocaleDateString()}
                      </p>
                      {subscription.subscription.expireNextRenewal && (
                        <p>
                          Expires:{" "}
                          {new Date(
                            subscription.subscription.expireNextRenewal
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
              const priceLabel = formatINR(plan.amount);
              const featureKey = getFeatureKey(plan);
              const disabled =
                planMatchesCurrent(featureKey) || checkingOut === plan.code;
              const ctaLabel = planMatchesCurrent(featureKey)
                ? "Current Plan"
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
                      onClick={() => handleSubscribe(plan.code)}
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
              <Label htmlFor="subscription-pan" className="text-sm">
                PAN Card*
              </Label>
              <Input
                id="subscription-pan"
                value={upgradeForm.panCard}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setUpgradeForm((prev) => ({
                    ...prev,
                    panCard: value,
                  }));
                  setKycVerification(null);
                  setKycError(null);
                }}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use uppercase letters exactly as they appear on your PAN card.
              </p>
            </div>
            {kycVerification && (
              <div
                className={`border rounded-lg p-3 text-sm ${
                  kycVerification.valid
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium flex items-center">
                    {kycVerification.valid
                      ? "PAN verified"
                      : "Verification pending"}
                  </p>
                  {kycVerification.referenceId && (
                    <span className="text-xs text-muted-foreground">
                      Ref: {kycVerification.referenceId}
                    </span>
                  )}
                </div>
                {kycVerification.registeredName && (
                  <p className="text-gray-700 mt-1">
                    Registered Name:{" "}
                    <strong>{kycVerification.registeredName}</strong>
                  </p>
                )}
                {kycVerification.message && (
                  <p className="text-gray-600 mt-1">
                    {kycVerification.message}
                  </p>
                )}
              </div>
            )}
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
              <Button
                onClick={handleKycSubmit}
                disabled={kycSubmitting}
                className="w-full sm:w-auto"
              >
                {"Verify & Continue"}
              </Button>
            </div>
          </div>
        ) : (
          <AgreementStep
            agreeToTerms={upgradeForm.agreeToTerms}
            //@ts-ignore
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
