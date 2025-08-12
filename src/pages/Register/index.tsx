import { Navigate } from "react-router-dom";
import SignUpForm from "./SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SignUpCard } from "./SignUpCard";

export default function Register() {
  const { user } = useAuth();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 min-h-screen flex items-center justify-center">
      <SignUpCard onSignUpClick={() => setIsSignUpOpen(true)} />
      {isSignUpOpen && <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />}
    </div>
  );
}
