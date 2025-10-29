import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  fetchSheetObjects,
  normalizeKey,
  toNumber,
  toPercent,
  RowObject,
} from "../lib/googleSheet";

const ActionableAccountableBastion = () => {
  // 👉 Replace this with your actual Google Sheet URL
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1ECA3hzUmyooulaWxArjM7iGzF9y-h45ogJ8yLdlEo3A/edit?gid=0#gid=0";

  const [stats, setStats] = useState([
    { number: "0", label: "Total Ideas" },
    { number: "0", label: "Active Ideas" },
    { number: "0", label: "Sectors" },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rows = await fetchSheetObjects(SHEET_URL);

        const actions = rows
          .map((row) => row["Action"]?.toString().trim().toUpperCase())
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
        console.error("Error fetching sheet data:", err);
      }
    };

    // Initial fetch
    loadData();

    // Auto refresh every 60 seconds
    const interval = setInterval(loadData, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Heading */}
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
  );
};

export default ActionableAccountableBastion;
