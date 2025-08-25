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

const podcasts = [
  {
    id: 9,
    title:
      "CCL Products Ltd. | Made In India | Episode #9 | Ft. Nitya Shah, Co-Founder KamayaKya Wealth Management",
    date: "June 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-red-700",
    category: "important",
  },
  {
    id: 8,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
    category: "business",
  },
  {
    id: 7,
    title:
      "Tech Innovation Stories | Made In India | Episode #7 | Ft. Sarah Tech, CTO InnovateTech",
    date: "March 15, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-blue-600",
    category: "important",
  },
  {
    id: 6,
    title:
      "Manufacturing Excellence | Made In India | Episode #6 | Ft. Rajesh Manufacturing Ltd.",
    date: "March 1, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-green-600",
    category: "business",
  },
  {
    id: 5,
    title:
      "Startup Success Stories | Made In India | Episode #5 | Ft. Mumbai Startups Collective",
    date: "February 20, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-purple-600",
    category: "important",
  },
  {
    id: 4,
    title:
      "Digital Transformation | Made In India | Episode #4 | Ft. Digital India Initiative",
    date: "February 10, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-indigo-600",
    category: "business",
  },
  {
    id: 3,
    title:
      "Sustainable Business Models | Made In India | Episode #3 | Ft. GreenTech Solutions",
    date: "January 25, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-emerald-600",
    category: "important",
  },
  {
    id: 2,
    title:
      "Financial Services Revolution | Made In India | Episode #2 | Ft. FinTech Leaders",
    date: "January 15, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-orange-600",
    category: "business",
  },
  {
    id: 1,
    title:
      "E-commerce Growth Stories | Made In India | Episode #1 | Ft. Online Retail Pioneers",
    date: "January 5, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-teal-600",
    category: "important",
  },
  {
    id: 10,
    title:
      "Healthcare Innovation | Made In India | Episode #10 | Ft. MedTech Innovators",
    date: "June 20, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-pink-600",
    category: "business",
  },
  {
    id: 11,
    title:
      "Educational Technology | Made In India | Episode #11 | Ft. EdTech Revolution",
    date: "July 1, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-cyan-600",
    category: "important",
  },
  {
    id: 12,
    title:
      "Agriculture Technology | Made In India | Episode #12 | Ft. AgriTech Solutions",
    date: "July 15, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-lime-600",
    category: "business",
  },
  {
    id: 13,
    title:
      "Space Technology | Made In India | Episode #13 | Ft. ISRO Collaborations",
    date: "July 30, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-violet-600",
    category: "important",
  },
  {
    id: 14,
    title:
      "Renewable Energy | Made In India | Episode #14 | Ft. Solar Power Leaders",
    date: "August 10, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-amber-600",
    category: "business",
  },
];

const ITEMS_PER_PAGE = 12;

const PodcastsBlog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPodcasts = useMemo(() => {
    let filtered = podcasts;

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

  const filters = [
    { id: "all", label: "All", count: podcasts.length },
    {
      id: "important",
      label: "Important",
      count: podcasts.filter((p) => p.category === "important").length,
    },
    {
      id: "business",
      label: "Business",
      count: podcasts.filter((p) => p.category === "business").length,
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: COLORS.gray }}
    >
      <BackgroundShapes />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-4xl font-bold mb-8"
              style={{ color: COLORS.blue }}
            >
              Made In India Podcasts
            </h1>
          </div>
        </div>

        {/* Sticky Search and Filter Bar */}
        <div
          className={`transition-all duration-300 ${
            isSticky
              ? "fixed top-[90px] left-1/2 -translate-x-1/2 backdrop-blur-md shadow-lg z-50 hidden sm:block rounded-full px-4 py-0 bg-white/60"
              : "relative"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl  mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 lg:max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search podcasts..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-3 flex-wrap">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterChange(filter.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeFilter === filter.id
                          ? "text-white shadow-md transform scale-105"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-red-400 hover:bg-red-50"
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
                  ))}

                  {/* Premium Scratch Card Link */}
                  <a
                    href="/bastion-core"
                    className="px-4 py-2 rounded-full text-sm font-medium text-yellow-900 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center gap-2"
                    style={{
                      background: "linear-gradient(to right, #FACC15, #F59E0B)",
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    Scratch Card
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`px-4 sm:px-6 lg:px-8 ${isSticky ? "mt-20" : ""}`}>
          <div className="max-w-7xl mx-auto py-8">
            {/* Results Info */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {currentPodcasts.length} of {filteredPodcasts.length}{" "}
                podcasts
                {searchQuery && (
                  <span
                    className="ml-2 font-medium"
                    style={{ color: COLORS.red }}
                  >
                    for "{searchQuery}"
                  </span>
                )}
              </p>
            </div>

            {/* Podcast Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPodcasts.map((podcast) => (
                <a
                  key={podcast.id}
                  href={`/podcast/${podcast.id}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 group block"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={podcast.imageUrl}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        📅 {podcast.date}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold mb-3 leading-tight line-clamp-2 group-hover:text-red-700 transition-colors"
                      style={{ color: COLORS.blue }}
                    >
                      {podcast.title}
                    </h3>

                    <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                      {podcast.description}
                    </p>

                    {/* Read More Link */}
                    <span
                      className="inline-block relative text-sm font-medium"
                      style={{ color: COLORS.red }}
                    >
                      Read more
                      <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-current origin-right transform scale-x-100 transition-transform duration-300 group-hover:scale-x-0"></span>
                    </span>
                  </div>
                </a>
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
                  No podcasts found
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

                  if (totalPages > 7) {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
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
                            backgroundColor: isActive
                              ? COLORS.red
                              : COLORS.white,
                          }}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

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

export default PodcastsBlog;
