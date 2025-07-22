import React, { useState } from 'react';
import { MapPin, Mail, Phone, Twitter, Linkedin, Instagram, Youtube, Rss } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userId: '',
    subject: 'Regarding Research Ally',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://bastionresearch.in/wp-content/uploads/2023/03/BASTION-RESEARCH-_-logo-min-e1680501100187-190x45.png"
                alt="Bastion Research"
                className="h-10"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors">Bastion CORE</a>
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors">Knowledge Center</a>
              <a href="#" className="text-gray-700 hover:text-red-600 flex items-center transition-colors">
                <span className="mr-1">👤</span> Login
              </a>
              <a href="#" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium">Contact Us</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Get In Touch Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Get In Touch</h1>

            {/* Social Icons */}
            <div className="flex justify-center space-x-4 mb-16">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Contact Information Cards */}
            <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-50 p-8 rounded-lg text-center min-w-72 flex-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Location</h3>
                <p className="text-gray-600">
                  Megh Sarman Complex, Citylight<br />
                  Road, Surat, India - 395007.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center min-w-72 flex-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
                <p className="text-gray-600">connect@bastionresearch.in</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center min-w-72 flex-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Phone</h3>
                <p className="text-gray-600">+91 8780507966</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Send Message Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
.
            <h2 className="text-3xl font-bold text-gray-800">Send Us A Message</h2>
            <p className="text-gray-600 mt-2">We would love to hear from you!</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="space-y-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />

                <input
                  type="text"
                  name="userId"
                  placeholder="User ID"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Regarding Research Ally">Regarding Research Ally</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                </select>

                <textarea
                  name="message"
                  placeholder="Message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                ></textarea>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="robot-check"
                    className="w-4 h-4 text-red-600"
                    required
                  />
                  <label htmlFor="robot-check" className="text-gray-600">I'm not a robot</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-md hover:bg-blue-800 transition-colors font-medium"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-96 lg:h-auto">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.924330631891!2d72.8001516!3d21.1942928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04db6b8b7b7f1%3A0x5b8f6b2c8d6f8e7f!2sCitylight%20Rd%2C%20Surat%2C%20Gujarat%20395007!5e0!3m2!1sen!2sin!4v1640000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bastion Research Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between gap-8">
            {/* Company Info */}
            <div className="flex-1 min-w-72">
              <h3 className="text-2xl font-bold mb-4">BASTION RESEARCH</h3>
              <p className="mb-4">Maximizing Your Research Quality Per Unit Of Stress</p>
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
                <li><a href="#" className="hover:text-red-200 transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Spotlight</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">QUANT</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Career</a></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="flex-1 min-w-48">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-200 transition-colors">Refund Policy</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Terms and conditions</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-red-200 transition-colors">Blog</a></li>
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
                <h5 className="font-semibold mb-2">Subscribe To Our Newsletter</h5>
                <button className="border border-white px-4 py-2 rounded hover:bg-white hover:text-red-600 transition-colors">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-8 border-t border-red-500 text-xs leading-relaxed">
            <p className="mb-4">
              Bastion CORE is an independent equity research platform providing unbiased equity research to its subscribers. We do not recommend investing in any company covered and published by us as a part of our research activity to our Bastion CORE. The subscriber is solely responsible for all investment and financial decisions he/she takes and is requested to conduct due diligence himself/herself or consult his/her financial advisor before taking any action. Please note that Bastion Research takes no responsibility for the financial impact created due to the decisions taken by the subscriber. If one is unwilling to accept the above-mentioned facts, we request them to not subscribe to Bastion CORE.
            </p>
            <p>
              Investment in Securities Market are subject to market risks. Read all related documents carefully before investing. The securities quoted are for illustration only and are not recommendatory. Registration granted by SEBI, membership of a SEBI recognised supervisory body (if any) and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-red-500 flex justify-between items-center text-sm">
            <p>Copyright © 2024 Bastion Research</p>
            <p>Powered by KB's Webstore</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
