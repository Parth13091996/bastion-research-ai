import React from "react";
import { useNavigate } from "react-router-dom";
import ContentViewer from "@/components/public/ContentViewer";
import { webinarApi } from "@/api/content";
import { AppRoutes } from "@/routes/app-routes";

const SingleWebinarPage: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (isPremium) {
      navigate(AppRoutes.premiumWebinars);
    } else {
      navigate(AppRoutes.webinar);
    }
  };

  return <ContentViewer type="webinar" api={webinarApi} onBack={handleBack} />;
};

export default SingleWebinarPage;
