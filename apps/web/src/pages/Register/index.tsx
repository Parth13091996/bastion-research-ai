import { motion } from "framer-motion";
import { useState } from "react";
import { SignUpCard } from "./SignUpCard";
import SignUpForm from "./SignupForm";
import ActionableAccountableBastion from "@/components/ActionableAccountableBastion";

export default function Register() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);



  return (
    <div className=" bg-gradient-to-br from-slate-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-navy-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <ActionableAccountableBastion />
            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <SignUpCard
                onSignUpClick={() => {
                  setIsSignUpOpen(true);
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {isSignUpOpen && (
        <SignUpForm
          isOpen={isSignUpOpen}
          onClose={() => {
            setIsSignUpOpen(false);
          }}
        />
      )}
    </div>
  );
}
