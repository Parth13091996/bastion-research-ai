import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const user: User = JSON.parse(decodeURIComponent(userString));
        login(token, user);
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to parse user data from URL:', error);
        navigate('/login?error=Invalid user data');
      }
    } else {
      navigate('/login?error=Authentication failed');
    }
  }, [searchParams, login, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
