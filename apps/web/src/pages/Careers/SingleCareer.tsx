import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Clock, Home } from "lucide-react";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints.ts";
import { toast } from "sonner";

const SingleCareer = () => {
  const params = useParams();
  const [careerData, setCareerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null as File | null,
    agreeToTerms: false,
  });

  // Fetch dynamic job by ID from backend
  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const id = params.slug as string;
        const res = await axiosInstance.get(endpoints.jobs.byId(id));
        setCareerData(res.data);
      } catch (err) {
        setError("Failed to load career details");
        setCareerData(null);
        // Optionally log error
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchCareerData();
  }, [params.slug]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (target as HTMLInputElement).checked,
      }));
    } else if (type === "file") {
      const files = (target as HTMLInputElement).files;
      setFormData((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms.");
      return;
    }
    if (!formData.resume) {
      toast.error("Please upload your resume.");
      return;
    }
    try {
      const id = params.slug;
      const form = new FormData();
      form.append("job_id", id as string);
      form.append("applicant_name", formData.fullName);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("cover_letter", formData.coverLetter);
      form.append("resume", formData.resume);

      await axiosInstance.post(endpoints.applications.base, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
        resume: null,
        agreeToTerms: false,
      });
    } catch (err) {
      // Optionally log error
      toast.error("Failed to submit application. Please try again.");
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
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <p className="text-lg text-blue-600 font-semibold">
                    Team: {careerData.team}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {careerData.location || "—"}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {careerData.experience || "—"}
              </div>
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                {careerData.job_type || careerData.commitment || "—"}
              </div>
            </div>
          </div>

          {/* Job Description */}
          {careerData.description && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {careerData.description}
              </div>
            </div>
          )}

          {/* What You'll Do */}
          {Array.isArray(careerData.responsibilities) &&
            careerData.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What You'll Do
                </h2>
                <ul className="space-y-3">
                  {careerData.responsibilities.map(
                    (responsibility: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span dangerouslySetInnerHTML={{ __html: responsibility}}></span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* What We're Looking For */}
          {Array.isArray(careerData.requirements) &&
            careerData.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What We're Looking For
                </h2>
                <ul className="space-y-3">
                  {careerData.requirements.map(
                    (requirement: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{requirement}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* Good To Have */}
          {Array.isArray(careerData.good_to_have) &&
            careerData.good_to_have.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Good To Have
                </h2>
                <ul className="space-y-3">
                  {careerData.good_to_have.map(
                    (item: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* What We Offer */}
          {(Array.isArray(careerData.benefits) &&
            careerData.benefits.length > 0) ||
          (Array.isArray(careerData.whatWeOffer) &&
            careerData.whatWeOffer.length > 0) ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What We Offer
              </h2>
              <ul className="space-y-3">
                {(careerData.benefits || careerData.whatWeOffer || []).map(
                  (offer: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{offer}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-900">Job Type:</span>
                <span className="ml-2 text-gray-700">
                  {careerData.job_type || careerData.jobType || "—"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Commitment:</span>
                <span className="ml-2 text-gray-700">
                  {careerData.commitment || "—"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Experience:</span>
                <span className="ml-2 text-gray-700">
                  {careerData.experience || "—"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Team:</span>
                <span className="ml-2 text-gray-700">{careerData.team || "—"}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 md:col-span-2">
                <div className="flex items-center space-x-8 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">💼 Job Type:</span>{" "}
                    {careerData.job_type || careerData.jobType || "—"}
                  </div>
                  <div>
                    <span className="font-medium">📍 Job Location:</span>{" "}
                    {careerData.location || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Application Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Apply For This Position
            </h3>
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  📋 By using this form you agree with the storage and handling
                  of your data by this website. *
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCareer;
