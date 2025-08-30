import React, { useState, useEffect, useMemo } from "react";
import { Search, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import BackgroundShapes from "./framer-motion.tsx";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const newsletter = [
  {
    id: 1,
    title: "Understanding GLP-1 and Market Knock-ons",
    date: "August 20, 2025",
    description: "Deep dive into GLP-1 impact on markets.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 2,
    title: "Hospitals: Capacity Ramp and ROCE Math",
    date: "August 15, 2025",
    description: "Analyzing hospital capacity expansions.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 3,
    title: "Q1 Results: Diagnostics Beat, AMC Mixed",
    date: "August 12, 2025",
    description: "Quarterly earnings update across diagnostics.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 4,
    title: "Scratch Pad: Near-Miss in Specialty Chem",
    date: "August 10, 2025",
    description: "Case study on specialty chemicals near-miss.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Scratch Pad",
  },
  {
    id: 5,
    title: "The Rise of AI in Drug Discovery",
    date: "August 25, 2025",
    description:
      "Exploring how artificial intelligence is accelerating the process of drug discovery and development.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 6,
    title: "Decoding the Latest Pharma M&A Trends",
    date: "August 22, 2025",
    description:
      "An in-depth analysis of recent mergers and acquisitions in the pharmaceutical sector.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 7,
    title: "A Deep Dive into Gene Editing Technologies",
    date: "August 18, 2025",
    description:
      "Understanding the potential and challenges of CRISPR and other gene-editing tools.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 8,
    title: "The Future of Personalized Medicine",
    date: "August 14, 2025",
    description:
      "How tailored treatments based on genetic information are revolutionizing healthcare.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Scratch Pad",
  },
  {
    id: 9,
    title: "Navigating Regulatory Hurdles in Biotech",
    date: "August 11, 2025",
    description:
      "A guide to the complex regulatory landscape for new biotechnology products.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 10,
    title: "Investment Opportunities in MedTech",
    date: "August 8, 2025",
    description:
      "Identifying promising areas for investment within the medical technology industry.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 11,
    title: "The Impact of Telemedicine on Healthcare Delivery",
    date: "August 5, 2025",
    description:
      "Assessing how virtual consultations are changing patient care.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 12,
    title: "Understanding the Vaccine Development Pipeline",
    date: "August 1, 2025",
    description:
      "From research to rollout: a comprehensive overview of how vaccines are made.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 13,
    title: "Breakthroughs in Cancer Immunotherapy",
    date: "July 29, 2025",
    description:
      "Highlighting the latest advancements in using the immune system to fight cancer.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Scratch Pad",
  },
  {
    id: 14,
    title: "The Economics of Rare Diseases",
    date: "July 25, 2025",
    description:
      "Examining the market dynamics and challenges for orphan drugs.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 15,
    title: "Ethical Considerations in Clinical Trials",
    date: "July 22, 2025",
    description:
      "A discussion on the moral and ethical dilemmas in human medical research.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 16,
    title: "The Role of Big Data in Public Health",
    date: "July 18, 2025",
    description:
      "How large datasets are being used to track diseases and improve public health outcomes.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 17,
    title: "Innovations in Surgical Robotics",
    date: "July 15, 2025",
    description: "Exploring the cutting-edge of robotic-assisted surgery.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Scratch Pad",
  },
  {
    id: 18,
    title: "The Challenge of Antibiotic Resistance",
    date: "July 11, 2025",
    description: "Addressing the growing threat of drug-resistant bacteria.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 19,
    title: "Mental Health Tech: A New Frontier",
    date: "July 8, 2025",
    description:
      "The startups and technologies aiming to revolutionize mental healthcare.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 20,
    title: "3D Bioprinting: The Future of Organ Transplants?",
    date: "July 4, 2025",
    description:
      "Investigating the potential of 3D printing to create human organs for transplantation.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 21,
    title: "Supply Chain Resilience in the Pharma Industry",
    date: "July 1, 2025",
    description:
      "Lessons learned from recent disruptions and strategies for a more robust supply chain.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Scratch Pad",
  },
  {
    id: 22,
    title: "The Business of Longevity",
    date: "June 27, 2025",
    description:
      "Exploring the companies and research focused on extending human lifespan.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
  {
    id: 23,
    title: "Patient Data Privacy in the Digital Age",
    date: "June 24, 2025",
    description:
      "The challenges of protecting sensitive health information in an interconnected world.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Learning of the Week",
  },
  {
    id: 24,
    title: "The Gig Economy in Healthcare",
    date: "June 20, 2025",
    description:
      "How freelance and temporary work is changing the healthcare workforce.",
    imageUrl: "../src/files/episode-9.webp",
    category: "Topical Update",
  },
];

const ITEMS_PER_PAGE = 12;

const NewsletterArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPodcasts = useMemo(() => {
    let filtered = newsletter;

    if (searchQuery) {
      filtered = filtered.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcast.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (podcast) => podcast.category === activeFilter
      );
    }

    return filtered;
  }, [searchQuery, activeFilter]);

  const totalPages = Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPodcasts = filteredPodcasts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (id) => {
    const link = `${window.location.origin}/podcast/${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  const filters = [
    { id: "all", label: "All", count: newsletter.length },
    {
      id: "Learning of the Week",
      label: "Learning of the Week",
      count: newsletter.filter((p) => p.category === "Learning of the Week")
        .length,
    },
    {
      id: "Topical Update",
      label: "Topical Update",
      count: newsletter.filter((p) => p.category === "Topical Update").length,
    },
    {
      id: "Scratch Pad",
      label: "Scratch Pad",
      count: newsletter.filter((p) => p.category === "Scratch Pad").length,
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: COLORS.gray }}
    >
      <BackgroundShapes />

      <div className="relative px-6 max-w-7xl z-10 mx-auto">
        {/* Header */}
        <div className=" pt-8 pb-4">
          <div className="w-full  sm:mx-auto">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: COLORS.blue }}
            >
              Bastion Newsletter
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Stay informed with Bastion Newsletter, your go-to source for the
              latest insights, trends, and updates in the world of business and
              technology
            </p>
          </div>
        </div>

        {/* Sticky Search and Filter Bar */}
        <div
          className={`transition-all  duration-300 ${
            isSticky
              ? "fixed top-[90px] w-[90%] left-1/2 -translate-x-1/2 backdrop-blur-md shadow-lg z-50 hidden sm:block rounded-full px-4 py-0 bg-white/60"
              : "relative"
          }`}
        >
          <div className=" py-4">
            <div className=" w-full mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 lg:max-w-xs relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search newsletter..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center px-2 gap-3 flex-wrap">
                  {filters.map((filter) => {
                    if (filter.id === "Scratch Pad") {
                      // 🔥 Special design but still acts as filter
                      return (
                        <button
                          key={filter.id}
                          onClick={() => handleFilterChange(filter.id)}
                          className="px-4 py-2 rounded-full text-sm font-medium text-yellow-900 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center gap-2"
                          style={{
                            background:
                              "linear-gradient(to right, #FACC15, #F59E0B)",
                            opacity: activeFilter === filter.id ? 1 : 0.85,
                          }}
                        >
                          <Crown className="h-4 w-4" />
                          {filter.label} ({filter.count})
                        </button>
                      );
                    }

                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform-gpu ${
                          activeFilter === filter.id
                            ? "text-white shadow-md scale-105 border border-red-500"
                            : "text-gray-700 bg-white border border-gray-300 hover:border-red-400 hover:bg-red-50"
                        }`}
                        style={{
                          backgroundColor:
                            activeFilter === filter.id
                              ? COLORS.red
                              : COLORS.white,
                        }}
                      >
                        {filter.label} ({filter.count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={` ${isSticky ? "mt-20" : ""}`}>
          <div className="max-w-7xl mx-auto py-8">
            {/* Podcast Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {currentPodcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={podcast.imageUrl}
                      alt={podcast.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Top (category + title + desc) */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        {podcast.category === "Scratch Pad" ? (
                          <div
                            className="px-3 py-1 rounded-full text-xs font-medium text-yellow-900 shadow-md inline-flex items-center gap-2"
                            style={{
                              background:
                                "linear-gradient(to right, #FACC15, #F59E0B)",
                            }}
                          >
                            <Crown className="h-4 w-4" />
                            {podcast.category}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* Beige dot */}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {podcast.category}
                            </span>
                          </div>
                        )}

                        {/* Date as plain text */}
                        <span className="text-sm text-gray-500">
                          {podcast.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg font-bold mb-2 leading-tight"
                        style={{ color: COLORS.blue }}
                      >
                        {podcast.title}
                      </h3>

                      {/* Description */}
                      {/* <p className="text-gray-600 mb-6 text-sm">
                        {podcast.description}
                      </p> */}
                    </div>

                    {/* Buttons pinned at bottom */}
                    <div className="flex gap-3 mt-auto">
                      <a
                        href={`/podcast/${podcast.id}`}
                        className="flex-1 bg-red-600 text-white text-center py-2 rounded-lg font-medium"
                      >
                        Read Now
                      </a>
                      <button
                        onClick={() => handleShare(podcast.id)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                      >
                        Share Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredPodcasts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎧</div>
                <h3
                  className="text-xl font-medium mb-2"
                  style={{ color: COLORS.blue }}
                >
                  No newsletter found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? "text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                      style={{
                        backgroundColor: isActive ? COLORS.red : COLORS.white,
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterArchive;
