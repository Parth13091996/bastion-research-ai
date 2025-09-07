import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/contexts/LoaderContext";
import { AppRoutes } from "@/routes/app-routes";
import { Config } from "@/utils/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { start: showLoader, stop: hideLoader } = useLoader();

  // Redirect immediately during render once auth is known
  const shouldRedirect = !isLoading && isAuthenticated && isAdmin;

  useEffect(() => {
    if (isLoading) {
      showLoader("Checking session...");
    } else {
      hideLoader();
    }
    return () => hideLoader();
  }, [isLoading, showLoader, hideLoader]);

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
      axiosInstance
        .post("/api/auth/signin", { ...data, isAdminLogin: true })
        .then((res) => res.data),
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

  if (isLoading) return <></>;
  if (shouldRedirect)
    return <Navigate to={AppRoutes.adminDashboard()} replace />;

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
