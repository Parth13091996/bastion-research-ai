import {
  createCashfreeOrder,
  fetchPlans,
  updateUser,
  verifyPan,
} from "@/api/onboarding-apis";
import Modal from "@/components/core/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/hooks/use-loader";
import { useSubscription } from "@/hooks/use-subscription";
import AgreementStep from "@/pages/Register/Steps/AgreementStep";
import { PAN_REGEX } from "@/utils";
import { Config } from "@/utils/config";
import { load } from "@cashfreepayments/cashfree-js";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import KycStep from "./SubscriptionKYCStep";
import CurrentPlanCard from "./CurrentPlanCard";
import PlansGrid from "./PlansGrid";

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
        <CurrentPlanCard
          isLoading={isSubscriptionLoading}
          isError={isSubscriptionError}
          subscription={subscription}
          hasAnyPlan={hasAnyPlan}
          onFreePlan={onFreePlan}
          currentPlanCode={currentPlanCode}
        />

        {/* Plans Grid */}
        <PlansGrid
          availablePlans={availablePlans}
          isPlansLoading={isPlansLoading}
          error={error}
          planMatchesCurrent={planMatchesCurrent}
          checkingOut={checkingOut}
          handleSubscribe={handleSubscribe}
        />
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
          <KycStep
            upgradeForm={upgradeForm}
            setUpgradeForm={setUpgradeForm}
            kycVerification={kycVerification}
            kycError={kycError}
            kycSubmitting={kycSubmitting}
            setKycVerification={setKycVerification}
            setKycError={setKycError}
            handleKycModalClose={handleKycModalClose}
            handleKycSubmit={handleKycSubmit}
          />
        ) : (
          <AgreementStep
            agreeToTerms={upgradeForm.agreeToTerms}
            formData={user}
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
