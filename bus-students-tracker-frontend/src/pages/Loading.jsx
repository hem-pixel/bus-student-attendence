import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Bus, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background ambient decorative effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative text-center p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 max-w-sm w-full animate-fadeIn">
        {/* Glow badge icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/20">
          <Bus className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">Fleet Command Portal</h1>
        <p className="text-slate-400 text-xs mt-1 mb-6">Initializing telemetry & secure session...</p>

        <div className="flex justify-center mb-6">
          <LoadingSpinner size="md" />
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Encrypted Transport Telemetry</span>
        </div>
      </div>
    </div>
  );
}

