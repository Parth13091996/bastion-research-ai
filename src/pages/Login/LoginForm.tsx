import { SignedOut, SignInButton, useSignIn } from "@clerk/clerk-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppRoutes } from "../routes";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const { signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const { toast } = useToast();
  // State for form inputs
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.errors?.[0]?.message || "Failed to log in",
        variant: "destructive",
      });
    }
  };

  // Toggle password visibility
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6">Please Login</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="* Email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="* Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            {/* Eye Icon to toggle password visibility */}
            <button
              type="button"
              onClick={handleShowPassword}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7C18.268 14.057 14.478 17 10 17s-8.268-2.943-9.542-7zm3 8A9.021 9.021 0 016.976 10c0-4.216 2.77-6.604 6.592-6.604 3.822 0 6.592 2.388 6.592 6.604 0 4.02-2.77 6.604-6.592 6.604zm-6.592-6.604c2.822 0 5.156-1.921 5.156-4.712 0-2.791-2.334-4.712-5.156-4.712-2.822 0-5.156 1.921-5.156 4.712 0 2.791 2.334 4.712 5.156 4.712z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7C18.268 14.057 14.478 17 10 17s-8.268-2.943-9.542-7zm3 8A9.021 9.021 0 016.976 10c0-4.216 2.77-6.604 6.592-6.604 3.822 0 6.592 2.388 6.592 6.604 0 4.02-2.77 6.604-6.592 6.604zm-6.592-6.604c2.822 0 5.156-1.921 5.156-4.712 0-2.791-2.334-4.712-5.156-4.712-2.822 0-5.156 1.921-5.156 4.712 0 2.791 2.334 4.712 5.156 4.712z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Remember Me and Lost Password */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input type="checkbox" id="remember-me" className="mr-2" />
              <label htmlFor="remember-me" className="text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-blue-500 hover:text-blue-700">
              Lost Your Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-800 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
          >
            LOGIN
          </button>
        </form>

        {/* OR Separator */}
        <div className="my-4 flex items-center justify-center">
          <hr className="w-1/2 h-px bg-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="w-1/2 h-px bg-gray-300" />
        </div>

        {/* Google Sign-In Button */}
        <SignedOut>
          <button className="custom-google-signin mx-auto w-full rounded-md text-md flex items-center justify-center">
            <SignInButton mode="redirect" />
          </button>
        </SignedOut>

        {/* Sign Up Link */}
        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link
            to={AppRoutes.register()}
            className="text-blue-500 hover:text-blue-700"
          >
            SIGNUP
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
