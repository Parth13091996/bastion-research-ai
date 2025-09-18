import { useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppRoutes } from "@/routes/app-routes";
import { motion } from "framer-motion";
import { endpoints } from "@/api/endpoints";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await axiosInstance.post(endpoints.auth.resetPassword, {
        token,
        password: data.password,
      });
      navigate(AppRoutes.login());
    } catch (e: any) {
      setServerError(e?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-navy-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset password
              </h1>
              <p className="text-gray-600 mb-6">
                Enter a new password for your account.
              </p>

              {!token && (
                <div className="rounded-lg bg-yellow-50 text-yellow-700 p-3 mb-6">
                  Missing or invalid reset token. Request a new link.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {serverError && (
                  <div className="rounded-lg bg-red-50 text-red-700 p-3">
                    {serverError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !token}
                >
                  {isSubmitting ? "Updating…" : "Update Password"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to={AppRoutes.login()}
                  className="text-sm text-red-600 hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
