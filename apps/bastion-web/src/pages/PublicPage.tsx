import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Mock data that would normally come from a backend
const MOCK_DATA: { [key: string]: string } = {
  'refund-policy': '<h1>Refund Policy</h1><p>This is the refund policy content.</p>',
  'privacy-policy': '<h1>Privacy Policy</h1><p>This is the privacy policy content.</p>',
  'terms-and-conditions': '<h1>Terms and Conditions</h1><p>These are the terms and conditions.</p>',
  'compliance': '<h1>Compliance</h1><p>This is the compliance information.</p>',
};

const PublicPage = () => {
  const { pageName } = useParams<{ pageName: string }>();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (pageName) {
      // In a real application, you would fetch this from an API
      // For example: fetch(`/api/settings/${pageName}`).then(...)
      const pageContent = MOCK_DATA[pageName] || '<h1>Page Not Found</h1>';
      setContent(pageContent);
    }
  }, [pageName]);

  return (
    <div className="prose lg:prose-xl mx-auto my-12">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PublicPage;
