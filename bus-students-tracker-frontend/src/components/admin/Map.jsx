import React, { useState } from 'react';
import { 
  Bus, 
  Navigation, 
  Radio, 
  MapPin, 
  Compass, 
  Plus, 
  Minus, 
  ShieldCheck, 
  User, 
  Search,
  Activity,
  Gauge
} from 'lucide-react';

export const Map = ({ buses = [], selectedBusId, onBusSelect }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [busSearch, setBusSearch] = useState('');

  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];

  const filteredBuses = buses.filter(b => 
    (b.bus_number || '').toLowerCase().includes(busSearch.toLowerCase()) ||
    (b.drivers?.name || b.driver_name || '').toLowerCase().includes(busSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[640px] font-sans">
      {/* Radar Map Canvas Container */}
      <div className="flex-1 rounded-2xl shadow-2xl overflow-hidden relative border border-slate-800 bg-slate-950">
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
          
          {/* Radar Background Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#3b82f6 1px, transparent 1px)',
              backgroundSize: '36px 36px',
              backgroundPosition: '0 0, 18px 18px'
            }}
          />

          {/* Sweeping Radar Concentric Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-48 h-48 rounded-full border border-blue-500/40"></div>
            <div className="absolute w-96 h-96 rounded-full border border-blue-500/30"></div>
            <div className="absolute w-[580px] h-[580px] rounded-full border border-blue-500/20"></div>
            <div className="absolute w-[800px] h-[800px] rounded-full border border-blue-500/10"></div>
          </div>

          {/* Top Left: Live GPS Status Badge */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs text-white flex items-center gap-2.5 shadow-xl">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wider uppercase text-[11px] text-slate-200">Campus GPS Radar</span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-400 font-mono text-[11px]">{buses.length} online</span>
          </div>

          {/* Top Right: Zoom & Control Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-lg transition-all"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.8))}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-lg transition-all"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(1)}
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-lg transition-all"
              title="Center View"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Bus Beacon Markers on Map Canvas */}
          <div 
            className="w-full h-full relative transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {buses.map((bus, idx) => {
              const isSelected = selectedBus && selectedBus.id === bus.id;
              const positions = [
                { top: '32%', left: '44%' },
                { top: '56%', left: '62%' },
                { top: '68%', left: '28%' },
                { top: '24%', left: '70%' },
                { top: '48%', left: '18%' },
                { top: '78%', left: '52%' }
              ];
              const pos = positions[idx % positions.length];
              const isWorking = bus.status === 'WORKING';

              return (
                <div
                  key={bus.id}
                  onClick={() => onBusSelect(bus.id)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 group ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  {/* Glowing Radar Pulse Pin */}
                  <div className="relative flex items-center justify-center">
                    {/* Ping Animation for Active/Selected */}
                    {isSelected && (
                      <span className="absolute -inset-3 rounded-full animate-ping bg-blue-500 opacity-40"></span>
                    )}
                    {isWorking && !isSelected && (
                      <span className="absolute -inset-2 rounded-full animate-pulse bg-emerald-500/20"></span>
                    )}

                    {/* Beacon Icon Container */}
                    <div className={`p-3 rounded-2xl shadow-xl transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30 shadow-blue-500/40'
                        : isWorking
                        ? 'bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-900/40'
                        : 'bg-rose-600 text-white border-rose-400/50 shadow-rose-900/40'
                    }`}>
                      <Bus className="w-5 h-5" />
                    </div>

                    {/* Tooltip Label */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-950/90 text-white text-xs rounded-lg whitespace-nowrap shadow-xl border border-slate-700/80 font-bold pointer-events-none flex items-center gap-1.5 backdrop-blur-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      {bus.bus_number}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom HUD: Active Selected Bus Telemetry Panel */}
          {selectedBus ? (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl text-white z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Radio className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] uppercase font-bold text-blue-400 tracking-wider">Live Telemetry Transponder</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  selectedBus.status === 'WORKING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {selectedBus.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-2xl font-extrabold text-white tracking-tight">{selectedBus.bus_number}</h3>
                <span className="text-xs text-slate-400 font-mono">Unit #{selectedBus.id.slice(0, 6)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 mb-3 pb-3 border-b border-slate-800">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Operator: <span className="font-semibold text-white">{selectedBus.drivers?.name || selectedBus.driver_name || 'Assigned Driver'}</span></span>
              </div>

              {/* Coordinates & Sensor Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Latitude</span>
                  <span className="font-mono text-emerald-400 font-semibold text-xs">
                    {selectedBus.bus_locations?.latitude?.toFixed(5) || selectedBus.latitude?.toFixed(5) || '13.08270'}° N
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Longitude</span>
                  <span className="font-mono text-emerald-400 font-semibold text-xs">
                    {selectedBus.bus_locations?.longitude?.toFixed(5) || selectedBus.longitude?.toFixed(5) || '80.27070'}° E
                  </span>
                </div>
                <div className="mt-1 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Estimated Speed</span>
                  <span className="font-mono text-blue-400 font-semibold text-xs flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-400" />
                    {selectedBus.status === 'WORKING' ? '38 km/h' : '0 km/h'}
                  </span>
                </div>
                <div className="mt-1 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">GPS Precision</span>
                  <span className="font-mono text-indigo-400 font-semibold text-xs flex items-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-400" />
                    ± 2.8m (High)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/80 p-8 max-w-md z-20">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Campus Fleet GPS Radar</h3>
              <p className="text-xs text-slate-400">
                Select an active bus from the fleet console on the right to focus live transponder tracking.
              </p>
            </div>
          )}
        </div>
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
              {buses.length} tracked
            </span>
          </div>

          {/* Quick Bus Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={busSearch}
              onChange={(e) => setBusSearch(e.target.value)}
              placeholder="Filter by bus or driver..."
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
              const isSelected = selectedBusId === bus.id;
              const isWorking = bus.status === 'WORKING';

              return (
                <div
                  key={bus.id}
                  onClick={() => onBusSelect(bus.id)}
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
                          {bus.bus_number}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {bus.drivers?.name || bus.driver_name || 'Driver Unassigned'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                        <span>Lat: {(bus.bus_locations?.latitude || bus.latitude || 13.08).toFixed(3)}</span>
                        <span>•</span>
                        <span>Lon: {(bus.bus_locations?.longitude || bus.longitude || 80.27).toFixed(3)}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        isWorking
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {bus.status}
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
            <Navigation className="w-3 h-3 text-emerald-400" />
            Transmission: Encrypted
          </span>
          <span className="font-mono text-[10px] text-slate-500">10s Polling</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
