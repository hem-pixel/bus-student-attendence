import React from 'react';
import { Card } from '../common/Card';
import { MapPin, Navigation, Gauge, Clock, ExternalLink, Radio } from 'lucide-react';

export const BusLocationCard = ({ busLocation }) => {
  if (!busLocation || (!busLocation.latitude && !busLocation.longitude)) {
    return (
      <Card className="border-l-4 border-l-slate-300 dark:border-l-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-center py-10">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Radio className="w-7 h-7 animate-pulse text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Live Location Stream
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Live telemetry is currently offline or the driver has not yet started today's route.
          </p>
        </div>
      </Card>
    );
  }

  const lat = typeof busLocation.latitude === 'number' ? busLocation.latitude : parseFloat(busLocation.latitude);
  const lon = typeof busLocation.longitude === 'number' ? busLocation.longitude : parseFloat(busLocation.longitude);
  const speed = busLocation.speed != null ? Math.round(Number(busLocation.speed)) : null;
  const updateTimestamp = busLocation.updated_at || busLocation.created_at;

  return (
    <Card className="border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          <span>Live Location Telemetry</span>
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Signal Active
        </span>
      </div>

      <div className="space-y-4">
        {/* Coordinates Display */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2">
            GPS Coordinates
          </p>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-sans">Latitude</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {Number.isFinite(lat) ? lat.toFixed(5) : 'N/A'}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-400 block font-sans">Longitude</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {Number.isFinite(lon) ? lon.toFixed(5) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Speed and Last Update */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Current Speed</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {speed !== null ? speed : 0}
              </span>
              <span className="text-xs text-slate-500 font-semibold">km/h</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Signal Timestamp</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {updateTimestamp ? new Date(updateTimestamp).toLocaleTimeString() : 'Just now'}
            </p>
          </div>
        </div>

        {/* External Google Maps Button */}
        {Number.isFinite(lat) && Number.isFinite(lon) && (
          <a
            href={`https://maps.google.com/?q=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        )}
      </div>
    </Card>
  );
};

export default BusLocationCard;
