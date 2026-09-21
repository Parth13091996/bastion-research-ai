import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { newsletterApi } from "@/api/content";
import { toast } from "sonner";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
import { AppRoutes } from "@/routes/app-routes";

const NewsletterEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, isLoading: accessLoading } =
    useSectionEditAccess("content_newsletter");
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
      const data = await newsletterApi.admin.getById(id!);
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
      await newsletterApi.admin.update(id, data);
    } else {
      await newsletterApi.admin.create(data);
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
    return <Navigate to={AppRoutes.adminNewsletterManagement} replace />;
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
