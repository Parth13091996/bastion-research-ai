import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import BackgroundShapes from "@/components/generic/framer-motion";
import { useLoader } from "@/hooks/useLoader";
import { AppRoutes } from "@/routes/app-routes";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Brand Colors
const COLORS = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  gray: "#E6E6E6",
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = (id) => {
    const link = `${window.location.origin}/podcast/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  useEffect(() => {
    if (loading) {
      start();
    } else {
      stop();
    }
  }, [loading]);

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
              Bastion Podcasts
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Stay informed with Bastion Podcasts, your go-to source for the
              latest insights, trends, and updates in the world of business and
              technology
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <div className="max-w-7xl mx-auto py-8">
            {/* Podcast Cards Grid */}
            {currentPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {currentPodcasts.map((podcast) => (
                  <div
                    key={podcast.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={`https://img.youtube.com/vi/${new URL(podcast.video_url).pathname.split("/").at(-1)}/sddefault.jpg`}
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
                          href={AppRoutes.podcastView().replace(
                            ":id",
                            podcast.id
                          )}
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
    </div>
  );
};

export default PublicPodcastsPage;
