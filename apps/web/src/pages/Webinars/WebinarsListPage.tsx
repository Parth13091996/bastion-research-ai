import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import BackgroundShapes from "@/components/generic/framer-motion";
import { useLoader } from "@/hooks/useLoader";
import { AppRoutes } from "@/routes/app-routes";
import { useQuery } from "@tanstack/react-query";
import { Play, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
  white: "#ffffff",
  black: "#000000",
};

const ITEMS_PER_PAGE = 12;

const PublicWebinarsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("free");

  const { data: rowData = [], isLoading: loading } = useQuery({
    queryKey: [queryKeys.webinars],
    queryFn: () =>
      axiosInstance
        .get(endpoints.content.webinars.base)
        .then((res) => res.data),
  });

  const { start, stop } = useLoader();

  const filteredWebinars = rowData.filter(
    (webinar) =>
      (activeTab === "free" && !webinar.is_premium) ||
      (activeTab === "premium" && webinar.is_premium)
  );

  const totalPages = Math.ceil(filteredWebinars.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentWebinars = useMemo(
    () => filteredWebinars.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [currentPage, filteredWebinars]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (id: string) => {
    const link = AppRoutes.webinarView().replace(":id", id);
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  useEffect(() => {
    if (loading) start();
    else stop();
  }, [loading]);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: COLORS.gray }}
    >
      <div className="absolute inset-0 z-0">
        <BackgroundShapes />
      </div>

      <div className="relative px-6 max-w-7xl z-10 mx-auto">
        {/* Header */}
        <div className="pt-8 pb-4">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.blue }}
          >
            Bastion Webinars
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Stay informed with Bastion Webinars, your go-to source for the
            latest insights, trends, and updates in the world of business and
            technology.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-x-4">
          {["free", "premium"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
              style={{
                backgroundColor: activeTab === tab ? COLORS.red : COLORS.white,
              }}
            >
              {tab === "free" ? "Free" : "Premium"}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8">
          {currentWebinars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {currentWebinars.map((webinar) => {
                const videoId = new URL(webinar.video_url).pathname
                  .split("/")
                  .at(-1);
                const link = AppRoutes.webinarView().replace(":id", webinar.id);

                return (
                  <Link
                    to={link}
                    key={webinar.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transform transition-all hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/sddefault.jpg`}
                        alt={webinar.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow px-4 py-3">
                      <h3
                        className="text-[#1C2852] text-base font-semibold mb-3 line-clamp-2 group-hover:text-[#C00000] transition-colors"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "3rem",
                        }}
                      >
                        {webinar.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4">
                        {new Date(webinar.created_at).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-between text-gray-600 text-sm mt-auto mb-2">
                        {/* Play button with hover effect */}
                        <div className="flex items-center gap-2 cursor-pointer group/play transition-all duration-300 hover:scale-105">
                          <Play
                            size={18}
                            className="text-gray-600 group-hover/play:text-[#C00000] transition-colors"
                          />
                          <span className="transition-colors group-hover/play:text-[#C00000]">
                            {webinar.views || "Play Now"}
                          </span>
                        </div>

                        {/* Share button with hover effect */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(webinar.id);
                          }}
                          className="flex items-center gap-2 cursor-pointer group/share transition-all duration-300 hover:scale-105"
                        >
                          <Share2
                            size={18}
                            className="text-gray-600 group-hover/share:text-[#C00000] transition-colors"
                          />
                          <span className="transition-colors group-hover/share:text-[#C00000]">
                            Share
                          </span>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <p>No webinars found. Please check back later.</p>
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

export default PublicWebinarsPage;
