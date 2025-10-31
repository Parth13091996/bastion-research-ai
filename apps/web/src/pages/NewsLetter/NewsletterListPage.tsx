import { ChevronLeft, ChevronRight, Crown, Search,Play, Share2, } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundShapes from "../../components/generic/framer-motion.tsx";
import { mailchimpNewsletterApi } from "@/api/mailchimp";
import { toast } from "sonner";
import { Newsletter } from "@repo/types";


const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#F3F4F6", // lighter background like podcasts page
  white: "#ffffff",
  black: "#000000",
};

const ITEMS_PER_PAGE = 12;

const NewsletterArchive = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setIsLoading(true);
      const data = await mailchimpNewsletterApi.getAll();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNewsletters(sorted);
    } catch (error: any) {
      toast.error("Failed to load newsletters");
      console.error("Error loading newsletters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNewsletters = useMemo(() => {
    let filtered = newsletters;

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter((newsletter) => {
        const titleMatch = newsletter.title?.toLowerCase().includes(term);
        const subtitleMatch = newsletter.sub_title
          ?.toLowerCase()
          .includes(term);
        //@ts-ignore
        const plainMatch = newsletter?.plain_text?.toLowerCase().includes(term);
        return Boolean(titleMatch || subtitleMatch || plainMatch);
      });
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (newsletter) => newsletter.category === activeFilter
      );
    }

    return filtered;
  }, [newsletters, searchQuery, activeFilter]);

  const totalPages = Math.ceil(filteredNewsletters.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNewsletters = filteredNewsletters.slice(
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

  const handleShare = (id: string) => {
    const link = `${window.location.origin}/newsletters/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleViewNewsletter = (id: string) => {
    navigate(`/newsletters/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filters = useMemo(() => {
    const categoryCounts = newsletters.reduce(
      (acc, newsletter) => {
        const category = newsletter.category || "uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return [
      { id: "all", label: "All", count: newsletters.length },
      {
        id: "learning-of-the-week",
        label: "Learning of the Week",
        count: categoryCounts["learning-of-the-week"] || 0,
      },
      {
        id: "topical-update",
        label: "Topical Update",
        count: categoryCounts["topical-update"] || 0,
      },
    ];
  }, [newsletters]);

  const getSubtitle = (newsletter: Newsletter) =>
    //@ts-ignore
    newsletter.sub_title || newsletter.plain_text || "";

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: COLORS.gray }}
    >
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
              Bastion Newsletter
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Stay informed with Bastion Newsletter, your go-to source for the
              latest insights, trends, and updates in the world of business and
              technology.
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
              placeholder="Search newsletter..."
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform-gpu ${
                  activeFilter === filter.id
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
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : currentNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {currentNewsletters.map((newsletter) => {
                const summary = getSubtitle(newsletter);
                return (
                  <div
                    key={newsletter.id}
                    className="group rounded-2xl shadow-sm overflow-hidden bg-[#F9FAFB] flex flex-col border border-gray-200 transform transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {newsletter.headline_image_url ? (
                        <img
                          src={newsletter.headline_image_url}
                          alt={newsletter.title}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-4xl">📧</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col flex-grow px-4 py-3">
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
                        {newsletter.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                        {summary}
                      </p>

                      <div className="flex items-center justify-between text-gray-600 text-sm mt-auto mb-2">
                        <button
                          onClick={() => handleViewNewsletter(newsletter.id)}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors"
                        >
                          <Play className="w-4 h-4 flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors" />
                          <span>Read Now</span>
                        </button>

                        <button
                          onClick={() => handleShare(newsletter.id)}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#C00000] transition-colors"
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
              <p>No newsletters found. Please check back later.</p>
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
  );
};

export default NewsletterArchive;
