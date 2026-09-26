import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function Loading() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on role
        if (userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userRole === 'BUS_INCHARGE') {
          navigate('/incharge/dashboard');
        } else if (userRole === 'STUDENT') {
          navigate('/student/dashboard');
        } else {
          navigate('/settings');
        }
      } else {
        navigate('/login');
      }
    }
  }, [loading, user, userRole, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-4">
      <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-sm w-full animate-fadeIn">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
          🚌
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Bus Students Tracker</h1>
        <p className="text-blue-100 text-sm mb-6">Initializing transport portal...</p>
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </div>
  );
}
