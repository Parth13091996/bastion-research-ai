import React, { useState } from "react";
import { MapPin, Mail, Phone, Twitter, Linkedin, Youtube } from "lucide-react";
import Header from "@/components/generic/Header";
import Footer from "@/components/generic/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userId: "",
    subject: "Regarding Research Ally",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Get In Touch Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">
              Get In Touch
            </h1>

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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Our Location
                </h3>
                <p className="text-gray-600">
                  Megh Sarman Complex, Citylight
                  <br />
                  Road, Surat, India - 395007.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center min-w-72 flex-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600">connect@bastionresearch.in</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center min-w-72 flex-1">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Phone
                </h3>
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
            <h2 className="text-3xl font-bold text-gray-800">
              Send Us A Message
            </h2>
            <p className="text-gray-600 mt-2">
              We would love to hear from you!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
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
                  <option value="Regarding Research Ally">
                    Regarding Research Ally
                  </option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                </select>

                <textarea
                  name="message"
                  placeholder="Message"
                  rows={6}
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
                  <label htmlFor="robot-check" className="text-gray-600">
                    I'm not a robot
                  </label>
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
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bastion Research Location"
                ></iframe>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
