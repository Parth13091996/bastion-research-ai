import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPortfolioDashboardData } from "@/api/recommendations-apis";

const count = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;
const ActionableAccountableBastion = () => {
  const { data } = useQuery({
    queryKey: ["public-recommendation-totals"],
    queryFn: getPortfolioDashboardData,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const active = count(data?.activeBuy) && count(data?.activeHold)
    ? data.activeBuy + data.activeHold : null;
  const stats = [
    { number: count(data?.totalRecommendations) ? String(data.totalRecommendations) : "—", label: "Total Ideas" },
    { number: count(active) ? String(active) : "—", label: "Active Ideas" },
    { number: count(data?.exitedClosed) ? String(data.exitedClosed) : "—", label: "Exited/Closed" },
  ];

  return (
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
          Actionable. Accountable.
          <span className="block bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Bastion.
          </span>
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Log in for concise notes, price triggers, and regular follow-through.
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-3 gap-6"
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
  );
};

export default ActionableAccountableBastion;
