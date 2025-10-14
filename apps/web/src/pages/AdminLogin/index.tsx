import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/hooks/use-loader";
import { AppRoutes } from "@/routes/app-routes";
import { Config } from "@/utils/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";
import { endpoints } from "@/api/endpoints";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const loader = useLoader();

  // Redirect immediately during render once auth is known
  const shouldRedirect = !isLoading && isAuthenticated && isAdmin;

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
      loader.withLoader(
        axiosInstance
          .post(endpoints.auth.signin, { ...data, isAdminLogin: true })
          .then((res) => res.data),
        "Logging in..."
      ),
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

  useEffect(() => {
    if (isLoading) {
      loader.start("Checking session...");
    } else {
      loader.stop();
    }
  }, [isLoading, loader]);

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
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
