import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Star } from "lucide-react";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const reviews = [
  {
    text: "Bastion CORE has changed how I evaluate businesses. The reports are clear, decisive, and actually help me take action.",
    name: "Rohan S.",
  },
  {
    text: "The research is top-notch and has helped me make confident decisions in the stock market.",
    name: "Anita P.",
  },
  {
    text: "Their insights into Indian equities are unmatched. I now feel much more in control of my portfolio.",
    name: "Vikram K.",
  },
  {
    text: "Clear, detailed, and practical reports. Exactly what every investor needs.",
    name: "Priya R.",
  },
  {
    text: "The level of analysis is exceptional. It saves me hours of independent research every week.",
    name: "Arjun M.",
  },
  {
    text: "Professional, reliable, and accurate. Bastion CORE has truly raised my investing standards.",
    name: "Sneha G.",
  },
  {
    text: "I trust their recommendations because they are backed by data, not speculation.",
    name: "Manish T.",
  },
  {
    text: "For anyone serious about wealth creation in Indian markets, this is a must-have resource.",
    name: "Kavita L.",
  },
  {
    text: "I was a beginner, but their research made me confident in taking my first investment steps.",
    name: "Rahul D.",
  },
  {
    text: "Timely updates and actionable insights – I no longer miss opportunities in the market.",
    name: "Shreya N.",
  },
];

export default function Review() {
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
        {reviews.map((review, idx) => (
          <SwiperSlide key={idx} className="flex h-auto">
            <div className="bg-white/20 rounded-2xl shadow-lg p-6 flex flex-col justify-between w-full h-full min-h-[240px]">
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    style={{ fill: COLORS.red, stroke: COLORS.red }}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-800 text-center italic flex-grow flex items-center justify-center">
                "{review.text}"
              </p>

              {/* Name */}
              <h4 className="mt-6 font-medium text-center text-blue-900">
                {review.name} – Subscriber
              </h4>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
