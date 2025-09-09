import axiosInstance from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/hooks/useLoader";
import { load } from "@cashfreepayments/cashfree-js";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type ApiPlan = {
  code: string;
  name: string;
  amount: number;
  currency: string;
};

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

const Subscription = () => {
  const { user } = useAuth();
  const loader = useLoader();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // In absence of a user subscription API, assume Free unless we later store it
  const [currentPlanCode] = useState<string>("free");

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/api/cashfree/plans");
        const apiPlans: ApiPlan[] = res.data?.plans || [];
        setPlans(apiPlans);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load plans");
      } finally {
        setIsLoading(false);
      }
    };

    const orderId = searchParams.get("order_id");
    if (orderId) {
      async function fetchOrderDetails() {
        console.log({ orderId });
        const response = await axiosInstance.get(
          `/api/cashfree/orders/${orderId}`
        );
        console.log({ response });
      }
      fetchOrderDetails();
      return;
    }
    fetchPlans();
  }, [searchParams]);

  const isCurrentPlan = (code: string) => code === currentPlanCode;

  const handleSubscribe = async (code: string) => {
    if (!user) return;
    if (code === "free") return; // No checkout for free
    try {
      setCheckingOut(code);
      const resp = await loader.withLoader(
        axiosInstance.post("/api/cashfree/orders", {
          plan: code,
          customer_id: user?.id,
          customer_email: user?.email,
          customer_phone: user?.phone,
          return_url: location.href,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-red-500" /> Plans & Pricing
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose the plan that fits you best
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isCurrentPlan("free")
                    ? "Freemium"
                    : currentPlanCode.toUpperCase()}{" "}
                  Plan
                </h3>
                <p className="text-muted-foreground">
                  {isCurrentPlan("free")
                    ? "Limited access to public content"
                    : "Active paid subscription"}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading && (
            <div className="col-span-3 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
            </div>
          )}
          {error && (
            <div className="col-span-3 text-sm text-red-600">{error}</div>
          )}
          {!isLoading &&
            !error &&
            plans.map((plan) => {
              const popular = plan.code === "12m";
              const limited = plan.code === "3m";
              const priceLabel =
                plan.amount > 0 ? formatINR(plan.amount) : "Free";
              const disabled = isCurrentPlan(plan.code);
              const ctaLabel = disabled
                ? "Current Plan"
                : plan.amount > 0
                  ? "Subscribe"
                  : "Get Started";

              return (
                <Card
                  key={plan.code}
                  className={`relative ${popular ? "border-red-400 shadow-md" : ""}`}
                >
                  {popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600">
                      Most Popular
                    </Badge>
                  )}
                  {limited && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 right-4"
                    >
                      Limited
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {plan.code === "free" ? "Freemium" : plan.name}
                    </CardTitle>
                    <CardDescription>
                      {plan.code === "free"
                        ? "Try before you upgrade"
                        : limited
                          ? "One-time availability for lifetime"
                          : "Best value for serious investors"}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{priceLabel}</span>
                      {plan.amount > 0 && (
                        <span className="text-muted-foreground"> one-time</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {(planFeatures[plan.code] || []).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={popular && !disabled ? "default" : "outline"}
                      disabled={disabled || checkingOut === plan.code}
                      onClick={() => handleSubscribe(plan.code)}
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
    </div>
  );
};

export default Subscription;
