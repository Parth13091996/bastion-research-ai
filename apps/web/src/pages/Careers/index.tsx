import React, { useMemo, useState } from "react";
import { Search, MapPin, Clock, Home } from "lucide-react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";

const CareerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [jobLocation, setJobLocation] = useState("All");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: () => axiosInstance.get(endpoints.jobs.base).then((r) => r.data),
  });

  // Filtering Logic
  const filteredJobs = useMemo(() => {
    if (!jobs) return [] as any[];
    return jobs.filter((job: any) => {
      const title = (job.job_title || "").toLowerCase();
      const type = (job.job_type || "").toLowerCase().replace(/[-\s]/g, "");
      const location = (job.location || "").toLowerCase();
      const selectedType = jobType.toLowerCase().replace(/[-\s]/g, "");
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesType = jobType === "All" || type === selectedType;
      const matchesLocation =
        jobLocation === "All" || location === jobLocation.toLowerCase();
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchQuery, jobType, jobLocation]);

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
          {isLoading ? (
            <p className="text-gray-500">Loading jobs...</p>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => (
              <div
                key={job.job_id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {job.job_title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{job.job_type || job.commitment || "—"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    {job.location?.toLowerCase() === "office" ? (
                      <MapPin className="w-4 h-4 mr-2" />
                    ) : (
                      <Home className="w-4 h-4 mr-2" />
                    )}
                    <span>{job.location || "—"}</span>
                  </div>
                </div>

                <button className="text-red-500 hover:text-red-600 font-medium">
                  <a href={`/careers/${job.job_id}`}> More Details →</a>
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
