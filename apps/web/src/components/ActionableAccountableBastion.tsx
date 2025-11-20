import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useSheetStocks from "@/hooks/use-sheets-stocks";

const ActionableAccountableBastion = () => {
  const [stats, setStats] = useState([
    { number: "0", label: "Total Ideas" },
    { number: "0", label: "Active Ideas" },
    { number: "0", label: "Sectors" },
  ]);

  const { sheetStocks } = useSheetStocks(true);

  useEffect(() => {
    try {
      const actions = (sheetStocks || [])
        .map((row: any) => row.band?.toString().trim().toUpperCase())
        .filter(Boolean);

      const totalIdeas = actions.length;
      const activeIdeas = actions.filter(
        (a) => a === "BUY" || a === "HOLD"
      ).length;
      const sectors = 13;

      setStats([
        { number: `${totalIdeas}`, label: "Total Ideas" },
        { number: `${activeIdeas}`, label: "Active Ideas" },
        { number: `${sectors}`, label: "Sectors" },
      ]);
    } catch (err) {
      console.error("Error computing recommendations stats:", err);
    }
  }, [sheetStocks]);

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
  );
};

export default ActionableAccountableBastion;
