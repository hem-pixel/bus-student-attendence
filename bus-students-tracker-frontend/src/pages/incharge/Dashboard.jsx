import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  CheckSquare, 
  AlertTriangle, 
  RefreshCw, 
  Radio, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { BusInfoCard } from '../../components/incharge/BusInfoCard';
import { AttendanceStats } from '../../components/incharge/AttendanceStats';
import { QuickActionCard } from '../../components/incharge/QuickActionCard';

export default function InchargeDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    incharge: null,
    bus: null,
    students_count: 0,
    today_attendance: {
      present: 0,
      absent: 0,
      total: 0
    }
  });

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError('');

      const userId = localStorage.getItem('userId');

      // 1. Fetch In-Charge Dashboard data
      let dashRes;
      try {
        dashRes = await apiClient.get('/incharge/dashboard');
      } catch (err) {
        if (userId) {
          dashRes = await apiClient.get(`/incharge/dashboard/${userId}`);
        } else {
          throw err;
        }
      }

      let busDetails = null;
      // 2. Fetch full bus info with drivers and locations
      try {
        const busRes = await apiClient.get('/incharge/bus');
        if (busRes.data?.success && busRes.data?.data) {
          busDetails = busRes.data.data;
        }
      } catch (busErr) {
        console.warn('Could not fetch detailed bus telematics:', busErr.message);
      }

      if (dashRes?.data?.success) {
        const rawData = dashRes.data.data;
        setDashboardData({
          incharge: rawData.incharge || null,
          bus: busDetails || rawData.bus || null,
          students_count: rawData.students_count || 0,
          today_attendance: rawData.today_attendance || { present: 0, absent: 0, total: 0 }
        });
      } else {
        setError(dashRes?.data?.message || 'Failed to retrieve dashboard data');
      }
    } catch (err) {
      console.error('Incharge dashboard fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const bus = dashboardData.bus;
  const inchargeName = dashboardData.incharge?.name || localStorage.getItem('userName') || 'Bus In-Charge';
  const location = bus?.bus_locations;
  const hasCoordinates = location && typeof location.latitude === 'number' && location.latitude !== 0;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar 
          title="In-Charge Command Hub" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>On-Duty Portal</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Welcome back, {inchargeName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage today's transit operations, take student roll calls, and track vehicle telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Hub'}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {/* Assigned Bus Info Card */}
          <BusInfoCard 
            bus={bus} 
            inchargeName={inchargeName}
          />

          {/* Today's Attendance Metrics */}
          <AttendanceStats
            studentsCount={dashboardData.students_count}
            presentCount={dashboardData.today_attendance.present}
            absentCount={dashboardData.today_attendance.absent}
          />

          {/* Quick Operations Nav Cards */}
          <QuickActionCard />

          {/* Live Telematics Beacon Bar */}
          <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                hasCoordinates ? 'bg-blue-500/10 text-blue-400 ring-2 ring-blue-500/20' : 'bg-slate-800 text-slate-500'
              }`}>
                <Radio className={`w-6 h-6 ${hasCoordinates ? 'animate-pulse' : ''}`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Live GPS Telematics Beacon
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    hasCoordinates ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {hasCoordinates ? 'Active Signal' : 'Awaiting Beacon'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {hasCoordinates ? (
                    <>
                      Coordinates: <span className="font-mono text-slate-200">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                      {location.speed !== null && (
                        <span className="ml-2 font-semibold text-cyan-400">• Speed: {location.speed} km/h</span>
                      )}
                      {location.updated_at && (
                        <span className="ml-2 text-slate-400">• Last Ping: {new Date(location.updated_at).toLocaleTimeString()}</span>
                      )}
                    </>
                  ) : (
                    'No GPS telemetry transmitted for this bus yet. Start tracking or verify GPS device power.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/incharge/map')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Live Radar</span>
              </button>

              {hasCoordinates && (
                <a
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
