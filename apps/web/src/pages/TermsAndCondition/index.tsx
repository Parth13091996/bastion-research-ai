import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const FooterTermAndCondition = () => {
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
    <div className="min-h-screen bg-white text-gray-800">
      <main className="max-w-7xl text-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-6">
          Terms And Conditions For Bastionresearch.In
        </h1>
        <p className="mb-6 ">Effective Date: 9th September 2025</p>

        <p className="mb-6">
          The Website Owner, including subsidiaries and affiliates ("Website" or
          "Website Owner" or "we" or "us" or "our") provides the information
          contained on the website or any of the pages comprising the website
          ("website") to visitors ("visitors") (cumulatively referred to as
          "you" or "your" hereinafter) subject to the terms and conditions set
          out in these website terms and conditions, the privacy policy and any
          other relevant terms and conditions, policies and notices which may be
          applicable to a specific section or module of the website.
        </p>

        <p className="mb-6">
          Welcome to our website. If you continue to browse and use this website
          you are agreeing to comply with and be bound by the following terms
          and conditions of use, which together with our{" "}
          <a
            href="/privacy-policy"
            className="text-red-600 underline"
          >
            privacy policy
          </a>{" "}
          govern BASTION RESEARCH's relationship with you in relation to this
          website.
        </p>

        <p className="mb-6">
          The term 'BASTION RESEARCH' or 'us' or 'we' refers to the owner of the
          website. The term 'you' refers to the user or viewer of our website.
        </p>

        <div className="mb-6">&nbsp;</div>

        <p className="font-semibold text-2xl text-gray-800 mb-4">
          The use of this website is subject to the following terms of use:
        </p>

        <p className="mb-6">
          The content of the pages of this website is for your general
          information and use only. It is subject to change without notice.
        </p>

        <p className="mb-6">
          Neither we nor any third parties provide any warranty or guarantee as
          to the accuracy, timeliness, performance, completeness or suitability
          of the information and materials found or offered on this website for
          any particular purpose. You acknowledge that such information and
          materials may contain inaccuracies or errors and we expressly exclude
          liability for any such inaccuracies or errors to the fullest extent
          permitted by law.
        </p>

        <p className="mb-6">
          Your use of any information or materials on this website is entirely
          at your own risk, for which we shall not be liable. It shall be your
          own responsibility to ensure that any products, services or
          information available through this website meet your specific
          requirements.
        </p>

        <p className="mb-6">
          This website contains material which is owned by or licensed to us.
          This material includes, but is not limited to, the design, layout,
          look, appearance and graphics. Reproduction is prohibited other than
          in accordance with the copyright notice, which forms part of these
          terms and conditions.
        </p>

        <p className="mb-6">
          All trademarks reproduced in this website which are not the property
          of, or licensed to, the operator are acknowledged on the website.
        </p>

        <p className="mb-6">
          Unauthorised use of this website may give rise to a claim for damages
          and/or be a criminal offense.
        </p>

        <p className="mb-6">
          From time to time this website may also include links to other
          websites. These links are provided for your convenience to provide
          further information.
        </p>

        <p className="mb-6">
          You may not create a link to this website from another website or
          document without BASTION RESEARCH's prior written consent.
        </p>

        <p className="mb-6">
          Your use of this website and any dispute arising out of such use of
          the website is subject to the laws of India or other regulatory
          authority.
        </p>

        <p className="mb-6">
          We as a merchant shall be under no liability whatsoever in respect of
          any loss or damage arising directly or indirectly out of the decline
          of authorization for any Transaction, on Account of the Cardholder
          having exceeded the preset limit mutually agreed by us with our
          acquiring bank from time to time.
        </p>

        <div className="mb-6">&nbsp;</div>
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

export default FooterTermAndCondition;