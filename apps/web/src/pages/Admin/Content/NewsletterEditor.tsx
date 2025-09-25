import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { newsletterApi } from "@/api/content";
import { toast } from "sonner";

const NewsletterEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadNewsletter();
    }
  }, [id]);

  const loadNewsletter = async () => {
    try {
      setIsLoading(true);
      const data = await newsletterApi.getById(id!);
      setInitialData(data);
    } catch (error: any) {
      toast.error("Failed to load newsletter");
      navigate("/admin/content/newsletters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (id) {
      await newsletterApi.update(id, data);
    } else {
      await newsletterApi.create(data);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading newsletter...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentEditor
      type="newsletters"
      initialData={initialData}
      onSave={handleSave}
    />
  );
};

export default NewsletterEditor;
