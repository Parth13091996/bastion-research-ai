import { motion } from "framer-motion";
import { useState } from "react";
import { SignUpCard } from "./SignUpCard";
import SignUpForm from "./SignupForm";

export default function Register() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const stats = [
    { number: "58.15%", label: "Average Returns" },
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className=" bg-gradient-to-br from-slate-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-navy-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Start Your
                  <span className="block bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Investment Journey
                  </span>
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Join thousands of investors who trust Bastion for
                  institutional-grade research, risk management, and
                  personalized investment strategies.
                </motion.p>
              </div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-600">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

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
