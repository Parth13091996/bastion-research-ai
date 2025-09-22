import React from "react";
import { useNavigate } from "react-router-dom";
import ContentManagement from "@/components/admin/ContentManagement";
import { webinarApi } from "@/api/content";

const WebinarManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/admin/content/webinars/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/webinars/${id}`);
  };

  return (
    <ContentManagement
      type="webinars"
      title="Webinar Management"
      api={webinarApi}
      onEdit={handleEdit}
      onView={handleView}
    />
  );
};

export default WebinarManagement;
