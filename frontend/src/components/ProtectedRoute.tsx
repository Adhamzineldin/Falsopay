
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      // Redirect to login with the attempted URL as a return path
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  useEffect(() => {
    // Debug logs to help understand component state
    console.log('ProtectedRoute state:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-falsopay-primary mx-auto" />
          <p className="mt-4 text-lg font-medium text-falsopay-primary">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
