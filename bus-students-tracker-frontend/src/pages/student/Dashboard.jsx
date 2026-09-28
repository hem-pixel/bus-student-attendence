import React, { useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { StudentInfoCard } from '../../components/student/StudentInfoCard';
import { BusInfoCard } from '../../components/student/BusInfoCard';
import { BusLocationCard } from '../../components/student/BusLocationCard';
import { LastUpdateInfo } from '../../components/student/LastUpdateInfo';
import { Navigation, Compass, ExternalLink, Radio, RefreshCw, Sparkles, MapPin } from 'lucide-react';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState({
    student_name: '',
    register_number: '',
    stop_name: '',
    assigned_bus: {
      id: '',
      bus_number: '',
      status: 'WORKING',
      bus_locations: null,
      bus_incharges: null
    },
    last_location_update: null
  });

  const isMountedRef = useRef(true);

  const fetchStudentData = useCallback(async (isBackground = false) => {
    try {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const studentId = localStorage.getItem('studentId');
      const userId = localStorage.getItem('userId');
      const targetId = studentId || userId || 'current';

      const response = await apiClient.get(`/student/dashboard/${targetId}`);

      if (response.data?.success && isMountedRef.current) {
        const data = response.data.data;
        setStudentData(data);
        setError('');
      } else if (isMountedRef.current) {
        setError(response.data?.message || 'Failed to load student dashboard');
      }
    } catch (err) {
      console.error('Student dashboard error:', err);
      if (isMountedRef.current) {
        // If 404, provide a helpful guidance message
        if (err.response?.status === 404) {
          setError('Student profile or assigned bus details could not be found. Please contact administration.');
        } else {
          setError(err.response?.data?.message || err.message || 'Error fetching dashboard data');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchStudentData(false);

    // Auto-refresh location every 15 seconds
    const interval = setInterval(() => {
      fetchStudentData(true);
    }, 15000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchStudentData]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const assignedBus = studentData.assigned_bus;
  const busLocation = assignedBus?.bus_locations;
  const busIncharge = assignedBus?.bus_incharges;
  const isBusWorking = assignedBus?.status === 'WORKING';
  const hasCoordinates = busLocation && typeof busLocation.latitude === 'number' && typeof busLocation.longitude === 'number';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Student Transit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {studentData.student_name || 'Student'}! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1.5 max-w-xl">
              {isBusWorking 
                ? 'Your assigned bus telemetry is active. Live location refreshes every 15 seconds.' 
                : 'Your assigned bus is currently offline or awaiting route start.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => fetchStudentData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Updating...' : 'Sync Telemetry'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <ErrorAlert
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}

      {/* Student Profile Card */}
      <StudentInfoCard
        studentName={studentData.student_name}
        registerNumber={studentData.register_number}
        assignedBus={assignedBus}
        stopName={studentData.stop_name}
      />

      {/* Main Content Grid: Bus Info & Location Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Bus Information */}
        <BusInfoCard bus={assignedBus} />

        {/* Bus Location Information */}
        <BusLocationCard busLocation={busLocation} />
      </div>

      {/* Live Visual Map / Telematics Radar */}
      <Card className="p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Live Visual Radar &amp; Transit Map</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive satellite &amp; telematics radar tracking display
            </p>
          </div>

          {hasCoordinates && (
            <a
              href={`https://maps.google.com/?q=${busLocation.latitude},${busLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold transition-colors"
            >
              <span>Full Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Radar Map Canvas Container */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {/* Background Coordinates Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30" />

          {/* Animated Radar Pulse Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full border border-blue-500/10 animate-ping opacity-20 duration-1000" />
            <div className="w-80 h-80 rounded-full border border-indigo-500/20" />
            <div className="w-60 h-60 rounded-full border border-blue-500/30" />
            <div className="w-40 h-40 rounded-full border border-cyan-500/40" />
            <div className="w-20 h-20 rounded-full border border-blue-400/50" />
          </div>

          {/* Radar Center Content */}
          <div className="relative z-10 text-center p-6 max-w-md">
            {hasCoordinates ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 ring-4 ring-blue-500/20">
                    <Navigation className="w-10 h-10 transform rotate-45 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950" />
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-emerald-400 mb-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>GPS Telemetry Locked</span>
                </div>

                <h4 className="text-xl font-bold text-white tracking-tight">
                  {assignedBus?.bus_number || 'Transit Bus'}
                </h4>

                <p className="text-xs text-slate-400 font-mono mt-1">
                  Lat: {busLocation.latitude.toFixed(5)} &bull; Lon: {busLocation.longitude.toFixed(5)}
                </p>

                {studentData.stop_name && (
                  <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-amber-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Stop: <strong>{studentData.stop_name}</strong></span>
                  </div>
                )}

                <a
                  href={`https://maps.google.com/?q=${busLocation.latitude},${busLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps Application</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-4">
                  <Radio className="w-8 h-8 animate-pulse text-slate-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-200">
                  Awaiting GPS Coordinates
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                  The bus tracking system has not received real-time coordinates for this bus yet. The dashboard auto-syncs every 15 seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Auto-Refresh Status Card */}
      <LastUpdateInfo
        lastUpdateTime={studentData.last_location_update || busLocation?.updated_at}
        isRefreshing={refreshing}
        onManualRefresh={() => fetchStudentData(true)}
      />
    </div>
  );
}
