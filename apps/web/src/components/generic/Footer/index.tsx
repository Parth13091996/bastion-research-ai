import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link
import { useState, useEffect } from "react";
import SocialIcons from "./SocialIcons";

const CollapsibleSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className=" md:border-none md:pb-0 md:mb-0">
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
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="bg-primary text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-wrap justify-between gap-4">
          {/* Company Info - Always visible */}
          <div className="flex-1 min-w-72 mb-4">
            <h3 className="text-2xl font-bold mb-4">BASTION RESEARCH</h3>
            <p className="mb-4">
              Maximizing Your Research Quality Per Unit Of Stress
            </p>
            <div className="space-y-1 text-sm">
              <p>SEBI Registered Research Analyst</p>
              <p>SEBI Registration No: INH000013712</p>
              <p>BASL Membership ID: 5922</p>
            </div>
          </div>

          {/* Web Links */}
          <div className="flex-1 min-w-48">
            <CollapsibleSection title="Web Links">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="relative group hover:text-red-200 transition-colors inline-block" // Added for each link
                  >
                    About us
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/spotlights"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Spotlight
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/spotlights"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    QUANT
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Contact
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-red-200 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/career-page"
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
                    to="/privacy-policy" // Updated path to match Header component
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
                    Terms and conditions
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
                <li>
                  <Link
                    to="/blog"
                    className="relative group hover:text-red-200 transition-colors inline-block"
                  >
                    Blog
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
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-3 py-2 text-gray-800 rounded-l focus:outline-none w-full flex-1 min-w-0"
                    aria-label="Email for newsletter subscription"
                  />
                  <button className="bg-white text-red-600 px-4 py-2 rounded-r hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
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
            Powered by {"\n"}
            <Link
              to="https://vite.dev/"
              className="text-red-200 hover:text-red-300 transition-colors"
              aria-label="Visit Bastion Research homepage"
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
