import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-green-700 text-white text-2xl">Loading authentication...</div>;
  }

  // If user is logged in, render children. Otherwise, redirect to login page.
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;