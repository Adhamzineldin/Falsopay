import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useApp();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to the Unauthorized page if the route requires admin role but user isn't admin
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
