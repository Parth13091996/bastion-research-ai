import React from "react";
import { useNavigate } from "react-router-dom";
import ContentViewer from "@/components/public/ContentViewer";
import { mailchimpNewsletterApi } from "@/api/mailchimp-api";

const NewsletterView: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/newsletters-archive");
  };

  return (
    <ContentViewer
      type="newsletter"
      api={mailchimpNewsletterApi}
      onBack={handleBack}
    />
  );
};

export default NewsletterView;
