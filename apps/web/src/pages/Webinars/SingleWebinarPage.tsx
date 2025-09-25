import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentViewer from '@/components/public/ContentViewer';
import { webinarApi } from '@/api/content';

const WebinarView: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/webinars');
  };

  return (
    <ContentViewer
      type="webinar"
      api={webinarApi}
      onBack={handleBack}
    />
  );
};

export default WebinarView;
