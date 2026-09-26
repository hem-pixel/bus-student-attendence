import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4 relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative text-center max-w-md w-full p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 text-blue-400">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 mb-2 tracking-tight">
          404
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Route Not Found</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The transport page, telemetry view, or route you are attempting to reach does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 shadow-lg shadow-blue-500/25"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
