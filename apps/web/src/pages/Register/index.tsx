import { useState } from "react";
import { SignUpCard } from "./SignUpCard";
import SignUpForm from "./SignupForm";

export default function Register() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 min-h-screen flex items-center justify-center">
      <SignUpCard onSignUpClick={() => setIsSignUpOpen(true)} />
      {isSignUpOpen && (
        <SignUpForm
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
        />
      )}
    </div>
  );
}
