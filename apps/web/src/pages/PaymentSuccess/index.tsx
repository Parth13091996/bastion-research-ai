import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ArrowRight,
  Home,
  LayoutDashboard,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { getCashfreeOrder } from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";

type PaymentResultStatus =
  | "LOADING"
  | "SUCCESS"
  | "PENDING"
  | "USER_DROPPED"
  | "CANCELLED"
  | "FAILED"
  | "NOT_ATTEMPTED"
  | "ERROR";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState<PaymentResultStatus>("LOADING");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);
  const [pollCount, setPollCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const verifyPayment = useCallback(
    async (manualRefresh = false) => {
      if (!orderId) {
        setStatus("ERROR");
        setErrorMessage("No Order ID provided in the payment callback URL.");
        return;
      }

      if (manualRefresh) {
        setIsRefreshing(true);
      }

      try {
        setErrorMessage(null);
        const data = await getCashfreeOrder(orderId);
        setOrderDetails(data);

        // Authoritative verification check:
        // is_paid MUST be true AND payment_status MUST be SUCCESS
        if (data?.is_paid === true && data?.payment_status === "SUCCESS") {
          setStatus("SUCCESS");
          try {
            await refetchUser();
          } catch (e) {
            console.error("Error refreshing user profile:", e);
          }
        } else if (data?.payment_status === "PENDING") {
          setStatus("PENDING");
        } else if (data?.payment_status === "USER_DROPPED") {
          setStatus("USER_DROPPED");
        } else if (data?.payment_status === "CANCELLED") {
          setStatus("CANCELLED");
        } else if (data?.payment_status === "FAILED") {
          setStatus("FAILED");
        } else if (data?.payment_status === "NOT_ATTEMPTED") {
          setStatus("NOT_ATTEMPTED");
        } else {
          // Unrecognized or unpaid status
          setStatus("FAILED");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setStatus("ERROR");
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to reach the verification server to confirm payment status."
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [orderId, refetchUser]
  );

  // Initial verification on mount
  useEffect(() => {
    verifyPayment(false);
  }, [verifyPayment]);

  // Auto-poll if status is PENDING (up to 3 times, every 5 seconds)
  useEffect(() => {
    if (status !== "PENDING" || pollCount >= 3) return;

    pollTimeoutRef.current = setTimeout(() => {
      setPollCount((prev) => prev + 1);
      verifyPayment(false);
    }, 5000);

    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [status, pollCount, verifyPayment]);

  // Auto-redirect countdown ONLY on verified SUCCESS
  useEffect(() => {
    if (status !== "SUCCESS") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/user/app/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Loading State */}
        {status === "LOADING" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-500 text-sm">
              Please wait while we securely confirm your transaction with Cashfree...
            </p>
          </motion.div>
        )}

        {/* Verified SUCCESS State */}
        {status === "SUCCESS" && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
            >
              <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
              <div className="p-8 sm:p-10 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 mb-6 shadow-sm"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  Payment Successful!
                </h1>

                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  Your subscription has been activated successfully. Thank you for choosing Bastion Research.
                </p>

                {orderId && (
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Order ID</span>
                      <span className="text-gray-800 font-mono font-semibold truncate max-w-[200px]">
                        {orderId}
                      </span>
                    </div>
                    {orderDetails?.order_amount && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-500 font-medium">Amount Paid</span>
                        <span className="text-emerald-700 font-bold">
                          ₹{Number(orderDetails.order_amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5 font-medium">
                    <span>Redirecting to Dashboard in</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      {countdown}
                    </span>
                    <span>seconds...</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(AppRoutes.home)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition active:scale-[0.99]"
                  >
                    <Home className="w-4 h-4 text-gray-500" />
                    Home
                  </button>

                  <button
                    onClick={() => navigate("/user/app/dashboard")}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 transition active:scale-[0.99]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* PENDING State */}
        {status === "PENDING" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
          >
            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-sky-500" />
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-100 text-blue-600 mb-6 shadow-sm">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Processing
              </h2>

              <p className="text-gray-600 text-sm mb-6">
                Your payment is currently being processed by your bank. Please do not re-attempt payment while confirmation is pending.
              </p>

              {orderId && (
                <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 text-left border border-blue-100 space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Order ID</span>
                    <span className="text-gray-800 font-mono font-semibold truncate max-w-[200px]">
                      {orderId}
                    </span>
                  </div>
                  {orderDetails?.order_amount && (
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Amount</span>
                      <span className="text-gray-900 font-bold">
                        ₹{Number(orderDetails.order_amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      Processing
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => verifyPayment(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Check Status Again
                </button>
                <Link
                  to="/user/app/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* USER_DROPPED / CANCELLED / NOT_ATTEMPTED State */}
        {(status === "USER_DROPPED" || status === "CANCELLED" || status === "NOT_ATTEMPTED") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden"
          >
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500" />
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 text-amber-600 mb-6 shadow-sm">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {status === "CANCELLED" ? "Payment Cancelled" : "Payment Incomplete"}
              </h2>

              <p className="text-gray-600 text-sm mb-6">
                You exited the checkout session before completing the payment. No amount was debited from your account.
              </p>

              {orderId && (
                <div className="bg-amber-50/50 rounded-2xl p-4 mb-6 text-left border border-amber-100 space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Order ID</span>
                    <span className="text-gray-800 font-mono font-semibold truncate max-w-[200px]">
                      {orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {status === "CANCELLED" ? "Cancelled" : "Incomplete"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/user/app/account/subscription")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Retry Payment
                </button>
                <Link
                  to="/user/app/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAILED State */}
        {status === "FAILED" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden"
          >
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 text-red-600 mb-6 shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>

              <p className="text-gray-600 text-sm mb-6">
                {orderDetails?.payment_message ||
                  "Your transaction could not be processed. Please check your bank or payment method and try again."}
              </p>

              {orderId && (
                <div className="bg-red-50/50 rounded-2xl p-4 mb-6 text-left border border-red-100 space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Order ID</span>
                    <span className="text-gray-800 font-mono font-semibold truncate max-w-[200px]">
                      {orderId}
                    </span>
                  </div>
                  {orderDetails?.order_amount && (
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Amount</span>
                      <span className="text-gray-900 font-bold">
                        ₹{Number(orderDetails.order_amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Failed
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/user/app/account/subscription")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Retry Payment
                </button>
                <Link
                  to="/user/app/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ERROR / UNVERIFIED State */}
        {status === "ERROR" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="h-2 w-full bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600" />
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 border-4 border-gray-200 text-gray-600 mb-6 shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Status Unavailable
              </h2>

              <p className="text-gray-600 text-sm mb-6">
                {errorMessage ||
                  "We could not confirm the payment status at this moment. If money was debited from your account, your access will be activated once confirmed."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => verifyPayment(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-900 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Check Again
                </button>
                <Link
                  to="/user/app/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
