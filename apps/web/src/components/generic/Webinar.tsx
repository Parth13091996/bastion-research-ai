import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  },
  {
    id: 2,
    title: "Hospitals: Capacity Ramp and ROCE Math",
    date: "August 15, 2025",
    description: "Analyzing hospital capacity expansions.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 3,
    title: "Q1 Results: Diagnostics Beat, AMC Mixed",
    date: "August 12, 2025",
    description: "Quarterly earnings update across diagnostics.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 4,
    title: "Scratch Pad: Near-Miss in Specialty Chem",
    date: "August 10, 2025",
    description: "Case study on specialty chemicals near-miss.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 5,
    title: "The Rise of AI in Drug Discovery",
    date: "August 25, 2025",
    description:
      "Exploring how artificial intelligence is accelerating the process of drug discovery and development.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 6,
    title: "Decoding the Latest Pharma M&A Trends",
    date: "August 22, 2025",
    description:
      "An in-depth analysis of recent mergers and acquisitions in the pharmaceutical sector.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 7,
    title: "A Deep Dive into Gene Editing Technologies",
    date: "August 18, 2025",
    description:
      "Understanding the potential and challenges of CRISPR and other gene-editing tools.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 8,
    title: "The Future of Personalized Medicine",
    date: "August 14, 2025",
    description:
      "How tailored treatments based on genetic information are revolutionizing healthcare.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 9,
    title: "Navigating Regulatory Hurdles in Biotech",
    date: "August 11, 2025",
    description:
      "A guide to the complex regulatory landscape for new biotechnology products.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 10,
    title: "Investment Opportunities in MedTech",
    date: "August 8, 2025",
    description:
      "Identifying promising areas for investment within the medical technology industry.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 11,
    title: "The Impact of Telemedicine on Healthcare Delivery",
    date: "August 5, 2025",
    description:
      "Assessing how virtual consultations are changing patient care.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 12,
    title: "Understanding the Vaccine Development Pipeline",
    date: "August 1, 2025",
    description:
      "From research to rollout: a comprehensive overview of how vaccines are made.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 13,
    title: "Breakthroughs in Cancer Immunotherapy",
    date: "July 29, 2025",
    description:
      "Highlighting the latest advancements in using the immune system to fight cancer.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 14,
    title: "The Economics of Rare Diseases",
    date: "July 25, 2025",
    description:
      "Examining the market dynamics and challenges for orphan drugs.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 15,
    title: "Ethical Considerations in Clinical Trials",
    date: "July 22, 2025",
    description:
      "A discussion on the moral and ethical dilemmas in human medical research.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 16,
    title: "The Role of Big Data in Public Health",
    date: "July 18, 2025",
    description:
      "How large datasets are being used to track diseases and improve public health outcomes.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 17,
    title: "Innovations in Surgical Robotics",
    date: "July 15, 2025",
    description: "Exploring the cutting-edge of robotic-assisted surgery.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 18,
    title: "The Challenge of Antibiotic Resistance",
    date: "July 11, 2025",
    description: "Addressing the growing threat of drug-resistant bacteria.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 19,
    title: "Mental Health Tech: A New Frontier",
    date: "July 8, 2025",
    description:
      "The startups and technologies aiming to revolutionize mental healthcare.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 20,
    title: "3D Bioprinting: The Future of Organ Transplants?",
    date: "July 4, 2025",
    description:
      "Investigating the potential of 3D printing to create human organs for transplantation.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 21,
    title: "Supply Chain Resilience in the Pharma Industry",
    date: "July 1, 2025",
    description:
      "Lessons learned from recent disruptions and strategies for a more robust supply chain.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 22,
    title: "The Business of Longevity",
    date: "June 27, 2025",
    description:
      "Exploring the companies and research focused on extending human lifespan.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 23,
    title: "Patient Data Privacy in the Digital Age",
    date: "June 24, 2025",
    description:
      "The challenges of protecting sensitive health information in an interconnected world.",
    imageUrl: "../src/files/episode-9.webp",
  },
  {
    id: 24,
    title: "The Gig Economy in Healthcare",
    date: "June 20, 2025",
    description:
      "How freelance and temporary work is changing the healthcare workforce.",
    imageUrl: "../src/files/episode-9.webp",
  },
];

const ITEMS_PER_PAGE = 12;

const Webinar = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(newsletter.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPodcasts = useMemo(
    () => newsletter.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [currentPage]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (id) => {
    const link = `${window.location.origin}/podcast/${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: COLORS.gray }}
    >
      <BackgroundShapes />

      <div className="relative px-6 max-w-7xl z-10 mx-auto">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="w-full sm:mx-auto">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: COLORS.blue }}
            >
              Bastion Webinars
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Stay informed with Bastion Webinars, your go-to source for the
              latest insights, trends, and updates in the world of business and
              technology
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div>
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        {/* Category pill */}

                        {/* Date */}
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
                    </div>

                    {/* Buttons */}
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

export default Webinar;
