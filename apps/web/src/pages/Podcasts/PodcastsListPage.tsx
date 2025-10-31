import { Link } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import BackgroundShapes from "@/components/generic/framer-motion";
import { useLoader } from "@/hooks/use-loader";
import { useQuery } from "@tanstack/react-query";
import { Play, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppRoutes } from "@/routes/app-routes";

const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#F3F4F6", // lighter background
  white: "#ffffff",
  black: "#000000",
};

const ITEMS_PER_PAGE = 12;

const PublicPodcastsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: rowData = [], isLoading: loading } = useQuery({
    queryKey: [queryKeys.podcasts],
    queryFn: () =>
      axiosInstance
        .get(endpoints.content.podcasts.base)
        .then((res) => res.data),
  });

  const { start, stop } = useLoader();

  const totalPages = Math.ceil(rowData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPodcasts = useMemo(
    () => rowData.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [currentPage, rowData]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (id: string) => {
    const path = AppRoutes.podcastView.replace(":id", id);
    const link = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
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
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundShapes />
      </div>

      <div className="relative px-6 max-w-7xl z-10 mx-auto">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="w-full sm:mx-auto">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: COLORS.blue }}
            >
              Bastion Podcasts
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Stay informed with Bastion Podcasts, your go-to source for the
              latest insights, trends, and updates in the world of business and
              technology.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8">
          {currentPodcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {currentPodcasts.map((podcast) => {
                const videoId = new URL(podcast.video_url).pathname
                  .split("/")
                  .at(-1);
                const link = AppRoutes.podcastView.replace(":id", podcast.id);

                return (
                  <Link
                    key={podcast.id}
                    to={link}
                    className="group rounded-2xl shadow-sm overflow-hidden bg-[#F9FAFB] flex flex-col border border-gray-200 transform transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/sddefault.jpg`}
                        alt={podcast.title}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </div>

                    {/* Title + Actions */}
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
                        {podcast.title}
                      </h3>

                      <div className="flex items-center justify-between text-gray-600 text-sm mt-auto mb-2">
                        {/* Play Icon + Text */}
                        <div className="flex items-center gap-2 cursor-pointer group/play hover:text-[#C00000] transition-colors duration-300">
                          <Play
                            size={18}
                            className="transition-transform group-hover/play:text-[#C00000]"
                          />
                          <span className="transition-colors group-hover/play:text-[#C00000]">
                            {podcast.views || "Play Now"}
                          </span>
                        </div>

                        {/* Share Icon + Text */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(podcast.id);
                          }}
                          className="flex items-center gap-2 cursor-pointer group/share hover:text-[#C00000] transition-colors duration-300 hover:scale-105"
                        >
                          <Share2
                            size={18}
                            className="transition-transform group-hover/share:scale-110 group-hover/share:text-[#C00000]"
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
              <p>No podcasts found. Please check back later.</p>
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

export default PublicPodcastsPage;
