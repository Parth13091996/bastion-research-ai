import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { scratchPadApi, ScratchPadNewsletter } from "@/api/scratchpad-api";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS, getBandColor, getTextColor } from "./RecommendationList/utils";
import { useSubscription } from "@/hooks/use-subscription";

const ScratchPadList: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<ScratchPadNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { data: subscription } = useSubscription();

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const data = await scratchPadApi.getAll(true); // Only published
      setNewsletters(data);
    } catch (error: any) {
      toast.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  const filtered = newsletters.filter((n) =>
    [n.title, n.description, n.author, ...(n.tags || [])]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleRead = (id: string) => {
    if (!subscription?.is_premium) {
      toast.info("Upgrade to access Scratch Pad");
      return;
    }
    navigate(`/user/app/scratch-pad/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Scratch Pad</h1>
        <p className="text-muted-foreground text-lg">
          Where every decision counts - Honest notes on the ideas that we did not recommend.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search newsletters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 py-4"
          />
        </div>
      </div>

      {/* No Results */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">No newsletters found</p>
              <p className="text-sm">Check back later for new content</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Card Grid (4 per row)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filtered.map((newsletter) => (
            <Card
              key={newsletter.id}
              className="bg-card text-card-foreground overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-gray-100 w-full sm:w-[95%] md:w-[90%] lg:w-[100%] xl:w-[95%] max-w-sm mx-auto h-[330px] flex flex-col justify-between"
              onClick={() => handleRead(newsletter.id)}
            >
              {/* Image */}
              {newsletter.featured_image && (
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={newsletter.featured_image}
                    alt={newsletter.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                </div>
              )}

              {/* Content */}
              <CardContent className="p-4 flex flex-col justify-between flex-grow">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(newsletter.tags || []).slice(0, 3).map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] font-medium bg-blue-900 text-white cursor-default"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-[#1C2852] mb-1 line-clamp-2">
                  {newsletter.title}
                </h3>

                {/* Description (2 lines only) */}
                {newsletter.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {newsletter.description}
                  </p>
                )}

                {/* Author & Date */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                  {newsletter.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{newsletter.author}</span>
                    </div>
                  )}
                  {newsletter.published_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(newsletter.published_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Read More */}
                <Link
                  to={`${newsletter.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    className="w-full text-sm py-2 font-semibold relative overflow-hidden"
                    style={{
                      borderColor: COLORS.lightGray,
                      color: COLORS.white,
                      background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
                      boxShadow: "0 6px 18px rgba(28,40,82,0.06)",
                      borderRadius: 8,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.boxShadow = "0 10px 26px rgba(28,40,82,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.boxShadow = "0 6px 18px rgba(28,40,82,0.06)";
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2 inline-block" />
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScratchPadList;
