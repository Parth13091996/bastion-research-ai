import Footer from "@/components/generic/Footer";
import Header from "@/components/generic/Header";
import MainBanner from "@/files/main-banner.svg";
// import mainPageImage from "@/files/main-page-image.svg";
import { CheckCircle } from "lucide-react";


const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-[#1B2852] w-full min-h-[300px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            <img
              src={MainBanner}
              alt="Research Banner"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-auto w-full md:w-[55%] object-contain pointer-events-none z-0"
            />
            <div className="relative z-10 max-w-[700px]">
              <div className="absolute inset-0 bg-[#1B2852]/80 md:hidden -z-10 rounded-lg" />
              <h1 className="text-white text-2xl md:text-[4rem] font-semibold leading-snug drop-shadow-md">
                Maximizing Your <br className="hidden sm:block" />
                Research Quality <br className="hidden sm:block" />
                Per Unit Of Stress
              </h1>
            </div>
          </div>
        </section>

        {/* About Section */}

        <section className="py-12 pb-16 bg-white">
          <div className="max-w-7xl px-6 md:px-8 mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  About Bastion
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Bastion Research is a boutique equity research entity focusing
                  on the Indian market. We provide comprehensive and independent
                  research services to empower fund managers, institutional
                  entities, and family offices in making prudent investment
                  decisions.
                </p>
                <p className="text-lg text-gray-600">
                  Our strength lies in a deep understanding of the domain we
                  serve. Our approach is rooted in delivering top-notch service,
                  essentially acting as an additional research partner for your
                  organization and enhancing your strategic capacities.
                </p>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                {/* <img
                  src={mainPageImage}
                  alt="Bastion Research illustration"
                  className="w-full h-auto"
                /> */}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-red-600 pb-16 py-12">
          <div className="px-6 md:px-8 max-w-7xl mx-auto">
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-white text-center">
              <p className="mb-4">
                Coming Together Is Beginning. Keeping Together Is Progress.
                Working Together Is Success.
              </p>
              <footer className="text-base sm:text-lg text-white opacity-90">
                - Henry Ford
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Engagement Models Section */}
        <section className="py-12 pb-16 bg-white">
          <div className="max-w-7xl px-6 md:px-8 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Engagement Models
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12rem]">
              {/* Research Ally */}
              <div className="bg-[#1B2852] rounded-lg overflow-hidden shadow-lg">
                <div className="bg-[#1B2852] text-white p-5 font-semibold text-lg text-center">
                  Research Ally
                </div>
                <div className="bg-white p-6 space-y-4">
                  {[
                    "One-to-One Interaction",
                    "Comprehending the Business",
                    "Quarterly & Other Updates",
                    "Analyst Access",
                    "Access to Key Data",
                    "Response to queries regarding the business under discussion",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <CheckCircle className="text-green-500 mt-1 w-5 h-5" />
                      <span className="text-sm text-gray-800">{item}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button className="bg-[#1B2852] text-white text-sm font-semibold px-4 py-2 rounded hover:opacity-90">
                      Know More
                    </button>
                  </div>
                </div>
              </div>

              {/* Bastion Core */}
              <div className="bg-[#101B42] rounded-lg overflow-hidden shadow-lg">
                <div className="bg-[#101B42] text-white p-5 font-semibold text-lg text-center">
                  Bastion <span className="text-red-500">CORE</span>
                </div>
                <div className="bg-white p-6 space-y-4">
                  {[
                    "Subscription Based Platform",
                    "Comprehensive Business Note",
                    "Quarterly Result & Con Call Updates",
                    "Regular Updates on Key Matters",
                    "“Preferred” Seal based on our S M A R T Framework",
                    "Q U A N T Screen for Ideation",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <CheckCircle className="text-green-500 mt-1 w-5 h-5" />
                      <span className="text-sm text-gray-800">
                        {item.includes("S M A R T") ? (
                          <>
                            “Preferred” Seal based on our{" "}
                            <span className="text-red-600 font-semibold">
                              S M A R T
                            </span>{" "}
                            Framework
                          </>
                        ) : item.includes("Q U A N T") ? (
                          <>
                            <span className="text-red-600 font-semibold">
                              Q U A N T
                            </span>{" "}
                            Screen for Ideation
                          </>
                        ) : (
                          item
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="pt-4 flex flex-wrap justify-between gap-2">
                    <button className="bg-[#101B42] text-white text-sm font-semibold px-4 py-2 rounded hover:opacity-90">
                      Know More
                    </button>
                    <button className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-red-700">
                      Explore Spotlight
                    </button>
                    <button className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-red-700">
                      Explore QUANT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
