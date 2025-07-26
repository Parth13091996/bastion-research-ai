
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Rss,
} from "lucide-react";

const Footer = () => {
  return (

    <footer className="bg-red-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-8">
          {/* Company Info */}
          <div className="flex-1 min-w-72">
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
            <h4 className="text-lg font-semibold mb-4">Web Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Spotlight
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  QUANT
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Career
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex-1 min-w-48">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="/footer-privacy-policy" className="hover:text-red-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Terms and conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Compliance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Let's Connect */}
          <div className="flex-1 min-w-64">
            <h4 className="text-lg font-semibold mb-4">Let's Connect</h4>
            <p className="mb-4">connect@bastionresearch.in</p>

            {/* Social Icons */}
            <div className="flex space-x-3 mb-6">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all">
                <Youtube className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center hover:bg-opacity-30 cursor-pointer transition-all">
                <Rss className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h5 className="font-semibold mb-2">
                Subscribe To Our Newsletter
              </h5>
              <button className="border border-white px-4 py-2 rounded hover:bg-white hover:text-red-600 transition-colors">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-red-500 text-xs leading-relaxed">
          <p className="mb-4">
            Bastion CORE is an independent equity research platform providing
            unbiased equity research to its subscribers. We do not recommend
            investing in any company covered and published by us as a part of
            our research activity to our Bastion CORE. The subscriber is
            solely responsible for all investment and financial decisions
            he/she takes and is requested to conduct due diligence
            himself/herself or consult his/her financial advisor before taking
            any action. Please note that Bastion Research takes no
            responsibility for the financial impact created due to the
            decisions taken by the subscriber. If one is unwilling to accept
            the above-mentioned facts, we request them to not subscribe to
            Bastion CORE.
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
        <div className="mt-8 pt-8 border-t border-red-500 flex justify-between items-center text-sm">
          <p>Copyright © 2024 Bastion Research</p>
          <p>Developed by D.N.M. Squad ( DeNiMi Labs) </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
