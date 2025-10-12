import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const FooterRefundPolicy = () => {
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          Refund Policy For Bastion{" "}
          <span className="text-red-500">C O R E</span>
        </h1>

        {/* Effective Date */}
        <p className="text-gray-600 mb-12 text-lg">
          Effective Date: 1st August 2023
        </p>

        {/* Content */}
        <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
          <p>
            At <span className="font-semibold">Bastion C O R E</span>, we are
            dedicated to delivering high-quality equity research services to our
            valued subscribers. This Refund and Cancellation Policy outlines our
            approach to refunds and cancellations for our subscription-based
            services.
          </p>

          <p>
            <span className="font-semibold">Refund Policy</span> – We want to
            emphasize that all subscription payments made to{" "}
            <span className="font-semibold">C O R E</span> are non-refundable.
            Once payment is processed and the subscription period begins, we do
            not provide refunds for any reason, including but not limited to
            dissatisfaction with the content or any other circumstances. We
            recommend that you carefully review the details of our services
            before subscribing.
          </p>

          <div>
            <p className="mb-4">
              <span className="font-semibold">Cancellation Policy</span> – As a
              subscriber, you have the flexibility to manage your subscription
              through your account settings on our platform. You can cancel your
              subscription at any time by following these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Log in to your account.</li>
              <li>Navigate to the "Account" section.</li>
              <li>
                Locate your active subscription and select the "Cancel" or
                "Unsubscribe" option.
              </li>
            </ol>
          </div>

          <p className="font-medium">
            Please note the following regarding cancellations:
          </p>

          <div className="space-y-6">
            <p>
              <span className="font-semibold">Immediate Cancellation</span> –
              Upon cancellation, your subscription will remain active until the
              end of the current billing cycle. You will retain access to the
              subscribed content until that date.
            </p>

            <p>
              <span className="font-semibold">Access After Cancellation</span> –
              After the cancellation takes effect, you will lose access to the
              premium content and features associated with your subscription.
            </p>

            <p>
              <span className="font-semibold">No Partial Refunds</span> – We do
              not provide partial refunds for unused portions of the
              subscription period.
            </p>

            <p>
              <span className="font-semibold">Reactivation</span> – If you
              decide to reactivate your subscription later, you will need to
              subscribe again and make a new payment.
            </p>

            <p>
              <span className="font-semibold">Changes to this Policy</span> – We
              reserve the right to modify or amend this Refund and Cancellation
              Policy at any time, in our sole discretion. Any changes to this
              policy will be effective immediately upon posting on our platform.
              It is your responsibility to review this policy periodically for
              updates.
            </p>
          </div>
        </div>
      </main>
      {/* Scroll to Top Button */}
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

export default FooterRefundPolicy;