import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/api/axios";
import { Config } from "@/utils/config";
import { toast } from "sonner";
import { AppRoutes } from "@/routes";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin && !isLoading) {
      navigate(AppRoutes.adminDashboard(), { replace: true });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation<
    { user: { role: string } },
    Error,
    LoginFormValues
  >({
    mutationFn: (data) =>
      axiosInstance.post("/api/auth/signin", data).then((res) => res.data),
    onSuccess: (data: any) => {
      if (data.user?.role === Config.roles.admin) {
        toast.success("Admin logged in successfully");
        login(data.user);
        navigate(AppRoutes.adminDashboard());
      }
    },
    onError: (error: Error & { response: { data: { message: string } } }) => {
      toast.error(error?.response?.data?.message);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    // Add page loader.
    return <></>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
