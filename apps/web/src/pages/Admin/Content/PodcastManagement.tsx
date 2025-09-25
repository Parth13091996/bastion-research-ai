import React from "react";
import { useNavigate } from "react-router-dom";
import ContentManagement from "@/components/admin/ContentManagement";
import { podcastApi } from "@/api/content";

const PodcastManagement: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/admin/content/podcasts/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/podcasts/${id}`);
  };

  return (
    <ContentManagement
      type="podcasts"
      title="Podcast Management"
      api={podcastApi}
      onEdit={handleEdit}
      onView={handleView}
    />
  );
};

export default PodcastManagement;
