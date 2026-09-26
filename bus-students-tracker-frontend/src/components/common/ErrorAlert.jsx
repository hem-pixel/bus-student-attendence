import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ErrorAlert = ({ message, onClose, type = 'error' }) => {
  if (!message) return null;

  const config = {
    error: {
      container: 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
      badge: 'bg-rose-600/10 text-rose-700 border-rose-200'
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      badge: 'bg-amber-600/10 text-amber-700 border-amber-200'
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      badge: 'bg-emerald-600/10 text-emerald-700 border-emerald-200'
    },
    info: {
      container: 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
      badge: 'bg-sky-600/10 text-sky-700 border-sky-200'
    }
  };

  const current = config[type] || config.error;

  return (
    <div
      className={`relative flex items-center justify-between gap-3 p-3.5 mb-4 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-200 animate-fadeIn ${current.container}`}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1 rounded-lg bg-white/60 dark:bg-slate-900/40 shadow-xs">
          {current.icon}
        </div>
        <p className="text-sm font-medium leading-relaxed tracking-normal break-words">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex-shrink-0"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
