import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { scratchPadApi, ScratchPadNewsletter } from "@/api/scratchpad";
import { toast } from "sonner";

const ScratchPadList: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<ScratchPadNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Scratch Pad</h1>
        <p className="text-muted-foreground text-lg">
          Market insights, analysis, and updates from our research team
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search newsletters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((newsletter) => (
            <Card
              key={newsletter.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {newsletter.featured_image && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={newsletter.featured_image}
                    alt={newsletter.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(newsletter.tags || []).slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold line-clamp-2">
                    {newsletter.title}
                  </h3>

                  {newsletter.description && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {newsletter.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          {new Date(
                            newsletter.published_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRead(newsletter.id);
                    }}
                  >
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScratchPadList;
