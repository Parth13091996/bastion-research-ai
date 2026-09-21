import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { podcastApi } from "@/api/content";
import { toast } from "sonner";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
import { AppRoutes } from "@/routes/app-routes";

const PodcastEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, isLoading: accessLoading } =
    useSectionEditAccess("content_podcasts");
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

  if (accessLoading || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return <Navigate to={AppRoutes.adminPodcastManagement} replace />;
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
