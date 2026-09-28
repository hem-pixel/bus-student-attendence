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
  Sparkles,
  Play,
  Pause,
  Smartphone,
  Navigation2,
  Route as RouteIcon
} from 'lucide-react';
import { apiClient } from '../../services/api';
import SocketService from '../../services/socketService';
import { useSocket } from '../../hooks/useSocket';
import { useGPS } from '../../hooks/useGPS';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { MapView } from '../../components/MapView';
import { GPSStatusBadge } from '../../components/GPSStatusBadge';

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

  const [locationHistory, setLocationHistory] = useState([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  // GPS Broadcast states (for driver / in-charge device)
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulatorRef = useRef(null);

  // Hook for native GPS tracking on this device
  const { 
    location: gpsCoords, 
    error: gpsError, 
    isTracking 
  } = useGPS(isBroadcasting);

  // Real-time WebSocket hook for assigned bus
  const { 
    location: wsLocation, 
    isConnected: socketConnected 
  } = useSocket(busData.id);

  // Load Bus Information
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

        // Also fetch historical breadcrumbs and distance traveled
        if (foundBus.id) {
          fetchHistoryAndDistance(foundBus.id);
        }
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

  const fetchHistoryAndDistance = async (busId) => {
    try {
      const [histRes, distRes] = await Promise.allSettled([
        apiClient.get(`/locations/${busId}/history?limit=30`),
        apiClient.get(`/locations/${busId}/distance-traveled`)
      ]);

      if (histRes.status === 'fulfilled' && histRes.value.data?.success) {
        setLocationHistory(histRes.value.data.data || []);
      }

      if (distRes.status === 'fulfilled' && distRes.value.data?.success) {
        setDistanceTraveled(distRes.value.data.data?.distance_km || 0);
      }
    } catch (e) {
      console.warn('Could not load history or distance metrics', e);
    }
  };

  useEffect(() => {
    fetchBusData();
    const interval = setInterval(() => {
      fetchBusData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchBusData]);

  // When WebSocket pushes an updated location, update busData.bus_locations & append to history
  useEffect(() => {
    if (wsLocation && wsLocation.latitude && wsLocation.longitude) {
      setBusData(prev => ({
        ...prev,
        bus_locations: {
          ...prev.bus_locations,
          ...wsLocation,
          latitude: Number(wsLocation.latitude),
          longitude: Number(wsLocation.longitude),
          speed: wsLocation.speed !== undefined ? wsLocation.speed : prev.bus_locations?.speed || 0,
          updated_at: wsLocation.timestamp || new Date().toISOString()
        }
      }));

      setLocationHistory(prev => {
        const point = {
          latitude: Number(wsLocation.latitude),
          longitude: Number(wsLocation.longitude),
          speed: wsLocation.speed || 0,
          recorded_at: wsLocation.timestamp || new Date().toISOString()
        };
        // Keep max 50 points
        return [...prev.slice(-49), point];
      });

      setLastRefreshed(new Date());
    }
  }, [wsLocation]);

  // Handle native device GPS updates and broadcast to server
  useEffect(() => {
    if (isBroadcasting && gpsCoords && busData.id) {
      const payload = {
        busId: busData.id,
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
        speed: gpsCoords.speed,
        bearing: gpsCoords.bearing || 0,
        accuracy: gpsCoords.accuracy || 10,
        altitude: gpsCoords.altitude || 0
      };

      // 1. Emit instantly through WebSocket
      SocketService.sendDriverLocation(payload);

      // 2. Persist to backend database via REST endpoint
      apiClient.post('/locations/update', payload).catch(err => {
        console.warn('REST location update sync error:', err.message);
      });
    }
  }, [isBroadcasting, gpsCoords, busData.id]);

  // Route Simulator implementation for testing indoors or without real bus
  const toggleSimulator = () => {
    if (isSimulating) {
      clearInterval(simulatorRef.current);
      simulatorRef.current = null;
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      // Base coordinates (Chennai Transit Corridor)
      let curLat = busData.bus_locations?.latitude || 13.0827;
      let curLng = busData.bus_locations?.longitude || 80.2707;
      let angle = 0;

      simulatorRef.current = setInterval(() => {
        angle += 0.2;
        // Move along a realistic path (~35-45 km/h)
        curLat += (Math.cos(angle) * 0.0008) + 0.0003;
        curLng += (Math.sin(angle) * 0.0008) + 0.0002;
        const speed = Math.floor(28 + (Math.sin(angle * 2) * 15));

        const simPayload = {
          busId: busData.id,
          latitude: parseFloat(curLat.toFixed(6)),
          longitude: parseFloat(curLng.toFixed(6)),
          speed,
          heading: Math.floor((angle * 57.3) % 360),
          accuracy: 5
        };

        // Emit through WebSocket & REST
        SocketService.sendDriverLocation(simPayload);
        apiClient.post('/locations/update', simPayload).catch(() => {});
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (simulatorRef.current) clearInterval(simulatorRef.current);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const location = busData.bus_locations;
  const isWorking = busData.status === 'WORKING';
  const hasCoordinates = location && typeof location.latitude === 'number' && typeof location.longitude === 'number' && location.latitude !== 0;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar 
          title="Vehicle Telematics & Live Map" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Real-Time GPS Telematics</span>
                </span>

                <GPSStatusBadge 
                  signalStrength={location?.accuracy ? (location.accuracy < 15 ? 5 : location.accuracy < 30 ? 4 : 3) : 3} 
                  accuracy={location?.accuracy || 10} 
                  isTracking={socketConnected || isTracking || isSimulating} 
                />

                <span className="text-xs text-slate-400 font-medium">
                  {socketConnected ? '🟢 WebSocket Live' : '🟠 Polling Fallback'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Bus Route Radar &amp; Location
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Satellite GPS positioning, route breadcrumb trail, and driver telematics broadcast.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Broadcast Device GPS Toggle */}
              <button
                type="button"
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isBroadcasting 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 ring-2 ring-emerald-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Transmit GPS coordinates from this device to the server"
              >
                <Smartphone className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>{isBroadcasting ? 'Broadcasting Device GPS' : 'Broadcast My GPS'}</span>
              </button>

              {/* Transit Simulator Toggle */}
              <button
                type="button"
                onClick={toggleSimulator}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isSimulating 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30 ring-2 ring-amber-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Simulate continuous bus movement along the route"
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stop Simulator</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Route</span>
                  </>
                )}
              </button>

              {/* Sync Radar Button */}
              <button
                type="button"
                onClick={() => fetchBusData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
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

          {gpsError && isBroadcasting && (
            <ErrorAlert
              message={`GPS Sensor Warning: ${gpsError}. Check browser location permissions.`}
              type="warning"
              onClose={() => {}}
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Leaflet MapView */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-2 sm:p-4">
                <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Telematics Route Map
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <RouteIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{locationHistory.length} Waypoints Tracked</span>
                  </div>
                </div>

                <div className="w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden relative">
                  <MapView
                    center={hasCoordinates ? [location.latitude, location.longitude] : [13.0827, 80.2707]}
                    zoom={15}
                    currentLocation={hasCoordinates ? location : null}
                    history={locationHistory}
                    busNumber={busData.bus_number}
                    busId={busData.id}
                    speed={location?.speed}
                    height="100%"
                  />
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Radar Sync: {lastRefreshed.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isSimulating && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                      Simulator Active
                    </span>
                  )}
                  {isBroadcasting && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      GPS Broadcasting
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Real-Time Stream Active</span>
                  </div>
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

                {/* Distance Traveled Pill */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-300 font-medium">Distance Traveled Today</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">
                    {distanceTraveled > 0 ? `${distanceTraveled} km` : '0.0 km'}
                  </span>
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
                      {location?.latitude ? Number(location.latitude).toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400">Longitude</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {location?.longitude ? Number(location.longitude).toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speed</span>
                    </span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">
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
