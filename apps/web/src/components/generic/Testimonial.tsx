import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { CircleCheck, User, Briefcase } from "lucide-react";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const testimonials = [
  {
    title: "Trusted Market Research",
    text: "Clear research, quarterly tracking, and timely updates to help you stay on top of your positions.",
    name: "Dr. Meera S.",
    position: "Equity Analyst",
  },
  {
    title: "Actionable Insights",
    text: "Their analysis simplifies complex financial data into clear strategies I can actually implement.",
    name: "Rajesh P.",
    position: "Portfolio Manager",
  },
  {
    title: "Reliable Expertise",
    text: "The insights consistently help me refine my strategies in Indian equities.",
    name: "Ananya G.",
    position: "Investment Advisor",
  },
  {
    title: "Professional Guidance",
    text: "With their data-driven reports, my clients trust my advice even more.",
    name: "Arvind N.",
    position: "Wealth Consultant",
  },
  {
    title: "Strong Value Addition",
    text: "Bastion CORE’s quarterly updates give me clarity on market moves before they happen.",
    name: "Shalini R.",
    position: "Financial Planner",
  },
  {
    title: "Deep Market Knowledge",
    text: "The quality of research is comparable to global firms, but focused on India.",
    name: "Sandeep K.",
    position: "CIO, Investment Firm",
  },
];

export default function Testimonial() {
  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#E6E6E6] via-[#E6E6E6]/80 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#E6E6E6] via-[#E6E6E6]/80 to-transparent z-20 pointer-events-none"></div>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1.5} // mobile default
        spaceBetween={24}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          reverseDirection: true,
          pauseOnMouseEnter: true,
        }}
        speed={600}
        breakpoints={{
          768: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        className="!py-8"
      >
        {testimonials.map((t, idx) => (
          <SwiperSlide key={idx} className="flex">
            <div className="bg-white/20 rounded-2xl shadow-lg p-6 flex flex-col justify-between w-full min-h-[280px]">
              {/* Title with Circle Check */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <CircleCheck
                  className="w-5 h-5"
                  style={{ stroke: COLORS.red }}
                />
                <h3 className="font-semibold text-gray-900 text-center">
                  {t.title}
                </h3>
              </div>

              {/* Testimonial text */}
              <p className="text-gray-700 text-center italic">"{t.text}"</p>

              {/* Person name & position */}
              <div className="mt-6 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-blue-900 font-medium">
                  <User className="w-4 h-4" style={{ stroke: COLORS.red }} />
                  <span>{t.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                  <Briefcase
                    className="w-4 h-4"
                    style={{ stroke: COLORS.red }}
                  />
                  <span>{t.position}</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
