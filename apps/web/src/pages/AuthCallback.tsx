import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        navigate('/dashboard');
      } else {
        // This case handles when the cookie is not set or invalid.
        // The checkUser in AuthProvider would have failed.
        navigate('/login?error=Authentication failed');
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
