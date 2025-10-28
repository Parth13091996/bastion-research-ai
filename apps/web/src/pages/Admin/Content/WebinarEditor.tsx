import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { webinarApi } from "@/api/content";
import { toast } from "sonner";

const WebinarEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadWebinar();
    }
  }, [id]);

  const loadWebinar = async () => {
    try {
      setIsLoading(true);
      const data = await webinarApi.getById(id!);
      setInitialData(data);
    } catch (error: any) {
      toast.error("Failed to load webinar");
      navigate("/admin/content/webinars");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (id) {
      await webinarApi.update(id, data);
    } else {
      await webinarApi.create(data);
    }
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

  return (
    <ContentEditor
      type="webinars"
      initialData={initialData}
      onSave={handleSave}
    />
  );
};

export default WebinarEditor;
