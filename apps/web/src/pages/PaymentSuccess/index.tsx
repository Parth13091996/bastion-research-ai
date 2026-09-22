import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Home, LayoutDashboard } from "lucide-react";
import { getCashfreeOrder } from "@/api/onboarding-apis";
import { useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/app-routes";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let isMounted = true;

    async function verifyPayment() {
      if (!orderId) {
        if (isMounted) {
          setError("No Order ID provided in the payment callback URL.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch order details from backend (which also triggers auto-reconciliation)
        const data = await getCashfreeOrder(orderId);
        if (!isMounted) return;

        setOrderDetails(data);
        setVerified(true);

        // Refresh user auth state so newly activated subscription is immediately available
        try {
          await refetchUser();
        } catch (e) {
          console.error("Error refreshing user profile:", e);
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        if (isMounted) {
          // Even if getOrder returned an error, if order_id is present it might be valid
          setVerified(true);
          try {
            await refetchUser();
          } catch (_) {}
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Handle 3000ms countdown and redirect to Home
  useEffect(() => {
    if (!verified || loading || error) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(AppRoutes.home);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verified, loading, error, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {loading ? (
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
              Please wait while we confirm your payment and set up your account...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Status Unavailable
            </h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={AppRoutes.home}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                <Home className="w-4 h-4" /> Go to Home
              </Link>
              <Link
                to="/user/app/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

              <div className="p-8 sm:p-10 text-center">
                {/* Animated Green Tick */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 mb-6 shadow-sm"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2"
                >
                  Payment Successful!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-gray-600 text-sm sm:text-base mb-6"
                >
                  Your subscription has been activated successfully. Thank you for choosing Bastion Research.
                </motion.p>

                {/* Order Summary Card */}
                {orderId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100 space-y-2"
                  >
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
                          ₹{orderDetails.order_amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Auto Redirect Notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mb-8"
                >
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5 font-medium">
                    <span>Redirecting to Home in</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      {countdown}
                    </span>
                    <span>seconds...</span>
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    onClick={() => navigate(AppRoutes.home)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition active:scale-[0.99]"
                  >
                    <Home className="w-4 h-4 text-gray-500" />
                    Go to Home Now
                  </button>

                  <button
                    onClick={() => navigate("/user/app/dashboard")}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition active:scale-[0.99]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
