/**
 * Protected Route Component
 * Wraps content that requires authentication
 * Use with screen-based navigation (onScreenChange callback)
 */

import { useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onUnauthenticated?: () => void;
}

export function ProtectedRoute({ 
  children, 
  onUnauthenticated 
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [user, loading, onUnauthenticated]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Public Route Component
 * Wraps content that should only be visible to unauthenticated users
 * Use with screen-based navigation (onScreenChange callback)
 */
interface PublicRouteProps {
  children: React.ReactNode;
  onAuthenticated?: () => void;
}

export function PublicRoute({ 
  children, 
  onAuthenticated 
}: PublicRouteProps) {
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user && onAuthenticated) {
      onAuthenticated();
    }
  }, [user, loading, onAuthenticated]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated
  if (user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Auth Guard Hook
 * Returns authentication status and helper functions
 */
export function useAuthGuard() {
  const { user, loading } = useAuthContext();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}

