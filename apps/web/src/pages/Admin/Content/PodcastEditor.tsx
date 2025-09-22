import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { podcastApi } from "@/api/content";
import { toast } from "sonner";

const PodcastEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadPodcast();
    }
  }, [id]);

  const loadPodcast = async () => {
    try {
      setIsLoading(true);
      const data = await podcastApi.getById(id!);
      setInitialData(data);
    } catch (error: any) {
      toast.error("Failed to load podcast");
      navigate("/admin/content/podcasts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (id) {
      await podcastApi.update(id, data);
    } else {
      await podcastApi.create(data);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading podcast...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentEditor
      type="podcasts"
      initialData={initialData}
      onSave={handleSave}
    />
  );
};

export default PodcastEditor;
