import React, { useEffect, useRef } from 'react';

export const Map = ({ buses = [], selectedBusId, onBusSelect }) => {
  const mapContainer = useRef(null);

  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];

  useEffect(() => {
    if (!mapContainer.current) return;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
      {/* Map Container View */}
      <div
        ref={mapContainer}
        className="flex-1 rounded-2xl shadow-md overflow-hidden relative border border-gray-200 bg-slate-900"
      >
        {/* Interactive simulated radar/GIS Map View with visual markers */}
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center">
          {/* Map Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}
          />

          {/* Compass / Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">LIVE GPS RADAR</span>
            <span className="text-slate-400">| {buses.length} online</span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button className="w-9 h-9 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 flex items-center justify-center text-sm shadow">
              +
            </button>
            <button className="w-9 h-9 rounded-xl bg-slate-800/90 text-white font-bold hover:bg-slate-700 flex items-center justify-center text-sm shadow">
              -
            </button>
          </div>

          {/* Bus markers on the visual canvas */}
          {buses.map((bus, idx) => {
            const isSelected = selectedBus && selectedBus.id === bus.id;
            // Spread positions deterministically across the visual board
            const positions = [
              { top: '35%', left: '42%' },
              { top: '55%', left: '60%' },
              { top: '65%', left: '30%' },
              { top: '25%', left: '68%' },
              { top: '48%', left: '20%' },
              { top: '75%', left: '50%' }
            ];
            const pos = positions[idx % positions.length];

            return (
              <div
                key={bus.id}
                onClick={() => onBusSelect(bus.id)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 group ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div className={`relative flex items-center justify-center rounded-full p-2 text-xl shadow-lg transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400/50 shadow-blue-500/50'
                    : bus.status === 'WORKING'
                    ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                    : 'bg-rose-600 text-white shadow-rose-900/50'
                }`}>
                  🚌
                  {isSelected && (
                    <span className="absolute -inset-1 rounded-full animate-ping bg-blue-400 opacity-40"></span>
                  )}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1 bg-slate-900/90 text-white text-xs rounded-lg whitespace-nowrap shadow-lg border border-slate-700 font-semibold pointer-events-none">
                  {bus.bus_number}
                </div>
              </div>
            );
          })}

          {/* Central Selected Bus Card if selected */}
          {selectedBus ? (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-2xl text-white z-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Active Telemetry</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  selectedBus.status === 'WORKING' ? 'bg-emerald-900/70 text-emerald-300' : 'bg-rose-900/70 text-rose-300'
                }`}>
                  {selectedBus.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedBus.bus_number}</h3>
              <p className="text-xs text-slate-300 mb-2">
                Driver: {selectedBus.drivers?.name || selectedBus.driver_name || 'Assigned Driver'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/70 p-2.5 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400 block">Latitude</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {selectedBus.bus_locations?.latitude?.toFixed(5) || selectedBus.latitude?.toFixed(5) || '13.0827'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Longitude</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {selectedBus.bus_locations?.longitude?.toFixed(5) || selectedBus.longitude?.toFixed(5) || '80.2707'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/80 p-8 max-w-md">
              <div className="text-5xl mb-3">📍</div>
              <h3 className="text-xl font-bold text-white mb-1">Live Map Tracker</h3>
              <p className="text-xs text-slate-300">
                Select a bus from the active roster on the right to focus the tracking radar and inspect coordinates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buses Sidebar */}
      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Active Fleet</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-xs">
              {buses.length} tracked
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Real-time GPS status</p>
        </div>

        {/* Bus List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {buses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-3xl block mb-2">📡</span>
              <p className="font-medium text-gray-700">No active telemetry</p>
              <p className="text-xs text-gray-400 mt-1">Buses with active GPS locations will automatically appear here.</p>
            </div>
          ) : (
            buses.map(bus => (
              <div
                key={bus.id}
                onClick={() => onBusSelect(bus.id)}
                className={`p-4 cursor-pointer transition-all duration-150 ${
                  selectedBusId === bus.id
                    ? 'bg-blue-50/80 border-l-4 border-l-blue-600 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{bus.bus_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lat: {bus.bus_locations?.latitude?.toFixed(4) || bus.latitude?.toFixed(4) || '13.0827'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lon: {bus.bus_locations?.longitude?.toFixed(4) || bus.longitude?.toFixed(4) || '80.2707'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      bus.status === 'WORKING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
