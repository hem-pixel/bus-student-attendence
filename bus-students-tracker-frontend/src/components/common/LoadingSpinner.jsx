import React from 'react';

export const LoadingSpinner = ({ size = 'md', fullPage = false, label = '' }) => {
  const sizeMap = {
    sm: { container: 'w-6 h-6', border: 'border-2', ping: 'w-3 h-3' },
    md: { container: 'w-10 h-10', border: 'border-[3px]', ping: 'w-5 h-5' },
    lg: { container: 'w-16 h-16', border: 'border-4', ping: 'w-8 h-8' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Ambient background pulse */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
        {/* Outer track */}
        <div className={`absolute inset-0 rounded-full border-slate-200/60 dark:border-slate-800 ${currentSize.border}`}></div>
        {/* Spinning gradient ring */}
        <div
          className={`absolute inset-0 rounded-full ${currentSize.border} border-transparent border-t-blue-600 border-r-indigo-600 animate-spin`}
          style={{ animationDuration: '0.8s' }}
          role="status"
          aria-label="Loading"
        ></div>
        {/* Center dot */}
        <div className={`${currentSize.ping} rounded-full bg-blue-600/30 animate-pulse`}></div>
      </div>
      {label && (
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
        <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;

