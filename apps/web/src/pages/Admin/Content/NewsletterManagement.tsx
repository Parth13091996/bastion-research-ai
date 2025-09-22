import React from "react";
import { useNavigate } from "react-router-dom";
import ContentManagement from "@/components/admin/ContentManagement";
import { newsletterApi } from "@/api/content";

const NewsletterManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/admin/content/newsletters/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/newsletters/${id}`);
  };

  return (
    <ContentManagement
      type="newsletters"
      title="Newsletter Management"
      api={newsletterApi}
      onEdit={handleEdit}
      onView={handleView}
    />
  );
};

export default NewsletterManagement;
