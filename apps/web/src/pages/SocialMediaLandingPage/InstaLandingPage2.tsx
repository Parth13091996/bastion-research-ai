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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 text-white font-poppins animate-fadeIn">
            What Do You Get To Read?
          </h2>

          <div className="grid md:grid-cols-3 gap-16">
            {/* Macro Topics */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '0ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-green-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/macro-topics.png"
                  alt="Macro Topics"
                  className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-16">
            {/* Investing Concepts */}
            <div className="group animate-slideInUp relative" style={{ animationDelay: '0ms' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/20 blur-[40px] -z-10 rounded-full" />
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/media/investing-concepts.png"
                  alt="Investing Concepts"
                  className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-16 h-full items-stretch">

            {/* Left Column */}
            <div className="md:col-span-4 flex flex-col h-full relative z-10">
              {/* Title - Top Start */}
              <div className="mb-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-poppins">
                  Decode<br />
                  Booming<br />
                  sectors<br />
                  with us
                </h2>
              </div>

              {/* Button - Between */}
              <div className="my-12">
                <button className="bg-white hover:bg-gray-100 text-black px-12 py-4 rounded-full text-base md:text-lg font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
                  SUBSCRIBE NOW FOR FREE!!!
                </button>
              </div>

              {/* Graphic - Down End */}
              <div className="mt-auto w-full max-w-xs animate-slideInUp">
                <img
                  src="/media/table-discussion.png"
                  alt="Discussion"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Column - Container with 2 Placeholder Images */}
            <div className="md:col-span-8 relative flex items-center justify-center w-full">
              <div className="bg-white/20 rounded-[3rem] p-6 md:p-8 w-full h-auto flex items-center justify-center gap-6">
                {/* Image 1 */}
                <div className="flex-1 aspect-[3/4] overflow-hidden shadow-2xl bg-gray-800">
                  <img src="/media/booming-bess.png?v=2" alt="BESS Report" className="w-full h-full object-cover" />
                </div>
                {/* Image 2 */}
                <div className="flex-1 aspect-[3/4] overflow-hidden shadow-2xl bg-gray-800">
                  <img src="/media/booming-semi.png?v=2" alt="Semiconductors Report" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section >

      {/* Testimonials Section */}
      < section className="relative py-20 overflow-hidden" >
        {/* Background Image */}
        < div className="absolute inset-0 bg-[url('/media/testimonial-bg.png')] bg-cover bg-center" />
        {/* Red Overlay */}
        < div className="absolute inset-0 bg-gradient-to-br from-[#d84343] to-[#b91c1c] opacity-70" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left Column - Graphic Title */}
            <div className="md:col-span-4 text-left h-full flex flex-col justify-between animate-slideInLeft relative min-h-[400px]">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight font-poppins drop-shadow-lg">
                What <span className="inline-block translate-x-12">our</span><br />
                Readers<br />
                Say...
              </h2>
              <div className="relative w-64 md:w-72 ml-4 mb-0">
                <img src="/media/testimonial-graphic.png" alt="Testimonial Graphic" className="w-full h-auto object-contain drop-shadow-2xl" />
              </div>
            </div>

            {/* Right Column - Testimonial Cards */}
            <div className="md:col-span-8 flex flex-col gap-4 animate-slideInRight">

              {/* Card 1 */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-xl">
                <p className="text-blue-900 text-lg md:text-xl font-medium leading-relaxed mb-4 font-poppins">
                  "I have known Navid and the Bastion team for many years now, and they have been truly stupendous throughout. In a world filled with surface-level commentary, they are the ones I genuinely look up to for core, fundamental research."
                </p>
                <div>
                  <p className="text-black font-bold text-xl font-poppins tracking-wide">Krishna Appala,</p>
                  <p className="text-gray-800 font-semibold font-poppins">Fundmanager at Capital Mind PMS</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-xl">
                <p className="text-blue-900 text-lg md:text-xl font-medium leading-relaxed mb-4 font-poppins">
                  "Bastion Research has truly set a high benchmark in the field of equity research and market intelligence. Their deep-dive analyses, consistent accuracy, and forward-looking insights make them stand out in a crowded space."
                </p>
                <div>
                  <p className="text-black font-bold text-xl font-poppins tracking-wide">Siddharth Mandalaywala,</p>
                  <p className="text-gray-800 font-semibold font-poppins">Fundmanager at Concept Investwell PMS</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 shadow-xl">
                <p className="text-blue-900 text-lg md:text-xl font-medium leading-relaxed mb-4 font-poppins">
                  "Your research is very in-depth, and I typically prioritize reading it as soon as it is published. I appreciate your research, which was published at a very early stage when no one else had recognized its potential"
                </p>
                <div>
                  <p className="text-black font-bold text-xl font-poppins tracking-wide">Ashish Kumar Sahu,</p>
                  <p className="text-gray-800 font-semibold font-poppins">Subscriber, Bastion CORE</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section >

      {/* Contact Section */}
      < section id="contact" className="min-h-screen flex items-center py-20 bg-[#031818] relative overflow-hidden" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left Column - Text & Socials */}
            <div className="space-y-10 animate-slideInLeft text-left">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white tracking-wide font-poppins">
                Begin your<br />
                access to crisp<br />
                Investing<br />
                Insights
              </h2>

              <div>
                <button className="bg-white hover:bg-gray-100 text-black px-12 py-4 rounded-full text-base md:text-lg font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-lg font-poppins">
                  SUBSCRIBE NOW FOR FREE!!!
                </button>
              </div>

              <div className="space-y-6 pt-4">
                <h3 className="text-2xl font-bold text-[#D80000] font-poppins tracking-wide">CONNECT WITH US</h3>
                <div className="space-y-4">
                  <a href="#" className="flex items-center space-x-4 group">
                    <div className="bg-white p-2 rounded-full group-hover:bg-[#D80000] transition-colors duration-300">
                      <svg className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                    </div>
                    <span className="text-lg md:text-xl font-medium font-poppins group-hover:text-[#D80000] transition-colors">Twitter: @bastionresearch</span>
                  </a>
                  <a href="#" className="flex items-center space-x-4 group">
                    <div className="bg-white p-2 rounded-full group-hover:bg-[#D80000] transition-colors duration-300">
                      <svg className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M23 9.71a8.5 8.5 0 00-.91-4.13 2.92 2.92 0 00-1.72-1A78.36 78.36 0 0012 4.27a78.45 78.45 0 00-8.34.3 2.87 2.87 0 00-1.46.74c-.9.83-1 2.25-1.1 3.45a48.29 48.29 0 000 6.48 9.55 9.55 0 00.3 2.12 2.93 2.93 0 001.71 1.93A78.35 78.35 0 0012 19.73a78.45 78.45 0 008.34-.3 2.85 2.85 0 001.46-.74c.9-.83 1-2.25 1.1-3.45a48.29 48.29 0 000-6.48zM9.74 14.85V8.66l5.92 3.11z" /></svg>
                    </div>
                    <span className="text-lg md:text-xl font-medium font-poppins group-hover:text-[#D80000] transition-colors">YouTube: Bastion Research</span>
                  </a>
                  <a href="#" className="flex items-center space-x-4 group">
                    <div className="bg-white p-2 rounded-full group-hover:bg-[#D80000] transition-colors duration-300">
                      <svg className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </div>
                    <span className="text-lg md:text-xl font-medium font-poppins group-hover:text-[#D80000] transition-colors">Linkedin: Bastion Research</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Graphic in Structure */}
            <div className="relative animate-slideInRight flex justify-center items-center h-[500px]">
              <div className="relative w-full max-w-[600px] h-full flex items-center justify-center">

                {/* Shaped Photo */}
                <div className="relative z-10 w-[90%] aspect-[3/4] ml-10">
                  {/* Background Glow/Shadow */}
                  <div className="absolute top-[50%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-red-900/40 blur-[70px] rounded-full -z-10"></div>

                  {/* Shaped Photo */}
                  <img
                    src="/media/final-shaped-image-v3.png"
                    alt="Investing Insights"
                    className="w-full h-full object-contain filter drop-shadow-2xl relative z-10"
                  />
                </div>

                {/* Star Icon - Overlapping Left */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
                  <img
                    src="/media/final-star-icon.png"
                    alt="Star Icon"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain animate-spin-slow drop-shadow-2xl"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-black/40 backdrop-blur-sm py-8 border-t border-gray-700/30" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Bastion Research. All rights reserved.</p>
        </div>
      </footer >

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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>
    </div >
  );
};

export default BastionLanding;