import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { videoUrlWithEmbed } from "@/utils";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export type ContentType = "newsletter" | "webinar" | "podcast";

interface ContentViewerProps {
  type: ContentType;
  api: {
    getById: (id: string) => Promise<any>;
  };
  onBack: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ type, api, onBack }) => {
  const { id } = useParams();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await api.getById(id!);
      setContent(data);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getTypeIcon = () => {
    switch (type) {
      case "newsletter":
        return "📧";
      case "webinar":
        return "🎥";
      case "podcast":
        return "🎧";
      default:
        return "📄";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "newsletter":
        return "bg-blue-100 text-blue-800";
      case "webinar":
        return "bg-purple-100 text-purple-800";
      case "podcast":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content not found</h1>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            <Badge className={getTypeColor()}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Combined Content Container */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Title and Meta */}
            <div className={
              " " +
              ((content.headline_image_url || content.contents || content.video_url || content.footer_content)
                ? "mb-6"
                : "")
            }>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(content.created_at)}</span>
              </div>
              <h1 className="text-3xl font-semibold">{content.title}</h1>
              {content.sub_title && (
                <p className="text-lg text-gray-600 mt-2">{content.sub_title}</p>
              )}
            </div>

            {/* Image */}
            {content.headline_image_url && (
              <div className={
                " " +
                ((content.contents || content.video_url || content.footer_content)
                  ? "mb-6"
                  : "")
              }>
                <img
                  src={content.headline_image_url}
                  alt={content.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Editor Content */}
            {content.contents && (
              <div className={
                "simple-editor-wrapper " +
                ((content.video_url || content.footer_content)
                  ? "mb-6"
                  : "")}>
                <div className="simple-editor-content">
                  <div
                    className={content.contents ? "tiptap ProseMirror simple-editor prose max-w-none mb-0.5" : ""}
                    dangerouslySetInnerHTML={{ __html: content.contents }}
                  />
                </div>
              </div>
            )}

            {/* Video (for webinars and podcasts) */}
            {content.video_url && (type === "webinar" || type === "podcast") && (
              <div className={
                " " +
                (content.footer_content
                  ? "mb-6"
                  : "")
              }>
                <h2 className="text-2xl font-semibold mb-4">Video</h2>
                <div
                  className="aspect-video rounded-lg overflow-hidden"
                  style={{ background: videoUrlWithEmbed(content.video_url) }}
                >
                  <iframe
                    src={videoUrlWithEmbed(content.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    title={content.title}
                  />
                </div>
              </div>
            )}

            {/* Footer Content (for newsletters) */}
            {content.footer_content && type === "newsletter" && (
              <div>
                <div className="simple-editor-wrapper">
                  <div className="simple-editor-content">
                    <div
                      className={content.footer_content ? "tiptap ProseMirror simple-editor prose max-w-none mb-0.5" : ""}
                      dangerouslySetInnerHTML={{ __html: content.footer_content }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Share Card */}
          <Card>
            <CardHeader>
              <CardTitle>Share this {type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About this {type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Published {formatDate(content.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Type:</span>
                <Badge className={getTypeColor()}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;

export const CardContentComponent = ({ contents }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="simple-editor-wrapper">
          <div className="simple-editor-content">
            <div
              className={contents ? "tiptap ProseMirror simple-editor prose max-w-none mb-0.5" : ""}
              dangerouslySetInnerHTML={{
                __html: contents,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
