import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentViewer from '@/components/public/ContentViewer';
import { newsletterApi } from '@/api/content';

const NewsletterView: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/newsletters-archive');
  };

  return (
    <ContentViewer
      type="newsletter"
      api={newsletterApi}
      onBack={handleBack}
    />
  );
};

export default NewsletterView;
