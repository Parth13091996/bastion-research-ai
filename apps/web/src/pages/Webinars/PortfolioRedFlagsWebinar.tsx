import React, { useEffect, useState } from "react";
import {
  Shield,
  TrendingUp,
  Clock,
  Gift,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Construction,
  Ghost,
  XCircle,
  Users,
  ArrowRightLeft,
  Lock,
  ShieldAlert,
  Flame,
  Calendar,
  Video,
  Award,
  CheckCircle,
  ChevronDown,
  Star,
  Search,
  Target,
  AlertCircle,
  UserX,
  BookOpen,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { WebinarRegistrationForm } from "@/components/webinar/WebinarRegistrationForm";
import {
  webinarData,
  whatYoullLearn,
  whoShouldAttend,
  benefits,
  faqs,
} from "./PortfolioRedFlagsWebinarData";

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield,
  TrendingUp,
  Clock,
  Gift,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Construction,
  Ghost,
  XCircle,
  Users,
  ArrowRightLeft,
  Lock,
  ShieldAlert,
  Flame,
  Search,
  Target,
  AlertCircle,
  UserX,
  BookOpen,
  User,
};

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_join-webinar/artifacts/rihrnsgc_42bbb863-cf72-47f6-8380-aab233af000b.jpeg";

const WEBINAR_SLUG = "portfolio-red-flags-2026-03-05";

const PortfolioRedFlagsWebinar: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document
        .getElementById("registration-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#E6E6E6]/30 to-white">
      {/* Sticky Header CTA */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
          isScrolled ? "translate-y-0 shadow-lg" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Bastion Research" className="h-8" />
            <Badge className="bg-[#C00000] text-white">LIVE WEBINAR</Badge>
            <span className="text-sm font-medium text-[#1C2852]">
              5th March • 3 PM IST
            </span>
          </div>
          <Button
            onClick={scrollToForm}
            className="bg-[#C00000] hover:bg-[#A00000] text-white font-semibold px-6 py-2"
          >
            Register Free
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2852] via-[#1C2852] to-[#0f1629] text-white pt-20 pb-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#C4B696] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#C00000] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <img
                src={LOGO_URL}
                alt="Bastion Research"
                className="h-16 mx-auto mb-6"
              />
            </div>
            <Badge className="bg-[#C00000] text-white mb-6 px-4 py-2 text-sm">
              FREE LIVE WEBINAR • LIMITED SEATS
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {webinarData.title}
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
              {webinarData.subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#C4B696]" />
                <span>{webinarData.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#C4B696]" />
                <span>{webinarData.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-[#C4B696]" />
                <span>{webinarData.duration}</span>
              </div>
            </div>

            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-[#C00000] hover:bg-[#A00000] text-white font-bold px-12 py-7 text-xl rounded-xl shadow-2xl hover:shadow-[#C00000]/50 transition-all duration-300 hover:scale-105"
            >
              Reserve My Free Seat Now
              <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
            </Button>

            <p className="mt-6 text-sm text-gray-400">
              <CheckCircle className="inline h-4 w-4 mr-1 text-green-400" />
              {webinarData.stats.attendees} Investors Already Registered
            </p>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C2852] mb-6">
                One Wrong Stock Can Destroy Years of Gains
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Most investors lose money not because they picked bad sectors,
                but because they missed
                <span className="font-bold text-[#C00000]">
                  {" "}
                  hidden red flags
                </span>{" "}
                that were always visible.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#C00000]/5 to-[#1C2852]/5 rounded-3xl p-10 border-2 border-[#C00000]/20 mb-12">
              <h3 className="text-2xl font-bold text-[#1C2852] mb-8 text-center">
                The Brutal Math of Recovery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { loss: "25%", need: "33%" },
                  { loss: "50%", need: "2x" },
                  { loss: "75%", need: "4x" },
                  { loss: "90%", need: "10x" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="text-[#C00000] font-bold text-3xl mb-2">
                      {item.loss}
                    </div>
                    <div className="text-gray-600 text-sm mb-3">Loss</div>
                    <div className="h-px bg-gray-300 mb-3" />
                    <div className="text-[#1C2852] font-bold text-2xl mb-2">
                      {item.need}
                    </div>
                    <div className="text-gray-600 text-sm">Gain Needed</div>
                  </div>
                ))}
              </div>
              <p className="text-center mt-8 text-gray-700 font-medium">
                Prevention is easier than recovery. Learn to spot problems{" "}
                <span className="text-[#C00000]">before</span> they cost you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Attend Section */}
      <section className="py-20 bg-gradient-to-b from-[#E6E6E6]/50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-[#C4B696] text-[#1C2852] mb-4">
                WHO SHOULD ATTEND
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C2852] mb-6">
                This Webinar is Perfect For You If...
              </h2>
            </div>

            <div className="space-y-4">
              {whoShouldAttend.map((item, idx) => {
                const Icon = iconMap[item.icon];
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-l-4 border-[#C00000]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#C00000]/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-[#C00000]" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 pt-2">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-[#C00000] text-white mb-4">
                WHAT YOU&apos;LL DISCOVER
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C2852] mb-6">
                What You&apos;ll Learn in This 60-Minute Session
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A proven framework used by professional analysts to spot
                problems before they destroy portfolios
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whatYoullLearn.map((item, idx) => {
                const Icon = iconMap[item.icon];
                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-[#1C2852]/5 to-[#C4B696]/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C00000] flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C2852] mb-3 text-center">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-[#C00000]/10 via-[#C4B696]/10 to-[#C00000]/10 rounded-2xl p-8 border-2 border-[#C00000]/20">
                <p className="text-2xl font-bold text-[#1C2852] mb-4">
                  🎁 Bonus: Live Demonstration + Ready-to-Use Checklist
                </p>
                <p className="text-lg text-gray-700">
                  Watch Parth analyze real companies on Screener.in and Tijori
                  to spot these red flags in real-time. Plus, you&apos;ll
                  receive an easy-to-use checklist at the end that you can
                  immediately apply to your own portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, idx) => {
                const Icon = iconMap[benefit.icon];
                return (
                  <div
                    key={idx}
                    className="text-center p-8 rounded-2xl bg-gradient-to-br from-[#1C2852]/5 to-[#C4B696]/10 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C00000] flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C2852] mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Review Banner */}
      <section className="py-16 bg-gradient-to-r from-[#C00000] to-[#A00000] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Gift className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bonus: 1-on-1 Portfolio Review
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Worth ₹5,000 • Get your actual holdings analyzed for these red
              flags
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Limited to first 50 registrants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>30-minute personalized session</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Detailed report included</span>
              </div>
            </div>
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-white text-[#C00000] hover:bg-gray-100 font-bold px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-all"
            >
              Claim My Portfolio Review
            </Button>
          </div>
        </div>
      </section>

      {/* Speaker Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-[#1C2852] text-white mb-4">
                YOUR INSTRUCTOR
              </Badge>
              <h2 className="text-4xl font-bold text-[#1C2852] mb-4">
                Meet Your Guide
              </h2>
            </div>

            <div className="bg-gradient-to-br from-[#1C2852]/5 to-[#C4B696]/10 rounded-3xl p-10 flex flex-col md:flex-row gap-10 items-center shadow-xl">
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#C00000] to-[#A00000] flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                  {webinarData.speaker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-[#1C2852] mb-2">
                  {webinarData.speaker.name}
                </h3>
                <p className="text-xl text-[#C00000] font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {webinarData.speaker.title}
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {webinarData.speaker.bio}
                </p>
                <p className="text-gray-600 italic">
                  {webinarData.speaker.credentials}
                </p>
                <div className="flex gap-6 mt-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C00000]">
                      {webinarData.stats.portfoliosReviewed}
                    </div>
                    <div className="text-gray-600">Portfolios Reviewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C00000]">
                      {webinarData.stats.redFlagsCaught}
                    </div>
                    <div className="text-gray-600">Red Flags Caught</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section
        id="registration-section"
        className="py-20 bg-gradient-to-b from-[#E6E6E6]/50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1C2852] mb-4">
                Secure Your Free Seat
              </h2>
              <p className="text-gray-600 text-lg">
                Join {webinarData.stats.attendees} investors who are taking
                control of their portfolios
              </p>
            </div>
            <WebinarRegistrationForm
              webinarSlug={WEBINAR_SLUG}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1C2852] mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="bg-gray-50 rounded-xl px-6 border-2 border-gray-200 hover:border-[#C00000]/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#1C2852] hover:text-[#C00000] transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1C2852] to-[#0f1629] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Don&apos;t Let Hidden Red Flags Destroy Your Wealth
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join us on{" "}
              <span className="font-bold text-[#C4B696]">
                {webinarData.date} at {webinarData.time}
              </span>{" "}
              and learn to protect your portfolio
            </p>
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-[#C00000] hover:bg-[#A00000] text-white font-bold px-12 py-7 text-xl rounded-xl shadow-2xl hover:shadow-[#C00000]/50 transition-all duration-300 hover:scale-105"
            >
              Yes, I Want to Protect My Portfolio
            </Button>
            <p className="mt-6 text-sm text-gray-400">
              <CheckCircle className="inline h-4 w-4 mr-1 text-green-400" />
              No Credit Card Required • Instant Access
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C2852] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <img
                src={LOGO_URL}
                alt="Bastion Research"
                className="h-16 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-[#C4B696] mb-2">
                Bastion Research
              </h3>
              <p className="text-gray-400">
                Protecting Retail Investors Through Education
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mb-6 text-sm">
              <div>
                <span className="text-gray-400">SEBI Registration:</span>
                <span className="ml-2 font-semibold text-white">
                  IHN000023199
                </span>
              </div>
              <div>
                <span className="text-gray-400">BSE Enlistment:</span>
                <span className="ml-2 font-semibold text-white">6747</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6 text-sm text-gray-400">
              <p className="mb-4">
                <strong className="text-white">SEBI Disclaimer:</strong> This
                webinar is for educational purposes only. Stock recommendations
                are not investment advice. Please consult a SEBI registered
                advisor before making investment decisions.
              </p>
              <p className="text-xs leading-relaxed mb-4">
                Research Analyst: Parth Agrawal | SEBI Registration No:
                IHN000023199 | BSE Enlistment No: 6747
              </p>
              <p className="mt-4">© 2026 Bastion Research. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioRedFlagsWebinar;

