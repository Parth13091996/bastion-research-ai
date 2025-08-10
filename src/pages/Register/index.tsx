import { Navigate } from "react-router-dom";
import SignUpForm from "./SignupForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 min-h-screen flex items-center justify-center">
      <SignUpForm />
    </div>
  );
}
