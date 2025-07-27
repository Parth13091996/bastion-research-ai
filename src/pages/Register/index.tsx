import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import SignupForm from "./SignupForm";

export default function Register() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/20">
      <SignupForm />
    </div>
  );
}
