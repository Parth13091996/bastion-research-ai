import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "../../../public/media/favicon.webp";


interface SignUpCardProps {
  onSignUpClick: () => void;
}

export function SignUpCard({ onSignUpClick }: SignUpCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-red-200 to-red-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 blur-xl"></div>

        <CardHeader className="relative z-10 text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <img src={Logo} alt="logo" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Start Your Journey
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Join thousands of successful investors
          </p>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Benefits list */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Institutional-grade research</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Comprehensive risk management</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Personalized investment strategies</span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSignUpClick}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Trusted by 10,000+ investors worldwide
            </p>
            <div className="flex items-center justify-center space-x-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-red-400 rounded-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
