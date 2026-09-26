import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardCard = ({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  trendUp = true,
  subtitle
}) => {
  const colorVariants = {
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      glow: 'group-hover:bg-blue-500/5'
    },
    green: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      glow: 'group-hover:bg-emerald-500/5'
    },
    red: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      glow: 'group-hover:bg-rose-500/5'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      glow: 'group-hover:bg-amber-500/5'
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      glow: 'group-hover:bg-purple-500/5'
    }
  };

  const scheme = colorVariants[color] || colorVariants.blue;

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${scheme.border} overflow-hidden`}>
      {/* Subtle hover background bloom */}
      <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${scheme.glow}`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value !== undefined ? value : 0}
            </h3>
          </div>

          {(trend || subtitle) && (
            <div className="flex items-center gap-1.5 pt-1">
              {trend && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  trendUp
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{trend}</span>
                </span>
              )}
              {subtitle && (
                <span className="text-[11px] text-slate-500 font-medium truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon Container */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-xs transition-transform duration-200 group-hover:scale-105 ${scheme.iconBg}`}>
          {typeof icon === 'string' ? (
            <span>{icon}</span>
          ) : (
            icon
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
