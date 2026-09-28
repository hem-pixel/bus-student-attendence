import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import SocketService from '../../services/socketService';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Map } from '../../components/admin/Map';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Button } from '../../components/common/Button';
import { 
  Radio, 
  RotateCw, 
  Satellite, 
  ShieldCheck, 
  Activity, 
  Bus,  
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function LiveTrack() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchBuses();

    // Subscribe to real-time WebSocket fleet updates
    const handleFleetUpdate = (data) => {
      if (!data || !data.busId) return;
      const updatedBusId = data.busId;
      const newLoc = data.location;

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (String(bus.id) === String(updatedBusId)) {
            return {
              ...bus,
              latitude: newLoc.latitude,
              longitude: newLoc.longitude,
              speed: newLoc.speed,
              bus_locations: {
                ...bus.bus_locations,
                ...newLoc,
              },
            };
          }
          return bus;
        })
      );
      setLastRefreshed(new Date());
    };

    SocketService.connect();
    SocketService.subscribeToFleet(handleFleetUpdate);

    // Auto-refresh fallback every 15 seconds
    const interval = setInterval(fetchBuses, 15000);

    return () => {
      clearInterval(interval);
      SocketService.unsubscribeFromFleet(handleFleetUpdate);
    };
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await apiClient.get('/locations');
      
      if (response.data && response.data.success) {
        const fleetData = response.data.data || [];
        setBuses(fleetData);
        if (fleetData.length > 0 && !selectedBusId) {
          setSelectedBusId(fleetData[0].id || fleetData[0].bus_id);
        }
        setLastRefreshed(new Date());
        setError('');
      } else {
        // Fallback to /admin/buses if /locations returned error
        const fallbackRes = await apiClient.get('/admin/buses');
        if (fallbackRes.data && fallbackRes.data.success) {
          setBuses(fallbackRes.data.data || []);
          if (fallbackRes.data.data.length > 0 && !selectedBusId) {
            setSelectedBusId(fallbackRes.data.data[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Live track fetch notice:', err.message);
      // Try /admin/buses fallback
      try {
        const fallbackRes = await apiClient.get('/admin/buses');
        if (fallbackRes.data && fallbackRes.data.success) {
          setBuses(fallbackRes.data.data || []);
          if (fallbackRes.data.data.length > 0 && !selectedBusId) {
            setSelectedBusId(fallbackRes.data.data[0].id);
          }
          setError('');
          return;
        }
      } catch (e) {
        // ignore
      }
      setError('Error fetching bus locations: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const activeCount = buses.filter(b => b.status === 'WORKING').length;
  const maintenanceCount = buses.filter(b => b.status !== 'WORKING').length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar title="Live Fleet Telemetry" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Fleet GPS Radar Console
                      </h1>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Real-time positional telemetry • Auto-sync every 10s • Last sync: <span className="font-mono text-slate-300">{lastRefreshed.toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchBuses}
                  className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Force Sync Now
                </Button>
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

            {/* Map Telemetry Component */}
            <Map
              buses={buses}
              selectedBusId={selectedBusId}
              onBusSelect={(id) => setSelectedBusId(id)}
            />

            {/* Telemetry Status Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telemetry Engine</h4>
                  <p className="text-sm font-bold text-white mt-0.5">Dual GPS & Cellular Uplink</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Status: Sub-second Stream</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Moving Fleet</h4>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{activeCount} Vehicles Transmitting</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">On designated college routes</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Idle / Depot Standby</h4>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">{maintenanceCount} Units Offline / Maintenance</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Parked at campus terminal</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
