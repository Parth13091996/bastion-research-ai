import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentViewer from '@/components/public/ContentViewer';
import { podcastApi } from '@/api/content';

const PodcastView: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/podcasts');
  };

  return (
    <ContentViewer
      type="podcast"
      api={podcastApi}
      onBack={handleBack}
    />
  );
};

export default PodcastView;
