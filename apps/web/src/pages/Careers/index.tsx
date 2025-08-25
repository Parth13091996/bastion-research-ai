import React, { useState } from "react";
import { Search, MapPin, Clock, Home } from "lucide-react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";

const jobs = [
  {
    id: 1,
    title: "Research Analyst Trainee",
    type: "Full Time",
    location: "Office",
    link: "/careers/research-analyst-trainee",
  },
  {
    id: 2,
    title: "Freelance Python Developer",
    type: "Part Time",
    location: "Work From Home",
    link: "/careers/freelance-python-developer",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    type: "Contract",
    location: "Hybrid",
    link: "/careers/ui-ux-designer",
  },
  {
    id: 4,
    title: "Frontend Developer",
    type: "Full Time",
    location: "Hybrid",
    link: "/careers/frontend-developer",
  },
  {
    id: 5,
    title: "Data Engineer Intern",
    type: "Part Time",
    location: "Office",
    link: "/careers/data-engineer-intern",
  },
];

const CareerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [jobLocation, setJobLocation] = useState("All");

  // Filtering Logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = jobType === "All" || job.type === jobType;
    const matchesLocation =
      jobLocation === "All" || job.location === jobLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="min-h-50vh bg-gray-50 p-8">
      <BackgroundShapes />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Job Type Filter */}
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent whitespace-nowrap"
            >
              <option value="All">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
            </select>

            {/* Location Filter */}
            <select
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent whitespace-nowrap"
            >
              <option value="All">All Locations</option>
              <option value="Office">Office</option>
              <option value="Work From Home">Work From Home</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-50%">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    {job.location === "Office" ? (
                      <MapPin className="w-4 h-4 mr-2" />
                    ) : (
                      <Home className="w-4 h-4 mr-2" />
                    )}
                    <span>{job.location}</span>
                  </div>
                </div>

                <button className="text-red-500 hover:text-red-600 font-medium">
                  <a href={job.link}> More Details →</a>
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-3">
              No jobs found matching your filters.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default CareerPage;
