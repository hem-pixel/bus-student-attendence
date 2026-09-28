import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Navigation, 
  Radio, 
  MapPin, 
  Compass, 
  User, 
  Search,
  Activity,
  Gauge,
  ExternalLink,
  Layers
} from 'lucide-react';
import { MapView } from '../MapView';
import { GPSStatusBadge } from '../GPSStatusBadge';
import apiClient from '../../services/api';

export const Map = ({ buses = [], selectedBusId, onBusSelect }) => {
  const [busSearch, setBusSearch] = useState('');
  const [historyLocations, setHistoryLocations] = useState([]);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'fleet'
  const [loadingHistory, setLoadingHistory] = useState(false);

  const selectedBus = buses.find(b => String(b.id) === String(selectedBusId)) || buses[0];

  // Fetch location history when selected bus changes
  useEffect(() => {
    if (!selectedBus) return;

    let isMounted = true;
    setLoadingHistory(true);

    apiClient
      .get(`/locations/${selectedBus.id}/history?hours=4`)
      .then((res) => {
        if (isMounted) {
          const list = res.data?.data || [];
          if (list.length > 0) {
            setHistoryLocations(list);
          } else {
            // Fallback to current bus position if history is empty
            const currentLat = selectedBus.bus_locations?.latitude || selectedBus.latitude || 10.7624;
            const currentLng = selectedBus.bus_locations?.longitude || selectedBus.longitude || 78.7624;
            setHistoryLocations([{
              latitude: currentLat,
              longitude: currentLng,
              speed: selectedBus.speed || 0,
              accuracy: 10,
              timestamp: new Date().toISOString(),
            }]);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch bus history:', err.message);
        if (isMounted) {
          const currentLat = selectedBus.bus_locations?.latitude || selectedBus.latitude || 10.7624;
          const currentLng = selectedBus.bus_locations?.longitude || selectedBus.longitude || 78.7624;
          setHistoryLocations([{
            latitude: currentLat,
            longitude: currentLng,
            speed: selectedBus.speed || 0,
            accuracy: 10,
            timestamp: new Date().toISOString(),
          }]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBus?.id]);

  const filteredBuses = buses.filter(b => 
    (b.bus_number || b.registration_number || '').toLowerCase().includes(busSearch.toLowerCase()) ||
    (b.drivers?.name || b.driver_name || '').toLowerCase().includes(busSearch.toLowerCase()) ||
    (b.route || '').toLowerCase().includes(busSearch.toLowerCase())
  );

  const fleetLocations = buses.map(b => ({
    id: b.id,
    bus_id: b.id,
    registration_number: b.registration_number || b.bus_number,
    bus_number: b.bus_number || b.registration_number,
    route: b.route,
    status: b.status,
    latitude: b.bus_locations?.latitude || b.latitude || 10.7624,
    longitude: b.bus_locations?.longitude || b.longitude || 78.7624,
    speed: b.bus_locations?.speed || b.speed || 0,
    updated_at: b.bus_locations?.updated_at || b.updated_at || b.bus_locations?.timestamp,
  }));

  const activeLat = selectedBus?.bus_locations?.latitude || selectedBus?.latitude || (historyLocations[historyLocations.length - 1]?.latitude) || 10.7624;
  const activeLng = selectedBus?.bus_locations?.longitude || selectedBus?.longitude || (historyLocations[historyLocations.length - 1]?.longitude) || 78.7624;
  const activeSpeed = selectedBus?.bus_locations?.speed || selectedBus?.speed || (historyLocations[historyLocations.length - 1]?.speed) || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[680px] font-sans">
      {/* Map Canvas Container */}
      <div className="flex-1 rounded-2xl shadow-2xl overflow-hidden relative border border-slate-800 bg-slate-950 flex flex-col">
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Top Left: Live GPS Status Badge */}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-3">
            <GPSStatusBadge 
              signalStrength={4} 
              accuracy={8} 
              isTracking={true} 
            />
            <span className="hidden sm:inline-block text-xs font-mono text-slate-300">
              {viewMode === 'fleet' ? 'Fleet Overview' : `Tracking: ${selectedBus?.registration_number || selectedBus?.bus_number || 'Bus'}`}
            </span>
          </div>

          {/* Top Right: Toggle View Mode */}
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Route View
            </button>
            <button
              onClick={() => setViewMode('fleet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'fleet'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Fleet ({buses.length})
            </button>
          </div>
        </div>

        {/* Leaflet Map Container */}
        <div className="w-full h-full relative">
          <MapView
            locations={viewMode === 'single' ? historyLocations : []}
            busInfo={selectedBus}
            fleet={viewMode === 'fleet' ? fleetLocations : null}
            selectedBusId={selectedBus?.id}
            onSelectBus={(busId) => {
              if (onBusSelect) onBusSelect(busId);
              setViewMode('single');
            }}
            centerLat={activeLat}
            centerLng={activeLng}
          />
        </div>

        {/* Bottom HUD: Active Selected Bus Telemetry Panel */}
        {selectedBus && viewMode === 'single' && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4.5 border border-slate-700/80 shadow-2xl text-white z-20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                </span>
                <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider">Live Telemetry Transponder</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                selectedBus.status === 'WORKING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {selectedBus.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {selectedBus.registration_number || selectedBus.bus_number}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {selectedBus.route || 'Campus Route'}
              </span>
            </div>

            {/* Coordinates & Sensor Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 mb-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Latitude</span>
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  {Number(activeLat).toFixed(5)}° N
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Longitude</span>
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  {Number(activeLng).toFixed(5)}° E
                </span>
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Speed</span>
                <span className="font-mono text-blue-400 font-semibold text-xs flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  {activeSpeed} km/h
                </span>
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 text-[10px] uppercase font-medium block">Trajectory</span>
                <span className="font-mono text-indigo-400 font-semibold text-xs flex items-center gap-1">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  {historyLocations.length} points
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <a
                href={`https://maps.google.com/?q=${activeLat},${activeLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Google Maps
              </a>
              <span className="text-slate-500 text-[11px] font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Telemetry Sidebar Drawer */}
      <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col backdrop-blur-sm">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Roster</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold rounded-full text-xs font-mono">
              {buses.length} online
            </span>
          </div>

          {/* Quick Bus Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={busSearch}
              onChange={(e) => setBusSearch(e.target.value)}
              placeholder="Search registration or route..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bus List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {filteredBuses.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Radio className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300 text-sm">No vehicles matched</p>
              <p className="text-xs text-slate-500 mt-1">Adjust search filter to see available fleet units.</p>
            </div>
          ) : (
            filteredBuses.map(bus => {
              const isSelected = selectedBusId && String(selectedBusId) === String(bus.id);
              const isWorking = bus.status === 'WORKING';
              const bLat = bus.bus_locations?.latitude || bus.latitude || 10.76;
              const bLng = bus.bus_locations?.longitude || bus.longitude || 78.76;

              return (
                <div
                  key={bus.id}
                  onClick={() => {
                    if (onBusSelect) onBusSelect(bus.id);
                    setViewMode('single');
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                          {bus.registration_number || bus.bus_number}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-500" />
                        {bus.route || 'Campus Route'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                        <span>Lat: {Number(bLat).toFixed(3)}</span>
                        <span>•</span>
                        <span>Lon: {Number(bLng).toFixed(3)}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        isWorking
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {bus.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Live WebSockets Stream
          </span>
          <span className="font-mono text-[10px] text-slate-500">Auto-Synced</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
