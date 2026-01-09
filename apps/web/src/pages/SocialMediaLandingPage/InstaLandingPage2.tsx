import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Calendar, Clock, TrendingUp, Building2, FileText, Lightbulb, Factory, BarChart3 } from 'lucide-react';

const BastionLanding = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a2e2a] text-white overflow-x-hidden">


      {/* Hero Section - Home */}
      {/* Hero Section - Home */}
      <section id="home" className="min-h-screen flex items-center justify-center relative bg-[#031818]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(220, 38, 38, 0.2), transparent 50%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center relative z-10 w-full">
          <div className="space-y-8 animate-slideInLeft text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white tracking-wide">
              Institutional Grade<br />
              Investing Insights<br />
              for Decision<br />
              Makers
            </h1>
            <div>
              <button className="bg-[#D80000] hover:bg-red-700 px-8 md:px-12 py-4 rounded-full text-base md:text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-600">
                SUBSCRIBE NOW FOR FREE!!!
              </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end relative animate-slideInRight mt-12 md:mt-0">
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
              {/* White Glow Effect */}
              <div className="absolute inset-0 bg-white opacity-20 blur-[80px] rounded-full" />

              {/* Logo */}
              <img
                src="/media/Bastion-Logo.png"
                alt="Bastion Research Logo"
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
              />

              {/* Message Icon */}
              <div className="absolute top-0 right-0 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-[#1e1b4b] p-4 rounded-lg transform rotate-[-15deg] shadow-xl border border-blue-900/50">
                  <div className="bg-white w-12 h-8 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 border-2 border-gray-200" />
                    <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[16px] border-t-blue-100 absolute top-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown size={40} className="text-gray-400 opacity-50" />
        </div>
      </section>

      {/* Newsletter Section - Section 2 */}
      <section id="about-us" className="min-h-screen flex items-center py-20 bg-[#D80000] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* Left Column - Girl Image */}
            <div className="flex justify-center md:justify-start pt-10 md:pt-0 animate-slideInLeft order-2 md:order-1 relative">
              <img
                src="/media/newsletter-girl.png"
                alt="Girl writing newsletter"
                className="w-full max-w-[400px] md:max-w-[450px] object-contain drop-shadow-2xl"
              />
            </div>

            {/* Right Column - Text & CTA */}
            <div className="text-center md:text-left space-y-8 animate-slideInRight order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Receive Insight<br />
                Packed Newsletters<br />
                from us every week
              </h2>

              <div className="flex justify-center md:justify-start">
                <button className="bg-white hover:bg-gray-100 text-black px-8 md:px-12 py-4 rounded-full text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg">
                  SUBSCRIBE NOW FOR FREE!!!
                </button>
              </div>

              {/* Decorative Icons (Lightbulb/Chat) */}
              <div className="absolute right-0 bottom-0 md:relative md:flex md:justify-end md:-mt-20 pointer-events-none">
                <img
                  src="/media/newsletter-icons.png"
                  alt="Ideas and communication"
                  className="w-32 md:w-48 h-auto object-contain animate-bounce"
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section - Section 3 */}
      <section id="schedule" className="min-h-screen flex items-center py-20 bg-[#00140F]">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
            .font-poppins {
              font-family: 'Poppins', sans-serif;
            }
          `}
        </style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left Column - Schedule Card */}
            <div className="animate-slideInLeft">
              <div className="bg-[#6B7C76] rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="space-y-12">
                  {/* Wednesday */}
                  <div className="flex items-start space-x-6">
                    <div className="relative flex-shrink-0">
                      <Calendar className="text-white h-20 w-20 stroke-1" />
                      <Clock className="text-white h-10 w-10 absolute -bottom-2 -right-2 fill-transparent stroke-1" />
                    </div>
                    <div>
                      <h3 className="text-4xl md:text-5xl font-bold text-[#1a1b41] mb-2 tracking-tight font-poppins">Wednesday</h3>
                      <p className="text-white text-lg md:text-xl font-medium leading-tight font-poppins">
                        Topical updates covering ongoing market trends, interesting IPOs and current topics
                      </p>
                    </div>
                  </div>

                  {/* Saturday */}
                  <div className="flex items-start space-x-6">
                    <div className="relative flex-shrink-0">
                      <Calendar className="text-white h-20 w-20 stroke-1" />
                      <Clock className="text-white h-10 w-10 absolute -bottom-2 -right-2 fill-transparent stroke-1" />
                    </div>
                    <div>
                      <h3 className="text-4xl md:text-5xl font-bold text-[#1a1b41] mb-2 tracking-tight font-poppins">Saturday</h3>
                      <p className="text-white text-lg md:text-xl font-medium leading-tight font-poppins">
                        Learning of the Week covering Timless Investing Lessons and Building Blocks
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-4">
                    <button className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg w-full md:w-auto font-poppins">
                      SUBSCRIBE NOW FOR FREE!!!
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Graphic */}
            <div className="flex justify-center items-center animate-slideInRight">
              <img
                src="/media/schedule-graphic.png"
                alt="Schedule Graphic"
                className="w-full max-w-[600px] h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section - Section 4 */}
      <section id="content-types" className="min-h-screen flex items-center py-20 bg-[#031818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 text-white font-poppins animate-fadeIn">
            What Do You Get To Read?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Macro Topics */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '0ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-green-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/macro-topics.png"
                  alt="Macro Topics"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-[#D80000] p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Macro Topics</h3>
                <p className="text-white text-base font-poppins">
                  Decoding the global shifts impacting your wallet.
                </p>
              </div>
            </div>

            {/* Company Developments */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-green-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/company-developments.png"
                  alt="Company Developments"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-[#D80000] p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Company<br />Developments</h3>
                <p className="text-white text-base font-poppins">
                  Inside the boardroom: What's changing at top firms.
                </p>
              </div>
            </div>

            {/* IPO Analysis */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '400ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-green-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/ipo-analysis.png"
                  alt="IPO Analysis"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-[#D80000] p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">IPO Analysis</h3>
                <p className="text-white text-base font-poppins">
                  IPO Watch: Who's ready to launch (and who to avoid).
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button className="bg-white hover:bg-gray-100 text-black px-8 md:px-12 py-4 rounded-full text-base md:text-xl font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
              JOIN THOUSANDS READING IT FOR FREE!!!
            </button>
          </div>
        </div>
      </section>

      {/* Investing Concepts Section - Section 5 */}
      <section id="investing-concepts" className="min-h-screen flex items-center py-20 bg-[#D80000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Investing Concepts */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '0ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/investing-concepts.png"
                  alt="Investing Concepts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-black p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Investing<br />Concepts</h3>
                <p className="text-white text-base font-poppins">
                  Back to basics: The mental models of smart investing.
                </p>
              </div>
            </div>

            {/* Plant Visits Insights */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/plant-visits.png"
                  alt="Plant Visits Insights"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-black p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Plant Visits<br />Insights</h3>
                <p className="text-white text-base font-poppins">
                  From the source: Real-time reports from our site visits.
                </p>
              </div>
            </div>

            {/* Business Dynamics */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '400ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/business-dynamics.png"
                  alt="Business Dynamics"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-black p-8 text-center h-48 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Business<br />Dynamics</h3>
                <p className="text-white text-base font-poppins">
                  How great businesses actually make money.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button className="bg-white hover:bg-gray-100 text-black px-8 md:px-12 py-4 rounded-full text-base md:text-xl font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
              JOIN THOUSANDS READING IT FOR FREE!!!
            </button>
          </div>
        </div>
      </section>

      {/* Booming Sectors Section - Section 6 */}
      <section id="booming-sectors" className="min-h-screen border-b border-white/10 flex items-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: "url('/media/booming-sectors-bg.png')" }}>
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 h-full items-center">

            {/* Left Column */}
            <div className="flex flex-col justify-between h-full relative z-10 space-y-12">
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight font-poppins">
                  Decode<br />
                  Booming<br />
                  sectors<br />
                  with us
                </h2>
                <button className="bg-white hover:bg-gray-100 text-black px-12 py-4 rounded-full text-base md:text-lg font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
                  SUBSCRIBE NOW FOR FREE!!!
                </button>
              </div>

              <div className="w-full max-w-md animate-slideInUp">
                <img
                  src="/media/table-discussion.png"
                  alt="Discussion"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="relative flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 w-full relative z-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-5xl mx-auto items-center justify-items-center">

                  {/* BESS Card */}
                  <div className="bg-[#2a2a2a] p-8 rounded-sm shadow-2xl w-full max-w-sm aspect-[3/4.2] flex flex-col items-center text-center border border-gray-700 relative overflow-hidden group">
                    {/* Card Reflection/Texture Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                    <img src="/media/Bastion-Logo.png" alt="Bastion Logo" className="h-10 mb-6 object-contain" />
                    <div className="w-full">
                      <h3 className="text-[#FFD700] text-5xl font-serif font-bold tracking-wide leading-none drop-shadow-lg">BESS</h3>
                      <div className="border-t border-gray-600 w-24 mx-auto my-3"></div>
                      <p className="text-white text-xs font-bold tracking-[0.2em] uppercase">BACKING UP THE RENEWABLES</p>
                    </div>
                    <div className="flex-1 w-full flex items-center justify-center my-4 relative">
                      <div className="absolute inset-0 bg-black/20 z-0"></div>
                      <img src="/media/bess-container-graphic.png" alt="BESS Container" className="w-full h-auto object-contain relative z-10 drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="mt-auto pb-2 w-full">
                      <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider leading-tight px-4 border-t border-gray-600 pt-4 mx-2">
                        THE MISSING LINK IN THE<br />CLEAN ENERGY EQUATION
                      </p>
                    </div>
                  </div>

                  {/* Semiconductors Card */}
                  <div className="bg-[#002b5c] p-8 rounded-sm shadow-2xl w-full max-w-sm aspect-[3/4.2] flex flex-col items-center text-center border border-blue-900 relative overflow-hidden group">
                    {/* Card Blue Glow Overlay */}
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />

                    <img src="/media/Bastion-Logo.png" alt="Bastion Logo" className="h-10 mb-6 object-contain brightness-200 contrast-200 filter invert" />
                    <div className="w-full">
                      <h3 className="text-[#FFD700] text-4xl font-black font-sans tracking-tight uppercase transform scale-y-110 drop-shadow-lg">SEMICONDUCTORS</h3>
                      <div className="border-t border-blue-400/50 w-24 mx-auto my-3"></div>
                      <p className="text-white text-xs font-bold tracking-[0.2em] uppercase">INSIDE THE NANO WORLD</p>
                    </div>
                    <div className="flex-1 w-full flex items-center justify-center my-4">
                      <img src="/media/microchip-graphic.png" alt="Microchip" className="w-3/4 h-auto object-contain drop-shadow-[0_0_20px_rgba(60,180,255,0.6)] transform hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="mt-auto pb-2 w-full">
                      <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider leading-tight px-2 border-t border-blue-400/50 pt-4 mx-2">
                        THE UNSEEN HEARTBEAT<br />BEHIND TODAY'S DIGITAL<br />WORLD
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center py-20 bg-gradient-to-b from-red-900 to-[#0a2e2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slideInLeft">
              <h2 className="text-5xl font-bold leading-tight">
                Begin your<br />
                access to crisp<br />
                Investing<br />
                Insights
              </h2>
              <button className="bg-white text-gray-900 px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                SUBSCRIBE NOW FOR FREE!!!
              </button>
              <div className="space-y-4 pt-8">
                <h3 className="text-2xl font-bold text-red-400">CONNECT WITH US</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-4 hover:text-red-400 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                    <span className="text-lg">Twitter: @bastionresearch</span>
                  </a>
                  <a href="#" className="flex items-center space-x-4 hover:text-red-400 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M23 9.71a8.5 8.5 0 00-.91-4.13 2.92 2.92 0 00-1.72-1A78.36 78.36 0 0012 4.27a78.45 78.45 0 00-8.34.3 2.87 2.87 0 00-1.46.74c-.9.83-1 2.25-1.1 3.45a48.29 48.29 0 000 6.48 9.55 9.55 0 00.3 2.12 2.93 2.93 0 001.71 1.93A78.35 78.35 0 0012 19.73a78.45 78.45 0 008.34-.3 2.85 2.85 0 001.46-.74c.9-.83 1-2.25 1.1-3.45a48.29 48.29 0 000-6.48zM9.74 14.85V8.66l5.92 3.11z" /></svg>
                    <span className="text-lg">YouTube: Bastion Research</span>
                  </a>
                  <a href="#" className="flex items-center space-x-4 hover:text-red-400 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    <span className="text-lg">LinkedIn: Bastion Research</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="relative animate-slideInRight">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 blur-3xl opacity-30" />
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400'%3E%3Crect fill='%23fff' width='500' height='400' opacity='0.1'/%3E%3Cpath d='M150 200 L250 180 L350 200 L450 150' stroke='%2310b981' stroke-width='4' fill='none' opacity='0.6'/%3E%3Cpath d='M150 220 L250 240 L350 220 L450 180' stroke='%2306b6d4' stroke-width='4' fill='none' opacity='0.6'/%3E%3Ccircle cx='250' cy='200' r='80' fill='%23fff' opacity='0.2'/%3E%3Cpath d='M200 200 L230 170 L270 210 L300 180' stroke='%23ef4444' stroke-width='6' fill='none'/%3E%3C/svg%3E"
                alt="Analytics"
                className="relative rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>


        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm py-8 border-t border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Bastion Research. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 1s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 1s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BastionLanding;