import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const BastionPrivacyPolicy = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          Privacy Policy For Bastion{" "}
          <span className="text-red-500">C O R E</span>
        </h1>

        {/* Effective Date */}
        <p className="text-gray-600 mb-12 text-lg">
          Effective Date: 9th September 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
          <p>
            At <span className="font-semibold">Bastion C O R E</span>, we are
            committed to protecting the privacy and confidentiality of our
            users' personal information. This Privacy Policy outlines the types
            of data we collect, how we use, disclose, and protect it, and your
            rights regarding your personal information when using our equity
            research providing platform. You consent to the practices described
            in this policy by accessing or using our platform.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Information We Collect
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                1.1 Personal Information
              </h3>
              <p>
                We may collect personal information directly from you, such as
                your name, email address, contact details, and other information
                you provide when registering an account, subscribing to our
                services, or interacting with our platform.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                1.2 Financial Information
              </h3>
              <p>
                As we are an equity research platform, we don't collect
                financial information such as investment preferences, portfolio
                data, transaction history, etc.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                1.3 Log Data
              </h3>
              <p>
                Like many websites and platforms, we automatically collect
                technical information, such as your IP address, browser type,
                operating system, and device information. This data is used for
                analytics, platform maintenance, and service improvement.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Use of Information
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2.1 Providing Services
              </h3>
              <p>
                We do not use your personal or financial information to provide
                you with our equity research services. The research, which is
                uploaded on our platform, is only to gain an understanding of
                the businesses we cover. We don't provide buy/sell/hold
                recommendations and request users to conduct their own due
                diligence and consult their financial advisors if they need to
                before making an investment decision based on information
                provided by Bastion CORE.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2.2 Communication
              </h3>
              <p>
                We may use your contact information to send you important
                updates, newsletters, marketing materials, and promotional
                offers related to our services. You can opt out of marketing
                communications at any time by unsubscribing the same.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2.3 Analytics and Improvement
              </h3>
              <p>
                We may use aggregated and anonymized data for analytical
                purposes to improve our platform's functionality, user
                experience and develop new features.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2.4 Use of Cookies
              </h3>
              <p>
                A cookie is a small file which asks permission to be placed on
                your computer's hard drive. Once you agree, the file is added
                and the cookie helps analyses web traffic or lets you know when
                you visit a particular site. Cookies allow web applications to
                respond to you as an individual. The web application can tailor
                its operations to your needs, likes and dislikes by gathering
                and remembering information about your preferences.
              </p>
              <p className="mt-4">
                We use traffic log cookies to identify which pages are being
                used. This helps us analyses data about webpage traffic and
                improve our website in order to tailor it to customer needs. We
                only use this information for statistical analysis purposes and
                then the data is removed from the system.
              </p>
              <p className="mt-4">
                Overall, cookies help us provide you with a better website, by
                enabling us to monitor which pages you find useful and which you
                do not. A cookie in no way gives us access to your computer or
                any information about you, other than the data you choose to
                share with us.
              </p>
              <p className="mt-4">
                You can choose to accept or decline cookies. Most web browsers
                automatically accept cookies, but you can usually modify your
                browser setting to decline cookies if you prefer. This may
                prevent you from taking full advantage of the website.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3. Disclosure of Information
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                3.1 Third-Party Service Providers
              </h3>
              <p>
                We may share your information with trusted third-party service
                providers who assist us in delivering our services, such as data
                storage, analytics, customer support, and payment processing.
                These third-party providers are contractually obligated to
                handle your data securely and confidentially.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                3.2 Legal Requirements
              </h3>
              <p>
                We may disclose your information if required by law, regulation,
                legal process, or government request. Additionally, we may share
                your data to protect our rights, privacy, safety, or property,
                and those of our users or the public.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, disclosure, or
              alteration. However, no data transmission over the Internet or
              electronic storage method is 100% secure. While we strive to
              protect your data, we cannot guarantee its absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              5. Your Rights
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                5.1 Access and Correction
              </h3>
              <p>
                You can access, correct, or update your personal information
                through your account settings or by contacting us directly.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                5.2 Data Retention
              </h3>
              <p>
                We will retain your personal information only for as long as
                necessary to fulfill the purposes for which it was collected
                unless a longer retention period is required by law.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                5.3 Refund
              </h3>
              <p>
                A subscription, once purchased, can be canceled from your
                account settings but will not result in any refund of the
                subscription fees. Please refer to the{" "}
                <a href="/refund-policy" className="text-red-500 hover:underline">
                  Refund Policy
                </a>{" "}
                for more information
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              6. Changes to the Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy as and when required to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will notify you of any material changes
              through our platform or via your contact information.
            </p>
          </div>
        </div>
      </main>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default BastionPrivacyPolicy;