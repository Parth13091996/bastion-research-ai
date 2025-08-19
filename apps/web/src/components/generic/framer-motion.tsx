import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Brand colors
export const NAVY = "#1C2852";
export const MAROON = "#C00000";

// Interactive background shapes
const BackgroundShapes: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, ${MAROON}30, ${NAVY}15, transparent 70%)`,
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: 120 + i * 40,
            height: 120 + i * 40,
            background: `linear-gradient(45deg, ${
              i % 2 === 0 ? NAVY : MAROON
            }40, ${i % 2 === 0 ? NAVY : MAROON}20)`,
          }}
          animate={{
            x: mousePosition.x * (50 + i * 20) - 60,
            y: mousePosition.y * (50 + i * 20) - 60,
            rotate: mousePosition.x * 360,
          }}
          transition={{
            type: "spring",
            stiffness: 50 - i * 5,
            damping: 20,
          }}
          initial={{
            x:
              typeof window !== "undefined"
                ? Math.random() * window.innerWidth
                : 0,
            y:
              typeof window !== "undefined"
                ? Math.random() * window.innerHeight
                : 0,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(${NAVY}80 1px, transparent 1px),
            linear-gradient(90deg, ${NAVY}80 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated lines */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute opacity-15"
          style={{
            width: 3,
            height: 200,
            background: `linear-gradient(to bottom, transparent, ${MAROON}80, transparent)`,
            left: `${20 + i * 20}%`,
          }}
          animate={{
            y: mousePosition.y * 100 - 100,
            scaleY: 1 + mousePosition.x * 0.5,
          }}
          transition={{
            type: "spring",
            stiffness: 100 - i * 10,
            damping: 20,
          }}
        />
      ))}

      {/* Chart pattern */}
      <svg
        className="absolute bottom-0 right-0 opacity-10 w-96 h-48"
        viewBox="0 0 400 200"
      >
        <motion.path
          d={`M 0,150 Q 100,${120 + mousePosition.y * 40} 200,100 T 400,${
            80 + mousePosition.x * 60
          }`}
          stroke={MAROON}
          strokeWidth="3"
          fill="none"
          animate={{
            d: `M 0,150 Q 100,${120 + mousePosition.y * 40} 200,${
              100 + mousePosition.x * 30
            } T 400,${80 + mousePosition.y * 60}`,
          }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={`M 0,120 Q 150,${90 + mousePosition.x * 30} 300,70 T 400,${
            50 + mousePosition.y * 40
          }`}
          stroke={NAVY}
          strokeWidth="3"
          fill="none"
          animate={{
            d: `M 0,120 Q 150,${90 + mousePosition.x * 30} 300,${
              70 + mousePosition.y * 20
            } T 400,${50 + mousePosition.x * 40}`,
          }}
          transition={{ duration: 0.7 }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full opacity-30"
          style={{
            background: i % 2 === 0 ? NAVY : MAROON,
          }}
          animate={{
            x:
              mousePosition.x * (200 + i * 10) -
              100 +
              Math.sin(Date.now() * 0.001 + i) * 50,
            y:
              mousePosition.y * (200 + i * 10) -
              100 +
              Math.cos(Date.now() * 0.001 + i) * 50,
          }}
          transition={{
            type: "spring",
            stiffness: 20 + i * 5,
            damping: 15,
          }}
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 1000),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 1000),
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundShapes;
