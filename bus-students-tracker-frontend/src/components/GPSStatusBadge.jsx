import React from 'react';

/**
 * GPSStatusBadge Component: Displays GPS signal strength, accuracy, and live tracking status
 */
export function GPSStatusBadge({ signalStrength = 3, accuracy = 10, isTracking = false }) {
  const strength = Math.max(0, Math.min(5, Number(signalStrength) || 0));

  const getSignalMeta = () => {
    if (!isTracking) {
      return {
        label: 'Offline',
        color: 'text-gray-400 bg-gray-800/80 border-gray-700',
        dotColor: 'bg-gray-500',
        barColor: 'bg-gray-600',
      };
    }
    if (strength >= 4) {
      return {
        label: 'Strong',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
        dotColor: 'bg-emerald-400 animate-pulse',
        barColor: 'bg-emerald-400',
      };
    }
    if (strength >= 3) {
      return {
        label: 'Good',
        color: 'text-blue-400 bg-blue-950/60 border-blue-800/50',
        dotColor: 'bg-blue-400',
        barColor: 'bg-blue-400',
      };
    }
    if (strength >= 2) {
      return {
        label: 'Moderate',
        color: 'text-amber-400 bg-amber-950/60 border-amber-800/50',
        dotColor: 'bg-amber-400',
        barColor: 'bg-amber-400',
      };
    }
    return {
      label: 'Weak',
      color: 'text-rose-400 bg-rose-950/60 border-rose-800/50',
      dotColor: 'bg-rose-400',
      barColor: 'bg-rose-400',
    };
  };

  const meta = getSignalMeta();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium shadow-sm backdrop-blur-sm ${meta.color}`}>
      {/* Live pulse dot */}
      <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />

      {/* Signal Strength Bars (0 to 5) */}
      <div className="flex items-end gap-0.5 h-3.5 px-0.5" title={`Signal: ${strength}/5`}>
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            key={bar}
            style={{ height: `${bar * 20}%` }}
            className={`w-1 rounded-t-sm transition-colors ${
              bar <= strength ? meta.barColor : 'bg-gray-700/60'
            }`}
          />
        ))}
      </div>

      {/* Accuracy & Status info */}
      <span className="font-semibold tracking-wide">
        {isTracking ? 'GPS LIVE' : 'GPS STANDBY'}
      </span>

      {accuracy !== undefined && accuracy !== null && (
        <span className="text-[11px] opacity-80 border-l border-current/20 pl-2">
          ±{accuracy}m
        </span>
      )}
    </div>
  );
}

export default GPSStatusBadge;
