import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-secondary mb-4">Coming Soon..!</h1>
        <p className="text-lg text-secondary-foreground">( This Product is Under Progress )</p>
      </div>
    </div>
  );
};

export default ComingSoon;
