import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import favicon from "../../../../server/public/favicon.webp";
import { AppRoutes } from "@/routes/app-routes";
import ActionableAccountableBastion from "@/components/ActionableAccountableBastion";
import { signIn } from "@/api/auth-api";
import { sendEmailOtp } from "@/api/onboarding-apis";
import SignUpForm from "../Register/SignupForm";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  otp: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation<any, Error, LoginFormValues>({
    mutationFn: (data) => signIn(data),
    onSuccess: (data) => {
      login(data.user);
      const shouldResumeOnboarding = data?.user?.status !== "active";
      if (shouldResumeOnboarding) {
        toast.success("Welcome back! Let’s finish your onboarding.");
        setTimeout(() => {
          setIsSignUpOpen(true);
        }, 100);
      } else {
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate(AppRoutes.dashboard, { replace: true });
        }, 100);
      }
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => sendEmailOtp(email),
    onSuccess: () => {
      toast.success("OTP sent to your email!");
      setOtpSent(true);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    if (useOtp) {
      // handle OTP login
      mutation.mutate({ email: data.email, otp: data.otp });
    } else {
      mutation.mutate(data);
    }
  };

  const handleSendOtp = () => {
    const email = watch("email");
    if (!email) {
      toast.error("Please enter your email to receive OTP");
      return;
    }
    sendOtpMutation.mutate(email);
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(AppRoutes.dashboard, {
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-navy-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <ActionableAccountableBastion />

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        <img src={favicon} alt="logo" />
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password or OTP */}
                  {!useOtp ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {!otpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
                          disabled={sendOtpMutation.isPending}
                        >
                          {sendOtpMutation.isPending
                            ? "Sending OTP..."
                            : "Send OTP"}
                        </Button>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter OTP"
                            {...register("otp")}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-end justify-end">
                    <Link
                      to={AppRoutes.forgotPassword}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Toggle Login Method */}
                  <div className="flex items-center ">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useOtp}
                        onChange={(e) => {
                          setUseOtp(e.target.checked);
                          setOtpSent(false);
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        Login with Email OTP
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  {(!useOtp || otpSent) && (
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
                      >
                        {mutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </motion.div>
                  )}
                </form>
                <div className="mt-6 text-center">
                  {" "}
                  <span className="text-sm text-gray-600">
                    {" "}
                    Don't have an account?{" "}
                  </span>{" "}
                  <span
                    onClick={() => setIsSignUpOpen(true)}
                    className="text-sm text-red-600 hover:underline font-medium cursor-pointer"
                  >
                    {" "}
                    Create One Now (FREE){" "}
                  </span>{" "}
                  <span className="text-sm text-gray-600">
                    {" "}
                    and View Our Research{" "}
                  </span>{" "}
                </div>
              </div>
              {/* Background decoration */}{" "}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-20 blur-3xl"></div>{" "}
              <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* CTA Section for New Users */}
      <section className="py-20 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Glass Card Container */}
            <div className="backdrop-blur-md bg-white/20 border border-white/80 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-10 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                New to Bastion?
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Access the research that powers confident investment decisions.
              </p>

              {/* Buttons Wrapper */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/"
                    className="inline-flex items-center px-8 py-4 bg-[#C00000] text-white font-semibold rounded-2xl hover:bg-[#a00000] transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    Explore Services <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-[#1C2852] text-white font-semibold rounded-2xl hover:bg-[#162044] transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    View Research <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <SignUpForm
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
      />
    </div>
  );
};
export default Login;
