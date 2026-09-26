import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 p-4">
      <div className="text-center max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
        <div className="text-7xl font-black text-blue-600 mb-2 tracking-tight">404</div>
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 text-sm mb-6">
          The transport page or route you are looking for does not exist or has been moved.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/20"
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
