import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { SignUpCard } from "./SignUpCard";
import SignUpForm from "./SignupForm";

export default function Register() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // Restore open state if user was mid-onboarding when they refreshed
  useEffect(() => {
    try {
      const wasOpen = localStorage.getItem("onboardingOpen");
      const step = parseInt(
        localStorage.getItem("onboardingCurrentStep") || "1",
        10
      );
      if (wasOpen === "true" || (step && step > 1)) {
        setIsSignUpOpen(true);
      }
    } catch {}
  }, []);

  const stats = [
    { number: "58.15%", label: "Average Returns" },
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
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

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <SignUpCard
                  onSignUpClick={() => {
                    try {
                      localStorage.setItem("onboardingOpen", "true");
                    } catch {}
                    setIsSignUpOpen(true);
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">B</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Bastion TripleEdge
                      </h3>
                      <p className="text-gray-600">
                        Premium Investment Research
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Institutional-grade research
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Risk management tools
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Personalized strategies
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">24/7 expert support</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        58.15%
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Annual Returns
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sign Up Modal */}
      {isSignUpOpen && (
        <SignUpForm
          isOpen={isSignUpOpen}
          onClose={() => {
            try {
              localStorage.setItem("onboardingOpen", "false");
            } catch {}
            setIsSignUpOpen(false);
          }}
        />
      )}
    </div>
  );
}
