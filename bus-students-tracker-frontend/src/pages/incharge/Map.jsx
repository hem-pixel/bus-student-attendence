import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  MapPin, 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  Bus, 
  User, 
  Phone, 
  Gauge, 
  Compass, 
  Clock, 
  ShieldCheck, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { InchargeMap } from '../../components/incharge/InchargeMap';

export default function Map() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [busData, setBusData] = useState({
    id: '',
    bus_number: '',
    status: 'WORKING',
    drivers: null,
    bus_locations: null
  });

  const intervalRef = useRef(null);

  const fetchBusData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      let foundBus = null;
      // 1. Try /incharge/bus
      try {
        const busRes = await apiClient.get('/incharge/bus');
        if (busRes.data?.success && busRes.data?.data) {
          foundBus = busRes.data.data;
        }
      } catch (busErr) {
        // Fallback to /incharge/dashboard
        const dashRes = await apiClient.get('/incharge/dashboard');
        if (dashRes.data?.success && dashRes.data?.data?.bus) {
          foundBus = dashRes.data.data.bus;
        }
      }

      if (foundBus) {
        setBusData(foundBus);
        setError('');
        setLastRefreshed(new Date());
      } else {
        setError('No assigned bus telematics found for your account.');
      }
    } catch (err) {
      console.error('Error fetching bus location:', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with telematics gateway');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBusData();

    // Auto-refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchBusData(true);
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBusData]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const location = busData.bus_locations;
  const isWorking = busData.status === 'WORKING';
  const hasCoordinates = location && typeof location.latitude === 'number' && location.latitude !== 0;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar 
          title="Vehicle Telematics & Radar" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>GPS Telematics Live Stream</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Auto-refreshing every 10s
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Bus Route Radar & Location
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Real-time satellite positioning and velocity tracking for assigned fleet unit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchBusData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync Radar'}</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: InchargeMap Radar HUD */}
            <div className="lg:col-span-2 space-y-4">
              <InchargeMap 
                location={location} 
                busNumber={busData.bus_number} 
                status={busData.status}
              />

              {/* Status Banner */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Radar Sync: {lastRefreshed.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Continuous 10s Heartbeat Active</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Telemetry Sidebar Details */}
            <div className="space-y-4">
              {/* Bus Status Card */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unit Telemetry</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isWorking 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isWorking ? 'Operational' : 'Service Alert'}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-medium">Assigned Vehicle</p>
                  <p className="text-2xl font-black text-white tracking-tight mt-0.5">
                    {busData.bus_number || 'Unassigned'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Route: <span className="text-slate-200 font-semibold">{busData.route_name || 'Standard Transit Corridor'}</span>
                  </p>
                </div>

                {/* Driver Info */}
                {busData.drivers && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Driver</p>
                    <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{busData.drivers.name}</p>
                          <p className="text-[11px] text-slate-400">{busData.drivers.phone_number}</p>
                        </div>
                      </div>

                      {busData.drivers.phone_number && (
                        <a
                          href={`tel:${busData.drivers.phone_number}`}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          title="Call Driver"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinates Readout Card */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Telemetry Coordinates
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400">Latitude</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {location?.latitude ? location.latitude.toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400">Longitude</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {location?.longitude ? location.longitude.toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speed</span>
                    </span>
                    <span className="text-xs font-bold text-cyan-400">
                      {location?.speed !== null && location?.speed !== undefined ? `${location.speed} km/h` : '0 km/h'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400">Last Telemetry Ping</span>
                    <span className="text-[11px] text-slate-300">
                      {location?.updated_at ? new Date(location.updated_at).toLocaleTimeString() : 'No beacon'}
                    </span>
                  </div>
                </div>

                {hasCoordinates && (
                  <a
                    href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <span>View in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
