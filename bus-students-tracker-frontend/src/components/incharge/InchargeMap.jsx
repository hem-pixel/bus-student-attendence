import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Radio, Activity } from 'lucide-react';
import { Button } from '../common/Button';

export const InchargeMap = ({ location, busNumber = '', status = 'WORKING' }) => {
  const hasCoordinates = location && typeof location.latitude === 'number' && typeof location.longitude === 'number' && location.latitude !== 0;
  
  const googleMapsUrl = hasCoordinates 
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : '#';

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative min-h-[380px] flex flex-col justify-between p-6 sm:p-8">
      {/* Background Radar Simulation Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Decorative Radar Sweep Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full border border-blue-500/20 animate-ping opacity-20 duration-1000" />
        <div className="w-60 h-60 rounded-full border border-indigo-500/30" />
        <div className="w-40 h-40 rounded-full border border-blue-500/40" />
        <div className="w-20 h-20 rounded-full border border-cyan-500/50" />
      </div>

      {/* Top Header info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300 font-semibold">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Telematics Radar Active</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === 'WORKING' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          {status === 'WORKING' ? 'Online & Transmitting' : 'Offline / Maintenance'}
        </span>
      </div>

      {/* Center Radar Icon & Info */}
      <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center justify-center">
        {hasCoordinates ? (
          <>
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 ring-4 ring-blue-500/20">
                <Navigation className="w-10 h-10 transform rotate-45 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {busNumber || 'Assigned Transit Bus'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Current Geolocation Coordinates
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-blue-300">
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                LAT: <strong className="text-white">{Number(location.latitude).toFixed(6)}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                LNG: <strong className="text-white">{Number(location.longitude).toFixed(6)}</strong>
              </span>
              {location.speed !== undefined && (
                <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
                  SPD: <strong className="text-white">{location.speed} km/h</strong>
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
              <MapPin className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">No GPS Fix Available</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Waiting for driver telemetry beacon or hardware GPS update to establish satellite triangulation.
            </p>
          </>
        )}
      </div>

      {/* Bottom Footer Details */}
      <div className="relative z-10 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {location?.updated_at 
              ? `Last Beacon: ${new Date(location.updated_at).toLocaleTimeString()}` 
              : 'Status: Awaiting signal'}
          </span>
        </div>

        {hasCoordinates && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
