import React, { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { CircleCheck, User, Briefcase } from "lucide-react";
import Lottie from "lottie-react";
import testimonialAnim from "@/../public/media/testimonial.json";
import { testimonialApi } from "@/api/content";
import type { Testimonial } from "@repo/types";
import { toast } from "sonner";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};



const TestimonialCard = ({ testimonial }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mx-2 mb-4 transition duration-300 hover:brightness-110">
    {/* Title with Circle Check */}
    <div className="flex items-center justify-center gap-2 mb-4">
      <CircleCheck className="w-5 h-5" style={{ stroke: COLORS.red }} />
      <h3 className="font-semibold text-gray-900 text-center text-sm">
        {testimonial.title}
      </h3>
    </div>

    {/* Testimonial text */}
    <p className="text-gray-800 text-center italic text-sm leading-relaxed mb-4">
      "{testimonial.text}"
    </p>

    {/* Person name & position */}
    <div className="mt-auto text-center space-y-1">
      <div className="flex items-center justify-center gap-2 text-blue-900 font-medium text-sm">
        <User className="w-4 h-4" style={{ stroke: COLORS.red }} />
        <span>{testimonial.name}</span>
      </div>
      <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
        <Briefcase className="w-4 h-4" style={{ stroke: COLORS.red }} />
        <span>{testimonial.position}</span>
      </div>
    </div>
  </div>
);

const InfiniteScrollColumn = ({
  testimonials,
  direction = "up",
  duration = 40,
  isPaused,
}) => {
  const y = useMotionValue(0);

  const cardHeight = 296; // Approximate height
  const totalHeight = testimonials.length * cardHeight;
  const moveDistance = totalHeight / 3;

  useEffect(() => {
    let controls;

    if (!isPaused) {
      const from = direction === "up" ? 0 : -moveDistance;
      const to = direction === "up" ? -moveDistance : 0;

      controls = animate(y, [from, to], {
        ease: "linear",
        duration,
        repeat: Infinity,
      });
    }

    return () => {
      if (controls) controls.stop();
    };
  }, [isPaused, y, direction, duration, moveDistance]);

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#E6E6E6] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#E6E6E6] to-transparent z-10 pointer-events-none"></div>

      <motion.div className="flex flex-col" style={{ y }}>
        {testimonials.map((testimonial, idx) => (
          <TestimonialCard key={idx} testimonial={testimonial} />
        ))}
      </motion.div>
    </div>
  );
};

export default function Testimonial() {
  const [isPaused, setIsPaused] = useState(false);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const data = await testimonialApi.getAll();
      setDynamicTestimonials(data);
    } catch (error: any) {
      toast.error("Failed to load testimonials");
      console.error("Error loading testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Map dynamic testimonials to the expected format
  const allTestimonials = dynamicTestimonials.map(t => ({
    title: t.title,
    text: t.text,
    name: t.name,
    position: t.position,
  }));

  // Split testimonials into two columns
  const column1Testimonials = allTestimonials.slice(0, Math.ceil(allTestimonials.length / 2));
  const column2Testimonials = allTestimonials.slice(Math.ceil(allTestimonials.length / 2));

  // Triple the arrays for seamless infinite scroll
  const infiniteColumn1 = [
    ...column1Testimonials,
    ...column1Testimonials,
    ...column1Testimonials,
  ];
  const infiniteColumn2 = [
    ...column2Testimonials,
    ...column2Testimonials,
    ...column2Testimonials,
  ];

  return (
    <div
      className="relative w-full overflow-hidden max-w-6xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* LEFT CONTENT - 40% */}
        <div className="lg:col-span-2 flex flex-col items-start space-y-6 p-6">
          <div className="w-56 md:w-72 mx-auto lg:mx-0">
            <Lottie animationData={testimonialAnim} loop={true} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 text-center lg:text-left">
            What Our Subscribers Say
          </h2>
          <p className="text-gray-700 text-center lg:text-left">
            Real stories from real investors who use{" "}
            <span className="font-semibold">Bastion CORE</span> to make smarter
            investment decisions. Trusted insights, practical research, and
            results that matter.
          </p>
        </div>

        {/* RIGHT CONTENT - 60% */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfiniteScrollColumn
            testimonials={infiniteColumn1}
            direction="up"
            duration={35}
            isPaused={isPaused}
          />
          <InfiniteScrollColumn
            testimonials={infiniteColumn2}
            direction="down"
            duration={40}
            isPaused={isPaused}
          />
        </div>
      </div>
    </div>
  );
}
