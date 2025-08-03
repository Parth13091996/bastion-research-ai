import { useSignIn } from "@clerk/clerk-react";
import React from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../routes";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const { signIn } = useSignIn();
  const { toast } = useToast();

  const signInWith = (strategy) => {
    if (!signIn) return;
    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: AppRoutes.home(),
      redirectUrlComplete: AppRoutes.home(),
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
        <p className="text-center text-gray-600 mb-6">
          Sign in to continue to your account.
        </p>

        <button
          onClick={() => signInWith("oauth_google")}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 381.5 512 244 512S0 403.3 0 261.8C0 120.3 106.5 8 244 8S488 120.3 488 261.8zM100.9 261.8c0 79.2 61.4 143.4 143.1 143.4s143.1-64.2 143.1-143.4S323.2 118.4 244 118.4 100.9 182.6 100.9 261.8zM393.1 261.8c0 42.4-31.5 76.8-70.3 76.8s-70.3-34.4-70.3-76.8 31.5-76.8 70.3-76.8 70.3 34.4 70.3 76.8zM476.9 261.8c0-12.7-1.1-25.2-3.1-37.3H244v71.5h131.3c-5.4 36.5-34.3 63.3-71.5 63.3-42.2 0-76.5-34.3-76.5-76.5s34.3-76.5 76.5-76.5c23.3 0 43.6 9.6 58.9 24.5l56.2-56.2C387.1 82.2 322.8 48 244 48c-79.5 0-144.7 54.8-167.1 128.2-1.9 7.6-1.9 15.6 0 23.2C79.3 371.2 144.5 426 223 426c45.4 0 84.4-19.6 112.4-51.4 28-31.8 43.5-73.9 43.5-112.8z"
            ></path>
          </svg>
          Sign in with Google
        </button>

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
