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
import axiosInstance from "@/api/axios";

const SingleCareer = () => {
  const params = useParams();
  const [careerData, setCareerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  // Fetch dynamic job by ID from backend
  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        setLoading(true);
        const id = params.slug as string;
        const res = await axiosInstance.get(`/api/jobs/${id}`);
        const data = res.data;
        setCareerData(data);
      } catch (err) {
        setError("Failed to load career details");
        console.error("Error fetching career data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchCareerData();
  }, [params.slug]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Replace with your actual form submission API
      const id = Number(params.slug);
      await axiosInstance.post('/api/applications', {
        job_id: id,
        applicant_name: formData.name,
        email: formData.email,
        phone: formData.mobile,
        cover_letter: formData.message,
      });
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {careerData.job_title}
                  </h1>
                  {careerData.team && (
                    <p className="text-lg text-blue-600 font-semibold">Team: {careerData.team}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {careerData.location || '—'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {careerData.experience || '—'}
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  {careerData.job_type || careerData.commitment || '—'}
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
            {careerData.responsibilities && careerData.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What You'll Do
                </h2>
                <ul className="space-y-3">
                  {careerData.responsibilities.map((responsibility: string, index: number) => (
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
            {careerData.requirements && careerData.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What We're Looking For
                </h2>
                <ul className="space-y-3">
                  {careerData.requirements.map((requirement: string, index: number) => (
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
            {(careerData.benefits || careerData.whatWeOffer) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What We Offer
                </h2>
                <ul className="space-y-3">
                  {(careerData.benefits || careerData.whatWeOffer).map((offer: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{offer}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Hands-on learning with real companies, not case studies.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Access to internal tools, processes, and frameworks built by practitioners.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Mentorship from a team that lives and breathes equity research.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      If you do well, we'll make room for you long-term — not just in the trainee seat.
                    </li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-8 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">💼 Job Type:</span> Full Time
                    </div>
                    <div>
                      <span className="font-medium">📍 Job Location:</span> Office
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Apply For This Position</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter *
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    required
                    rows={6}
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CV/Resume *
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Allowed Types: .pdf, .doc, .docx
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-600 mb-3">
                    📋 By using this form you agree with the storage and handling of your data by this website. *
                  </p>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-2 text-xs">
                      <div className="bg-gray-100 p-2 rounded text-gray-600">
                        I'm not a robot
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BastionJobPage;