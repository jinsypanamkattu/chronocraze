// AdminRedirect.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    } else if (isAuthenticated) {
      // If user is authenticated but not admin, redirect to home
      navigate('/');
    } else {
      // If not authenticated, redirect to login
      navigate('/login', { 
        state: { from: '/admin' },
        replace: true 
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Optional loading state while redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default AdminRedirect;