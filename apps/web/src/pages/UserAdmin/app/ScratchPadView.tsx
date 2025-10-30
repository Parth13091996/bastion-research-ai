import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { scratchPadApi, ScratchPadNewsletter } from "@/api/scratchpad";
import { toast } from "sonner";

const ScratchPadView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsletter, setNewsletter] = useState<ScratchPadNewsletter | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [relatedNewsletters, setRelatedNewsletters] = useState<
    ScratchPadNewsletter[]
  >([]);

  useEffect(() => {
    if (id) {
      loadNewsletter();
    }
  }, [id]);

  const loadNewsletter = async () => {
    try {
      setLoading(true);
      const data = await scratchPadApi.getById(id!);
      setNewsletter(data);

      // Load related newsletters (same tags)
      const allNewsletters = await scratchPadApi.getAll(true);
      const related = allNewsletters
        .filter(
          (n) =>
            n.id !== data.id && n.tags?.some((tag) => data.tags?.includes(tag))
        )
        .slice(0, 3);
      setRelatedNewsletters(related);
    } catch (error: any) {
      toast.error("Newsletter not found");
      navigate("/user/app/scratch-pad");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: newsletter?.title,
          text: newsletter?.description,
          url: url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
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

  if (!newsletter) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Newsletter not found
              </p>
              <Button
                onClick={() => navigate("/user/app/scratch-pad")}
                className="mt-4"
              >
                Back to List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/user/app/scratch-pad")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scratch Pad
        </Button>

        <article className="space-y-6">
          {newsletter.featured_image && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={newsletter.featured_image}
                alt={newsletter.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(newsletter.tags || []).map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold">{newsletter.title}</h1>

            {newsletter.description && (
              <p className="text-xl text-muted-foreground">
                {newsletter.description}
              </p>
            )}

            <div className="flex items-center justify-between border-y py-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {newsletter.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{newsletter.author}</span>
                  </div>
                )}
                {newsletter.published_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(newsletter.published_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <div dangerouslySetInnerHTML={{ __html: newsletter.content }} />
            </CardContent>
          </Card>

          {relatedNewsletters.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNewsletters.map((related) => (
                  <Card
                    key={related.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() =>
                      navigate(`/user/app/scratch-pad/${related.slug}`)
                    }
                  >
                    {related.featured_image && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={related.featured_image}
                          alt={related.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      {related.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default ScratchPadView;
