/**
 * MyRuta Web - Protected Route Component
 * 
 * Wraps routes that require authentication and specific roles
 * Redirects to login if not authenticated or role is insufficient
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ element, requiredRoles = [] }) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default ProtectedRoute;
