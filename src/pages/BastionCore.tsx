import React, { useState, useEffect } from "react";
import Header from "../components/generic/Header";
import Footer from "../components/generic/Footer";
import KeyFeatures from "@/components/generic/KeyFeatures";
import PricingComponent from "@/components/generic/PricingComponent";
import SmartFrameworks from "@/components/generic/SmartFrameworks";

const useTypingEffect = (text, speed = 150) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return displayedText;
};

const BastionCore = () => {
  const typingText1 = "Comprehensive Objective Research Edge";
  const typingText2 = "Your solution to streamlined idea screening";

  const typed1 = useTypingEffect(typingText1, 100);
  const typed2 = useTypingEffect(typingText2, 100);

  return (
    <>

      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl font-extrabold mb-4">
                Bastion <span className="text-red-600">CORE</span>
              </h1>
              <h2 className="text-xl font-semibold mb-6 cursor-text border-r-2 border-red-600 pr-2 whitespace-nowrap overflow-x-hidden max-w-full">
                {typed1}
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Research constitutes the FUNDAMENTAL component of an Investor’s
                investing endeavors our unwavering commitment with Bastion CORE
                lies in providing objective research while ensuring its
                accessibility to investors, irrespective of the size of their
                capital.
              </p>
              <p className="text-gray-900 font-semibold mb-4">
                Bastion CORE Comprise the following for DIY (Do-it-Yourself)
                Investors
              </p>
              <p className="font-bold mb-6">
                Bastion Business SPOTLIGHT | Bastion QUANT
              </p>
              <div className="flex gap-4">
                <button className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 transition">
                  Explore Business Spotlight
                </button>
                <button className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 transition">
                  Explore QUANT
                </button>
              </div>
            </div>
            <div className="md:w-1/2 bg-blue-900 rounded-lg p-8 shadow-lg text-white flex flex-col items-center justify-center text-center max-w-md overflow-visible mx-auto h-72">
              <img
                src="../src/files/bastion-core-1st.webp"
                alt="Peter Lynch"
                className="w-32 h-32 rounded-full mb-4 mx-auto object-contain"
              />
              <p className="text-center font-semibold text-lg">
                Know what you own and know why you own it
              </p>
              <p className="font-bold mt-2">Peter Lynch</p>
            </div>
          </div>

          {/* Key Features Section */}
          <section className="mt-16">
            <h3 className="text-3xl font-bold mb-8">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <KeyFeatures />
            </div>
          </section>

          {/* Smart framework section */}


          <SmartFrameworks/>
          {/* <section className="mt-16">
            <h3 className="text-3xl font-bold mb-8">SMART Framework</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { letter: "S", title: "Strong Business", desc: "Avoiding businesses exhibiting signs of weakness" },
                { letter: "M", title: "Strong Management", desc: "Not partnering with managements unwilling to share upside" },
                { letter: "A", title: "Clean Accounts", desc: "Making sure the numbers reported are reliable to form decisions" },
                { letter: "R", title: "Reasonable Valuations", desc: "Not buying anything at any price" },
                { letter: "T", title: "Business Tailwinds", desc: "Steer clear of businesses belonging to a dying or stagnant industry" },
              ].map(({ letter, title, desc }, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 w-36 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                  <div className="text-3xl font-bold text-red-700 mb-2">{letter}</div>
                  <div className="font-semibold mb-1">{title}</div>
                  <div className="text-sm text-gray-700">{desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-xl font-semibold cursor-text border-r-2 border-red-600 pr-2 whitespace-nowrap overflow-x-hidden max-w-full">
              {typed2}
            </div>
          </section> */}

          {/* Pricing Section */}
          <PricingComponent />

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto mb-16">
            <h3 className="text-3xl font-bold mb-8">FAQs</h3>
            <div className="space-y-4">
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  How do I subscribe & What are the subscription charges?
                </summary>
                <p className="mt-2">
                  To subscribe to our service, kindly follow this{" "}
                  <a
                    href="https://bastionresearch.in/subscribe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline"
                  >
                    link
                  </a>{" "}
                  and steps thereafter. We will get you started in no time.
                </p>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  Can I get refund after I subscribe?
                </summary>
                <p className="mt-2">
                  We do not offer refunds, but if you need help navigating with our
                  portal, you can reach out to us{" "}
                  <a
                    href="https://bastionresearch.in/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline"
                  >
                    here
                  </a>
                  , we will be happy to help.
                </p>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  Is the service sector agnostic?
                </summary>
                <p className="mt-2">Yes.</p>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  For whom is this service suitable?
                </summary>
                <p className="mt-2">Do -It-Yourself diligent investors.</p>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  For whom is this service not suitable?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    If you want only buy/sell recommendations, which you can simply
                    execute
                  </li>
                  <li>
                    Do not have the inclination to read detailed reports to
                    understand the potential and risk of a business
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  Do you provide free trails?
                </summary>
                <p className="mt-2">
                  We have kept few sample reports outside our paywall ({" "}
                  <a
                    href="https://bastionresearch.in/explore-research"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline"
                  >
                    Explore Research
                  </a>{" "}
                  ). You can refer them to understand the quality of our work.
                </p>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>
              <details className="border border-gray-300 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">
                  What is not provided as part of the service?
                </summary>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    We do not provide, BUY/SELL recommendations or model portfolio
                    service
                  </li>
                  <li>
                    We do not provide guarantee of the performance as part of the
                    service. Kindly do your due diligence while investing in the
                    ideas under our coverage
                  </li>
                </ul>
              </details>

            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default BastionCore;
