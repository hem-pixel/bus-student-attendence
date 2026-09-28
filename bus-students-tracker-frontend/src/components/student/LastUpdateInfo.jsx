import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const LastUpdateInfo = ({ lastUpdateTime, isRefreshing = false, onManualRefresh = null }) => {
  const [timeAgo, setTimeAgo] = useState('Never');

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!lastUpdateTime) {
        setTimeAgo('No update recorded yet');
        return;
      }

      const now = new Date();
      const lastUpdate = new Date(lastUpdateTime);
      const diffMs = now - lastUpdate;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 5) {
        setTimeAgo('Just now');
      } else if (diffSecs < 60) {
        setTimeAgo(`${diffSecs} seconds ago`);
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} minute${diffMins === 1 ? '' : 's'} ago`);
      } else {
        setTimeAgo(lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  return (
    <div className="p-4 bg-blue-50/80 dark:bg-slate-800/80 rounded-2xl border border-blue-200/60 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            Telemetry Stream Status
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Last updated: <span className="text-blue-600 dark:text-blue-400 font-bold">{timeAgo}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Auto-sync 15s
        </span>

        {onManualRefresh && (
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all disabled:opacity-50"
            title="Refresh location now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LastUpdateInfo;
