import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import {
  Search,
  MapPin,
  Clock,
  Home,
  Mail,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";

const SingleCareer = () => {
  const params = useParams();
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  // Simulate API call to fetch dynamic career data
  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        setLoading(true);
        // Replace this with your actual API endpoint
        // const response = await fetch(`/api/careers/${params.id}`);
        // const data = await response.json();

        // Simulated data - replace with actual API call
        const simulatedData = {
          id: params.id,
          title:
            "Freelance Python Developer - Quantitative Equity Research (Remote)",
          company: "Boston Quant",
          location: "Full-Time remote",
          type: "Full-time",
          postedDate: "2 days ago",
          description: `We're looking for a skilled Python Developer to work with our Boston Quant team on various quantitative equity research solutions focused on Indian markets.

If skill is your playground, and you enjoy building solutions with the dark and mysterious quant tools, this will be right up your alley.`,

          responsibilities: [
            "Build and maintain Python-based applications and create and maintain financial data pipelines",
            "Implement technical data tools, databases, and analytics",
            "Build metrics and tool libraries used to handover algorithmic tools effectively",
            "Work with various REST API calls to process data and perform back-office duties",
            "Collaborate closely with research groups and client-facing teams",
          ],

          requirements: [
            "Proficient in Python, particularly in NumPy, Pandas, and API communications",
            "Experience with data analysis, data cleaning, and handling large datasets",
            "Familiar with SQL, financial instruments and trading equity market data to a basic level",
            "Excellent communication skills and ability to work independently",
            "Strong problem-solving skills and attention to detail",
            "Bachelor's or Master's degree with relevant technical experience for 3+ years minimum",
          ],

          whatWeOffer: [
            "Best-in-class exposure to quant methodology across various markets",
            "Flexible work schedule, full-time, with self-direction",
            "A chance to integrate head-to-head with financial research and gain different expertise for equity markets",
          ],

          jobType: "Full-Time",
        };

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setCareerData(simulatedData);
      } catch (err) {
        setError("Failed to load career details");
        console.error("Error fetching career data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCareerData();
    }
  }, [params.id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual form submission API
      console.log("Form submitted:", formData);
      // await fetch('/api/applications', { method: 'POST', body: JSON.stringify(formData) });
      alert("Application submitted successfully!");

      // Reset form
      setFormData({
        name: "",
        mobile: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Career Details
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Career Not Found
          </h2>
          <p className="text-gray-600">
            The requested position could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <BackgroundShapes />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dynamic Content Section - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {careerData.title}
                  </h1>
                  <p className="text-lg text-blue-600 font-semibold">
                    {careerData.company}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {careerData.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {careerData.postedDate}
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  {careerData.type}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {careerData.description}
              </div>
            </div>

            {/* What You'll Do */}
            {careerData.responsibilities && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What You'll Do
                </h2>
                <ul className="space-y-3">
                  {careerData.responsibilities.map((responsibility, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What We're Looking For */}
            {careerData.requirements && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What We're Looking For
                </h2>
                <ul className="space-y-3">
                  {careerData.requirements.map((requirement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What We Offer */}
            {careerData.whatWeOffer && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What We Offer
                </h2>
                <ul className="space-y-3">
                  {careerData.whatWeOffer.map((offer, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{offer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-900">Job Type:</span>
                  <span className="ml-2 text-gray-700">
                    {careerData.jobType}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Location:</span>
                  <span className="ml-2 text-gray-700">
                    {careerData.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Static Application Form - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Apply For This Position
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Phone className="w-4 h-4 inline mr-1" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
                >
                  Submit Application
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-500 text-center">
                By clicking the submit button, you agree with the company's
                <a href="#" className="text-blue-600 hover:underline ml-1">
                  Terms & Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCareer;
