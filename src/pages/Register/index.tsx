import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import SignUpForm from "./SignupForm";

export default function Register() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 min-h-screen flex items-center justify-center">
      <SignUpForm />
    </div>
  );
}
