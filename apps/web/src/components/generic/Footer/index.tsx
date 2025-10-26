import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SocialIcons from "./SocialIcons";
import { AppRoutes } from "@/routes/app-routes";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const CollapsibleSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:border-none md:pb-0 md:mb-0">
      <button
        className="flex justify-between items-center w-full text-lg font-semibold mb-mb-4 md:mb-4 md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span className="md:hidden">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform duration-300" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 md:max-h-[500px] md:opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | null

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMailchimpSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const formData = new FormData();
    formData.append("EMAIL", email);
    formData.append(
      "b_158dbb8b064fdd32c6ba69a49_359e20a2f7",
      "" // hidden field for spam bots
    );

    try {
      const response = await fetch(
        "https://bastionresearch.us18.list-manage.com/subscribe/post?u=158dbb8b064fdd32c6ba69a49&id=359e20a2f7&f_id=0081b2e6f0",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        }
      );

      // Mailchimp doesn't send CORS response, so assume success
      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Mailchimp error:", error);
      setStatus("error");
    }
  };

  return (
    <footer
      className="text-white py-16"
      style={{ backgroundColor: COLORS.red }}
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4">
          {/* Company Info */}
          <div className="flex-1 min-w-72 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center bg-white p-1 rounded-md shadow-md ring-1 ring-white/20">
                <img
                  src="/media/header-logo.webp"
                  alt="Bastion Research logo"
                  className="h-8 md:h-10 w-auto block"
                />
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p>SEBI Registered Research Analyst</p>
              <p>SEBI Registration No: INH000023199</p>
              <p>BASL Membership ID: 5922**</p>
            </div>
          </div>

          {/* Web Links */}
          <div className="flex-1 min-w-48">
            <CollapsibleSection title="Web Links">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    About us
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={AppRoutes.contact()}
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Contact
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Career
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </CollapsibleSection>
          </div>

          {/* Quick Links */}
          <div className="flex-1 min-w-48">
            <CollapsibleSection title="Quick Links">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/refund-policy"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Refund Policy
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Privacy Policy
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Terms and Conditions
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Compliance
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </CollapsibleSection>
          </div>

          {/* Let's Connect */}
          <div className="flex-1 min-w-64">
            <CollapsibleSection title="Let's Connect">
              <SocialIcons className="flex flex-col items-start gap-3 justify-center mb-4" />
              <div className="mt-6">
                <h5 className="font-semibold mb-2">
                  Subscribe To Our Newsletter
                </h5>
                <form
                  onSubmit={handleMailchimpSubmit}
                  className="validate flex w-full"
                >
                  <input
                    type="email"
                    name="EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="required email px-3 py-2 text-gray-800 rounded-l focus:outline-none w-full flex-1 min-w-0"
                    placeholder="Your email"
                    required
                  />
                  <input
                    type="submit"
                    value="Subscribe"
                    name="subscribe"
                    className="bg-white text-red-600 px-4 py-2 rounded-r hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
                  />
                </form>

                {status === "success" && (
                  <p
                    className="mt-2 text-sm bg-white px-2 py-1 rounded"
                    style={{ color: "green" }}
                  >
                    *Subscribed successfully!
                  </p>
                )}

                {status === "error" && (
                  <p
                    className="mt-2 text-sm bg-white px-2 py-1 rounded"
                    style={{ color: "red" }}
                  >
                    *Failed to deliver. Please try again.
                  </p>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-8 border-t border-red-500 text-xs leading-relaxed">
          <p className="mb-4">
            Bastion CORE is an independent equity research platform providing
            unbiased equity research to its subscribers. We do not recommend
            investing in any company covered and published by us as a part of
            our research activity to our Bastion CORE. The subscriber is solely
            responsible for all investment and financial decisions he/she takes
            and is requested to conduct due diligence himself/herself or consult
            his/her financial advisor before taking any action. Please note that
            Bastion Research takes no responsibility for the financial impact
            created due to the decisions taken by the subscriber. If one is
            unwilling to accept the above-mentioned facts, we request them to
            not subscribe to Bastion CORE.
          </p>
          <p>
            Investment in Securities Market are subject to market risks. Read
            all related documents carefully before investing. The securities
            quoted are for illustration only and are not recommendatory.
            Registration granted by SEBI, membership of a SEBI recognised
            supervisory body (if any) and certification from NISM in no way
            guarantee performance of the intermediary or provide any assurance
            of returns to investors.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-red-500 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>Copyright © {new Date().getFullYear()} Bastion Research</p>
          <p>
            Powered by{" "}
            <Link
              to="https://vite.dev/"
              className="text-red-200 hover:text-red-300 transition-colors"
              aria-label="Visit Vite website"
            >
              Vite
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
