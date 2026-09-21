import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import ContentEditor from "@/components/admin/ContentEditor";
import { toast } from "sonner";
import { scratchPadApi } from "@/api/scratchpad-api";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
import { AppRoutes } from "@/routes/app-routes";

const ScratchPadEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, isLoading: accessLoading } =
    useSectionEditAccess("content_scratch_pad");
  const [initialData, setInitialData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadScratchPad();
    }
  }, [id]);

  const loadScratchPad = async () => {
    try {
      setIsLoading(true);
      const data = await scratchPadApi.getById(id!);
      setInitialData(data);
    } catch (error: any) {
      toast.error("Failed to load scratch-pad");
      navigate("/admin/content/scratch-pad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (id) {
      await scratchPadApi.update(id, data);
    } else {
      await scratchPadApi.create(data);
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
    return <Navigate to={AppRoutes.adminScratchPadManagement} replace />;
  }

  return (
    <ContentEditor
      type="scratch-pad"
      initialData={initialData}
      onSave={handleSave}
    />
  );
};

export default ScratchPadEditor;
