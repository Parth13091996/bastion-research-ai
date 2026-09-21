import {
  ChevronLeft,
  ChevronRight,
  Search,
  Play,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import { toast } from "sonner";

const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#F3F4F6",
  white: "#ffffff",
  black: "#000000",
};

const ITEMS_PER_PAGE = 12;

interface SectorDeepDive {
  id: string;
  title: string;
  sub_title: string;
  published_date: string;
  headline_image_url: string;
  link: string;
  category: "deep-dive" | "sample-research";
}

const DEEP_DIVES: SectorDeepDive[] = [
  {
    id: "ai-value-chain",
    title: "AI Value Chain",
    sub_title: "A comprehensive deep dive into the artificial intelligence value chain, key players, and future trends.",
    published_date: "2024-03-15",
    headline_image_url: "/media/ai-value-chain.png",
    link: "https://mailchi.mp/bastionresearch.in/ai_value_chain",
    category: "deep-dive",
  },
  {
    id: "shipping-sector",
    title: "Shipping Sector Deep Dive",
    sub_title: "Analyzing global shipping dynamics, freight rates, container supply-demand, and investment opportunities.",
    published_date: "2024-04-10",
    headline_image_url: "/media/shipping-sector.png",
    link: "https://mailchi.mp/bastionresearch.in/shipping_sector",
    category: "deep-dive",
  },
  {
    id: "sample-research",
    title: "Sample Research Report",
    sub_title: "Get an inside look at our detailed investment research methodology, reporting structure, and insights.",
    published_date: "2024-05-01",
    headline_image_url: "/media/sample-research.png",
    link: "https://mailchi.mp/bastionresearch.in/sampleresearch",
    category: "sample-research",
  },
  {
    id: "bess",
    title: "Battery Energy Storage Systems (BESS)",
    sub_title: "A deep dive into clean energy grid integration, battery chemical technologies, and utility scale storage.",
    published_date: "2024-05-20",
    headline_image_url: "/media/bess-cover.png",
    link: "https://mailchi.mp/bastionresearch/bess",
    category: "deep-dive",
  },
  {
    id: "semiconductor",
    title: "Semiconductor Industry",
    sub_title: "Understanding the silicon supply chain, lithography, foundry capacity, and global chip geopolitics.",
    published_date: "2024-06-15",
    headline_image_url: "/media/semiconductors-cover.png",
    link: "https://mailchi.mp/bastionresearch/semiconductor",
    category: "deep-dive",
  }
];

const SectorDeepDivesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [publishDate, setPublishDate] = useState("");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (item: SectorDeepDive) => {
    navigator.clipboard.writeText(item.link);
    toast.success("Link copied to clipboard!");
  };

  const handleViewDeepDive = (item: SectorDeepDive) => {
    window.open(item.link, "_blank");
  };

  const filteredDeepDives = useMemo(() => {
    let filtered = DEEP_DIVES;

    if (publishDate) {
      filtered = filtered.filter((item) => {
        if (!item.published_date) return false;
        const itemDate = new Date(item.published_date).toISOString().slice(0, 10);
        return itemDate === publishDate;
      });
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(term);
        const subtitleMatch = item.sub_title.toLowerCase().includes(term);
        return titleMatch || subtitleMatch;
      });
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.category === activeFilter
      );
    }

    return filtered;
  }, [searchQuery, activeFilter, publishDate]);

  const totalPages = Math.ceil(filteredDeepDives.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDeepDives = filteredDeepDives.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const categoryCounts = useMemo(() => {
    return DEEP_DIVES.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, []);

  const filters = [
    { id: "all", label: "All", count: DEEP_DIVES.length },
    {
      id: "deep-dive",
      label: "Deep Dives",
      count: categoryCounts["deep-dive"] || 0,
    },
    {
      id: "sample-research",
      label: "Sample Research",
      count: categoryCounts["sample-research"] || 0,
    },
  ];

  function renderCategoryTag(category?: string) {
    if (!category) return null;
    let label = "";
    let color = "";
    switch (category) {
      case "deep-dive":
        label = "Deep Dive";
        color = COLORS.red;
        break;
      case "sample-research":
        label = "Sample Research";
        color = COLORS.blue;
        break;
      default:
        label = category;
        color = COLORS.gray;
    }
    return (
      <span
        className="inline-flex w-fit rounded-full px-3 py-2 text-xs font-medium leading-none"
        style={{
          backgroundColor: color,
          color: COLORS.white,
        }}
      >
        {label}
      </span>
    );
  }

  function renderDate(dateString?: string) {
    if (!dateString) return null;
    return (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {new Date(dateString).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundShapes />
      </div>

      <div className="relative px-6 max-w-7xl z-10 mx-auto">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="w-full">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: COLORS.blue }}
            >
              Sector Deep Dives
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Explore our comprehensive, high-quality, research-driven deep dives into major sectors, uncovering key trends, business models, and investment insights.
            </p>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 my-6">
          {/* Search */}
          <div className="flex-1 lg:max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search deep dives..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform-gpu ${activeFilter === filter.id
                  ? "text-white shadow-md scale-105"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                style={{
                  backgroundColor:
                    activeFilter === filter.id ? COLORS.red : COLORS.white,
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}

            {/* <div className="flex flex-col gap-1 ml-2">
              <label className="block text-sm font-medium mb-1 sr-only">
                Publish Date
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-fit"
                placeholder="Publish Date"
              />
            </div>  */}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-8">
          {currentDeepDives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {currentDeepDives.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl shadow-sm overflow-hidden bg-[#F9FAFB] flex flex-col border border-gray-200 transform transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer focus:outline-none"
                    tabIndex={0}
                    role="button"
                    aria-label={`Read deep dive: ${item.title}`}
                    onClick={() => handleViewDeepDive(item)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleViewDeepDive(item);
                      }
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {item.headline_image_url ? (
                        <img
                          src={item.headline_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-4xl">📊</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col item-center gap-2 flex-grow px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        {renderCategoryTag(item.category)}
                        {/* {renderDate(item.published_date)} */}
                      </div>

                      <h3
                        className="text-[#1C2852] text-base font-semibold mb-2 line-clamp-2 group-hover:text-[#C00000] transition-colors"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "3rem",
                        }}
                      >
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                        {item.sub_title}
                      </p>

                      <div className="flex items-center justify-between text-gray-600 text-sm mt-auto mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDeepDive(item);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors"
                          tabIndex={-1}
                        >
                          <Play className="w-4 h-4 flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors" />
                          <span>Read Now</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors"
                          tabIndex={-1}
                        >
                          <Share2 className="w-4 h-4 flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <p>No sector deep dives found. Please check back later.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive
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

              {/* Next Button */}
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
  );
};

export default SectorDeepDivesPage;
