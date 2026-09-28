import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, MapPin, AlertTriangle, Settings, ChevronRight } from 'lucide-react';

export const QuickActionCard = ({ className = '' }) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Mark Attendance',
      description: 'Record morning or evening student roll call',
      path: '/incharge/attendance',
      icon: CheckSquare,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50',
      badge: 'Daily Essential'
    },
    {
      label: 'Live Route Map',
      description: 'Track GPS telematics & current vehicle status',
      path: '/incharge/map',
      icon: MapPin,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/50',
      badge: 'Live Radar'
    },
    {
      label: 'Report Issue',
      description: 'Transmit mechanical delay or emergency alert',
      path: '/incharge/alerts',
      icon: AlertTriangle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/50',
      badge: 'Immediate Action'
    },
    {
      label: 'System Settings',
      description: 'Configure notifications & account preferences',
      path: '/settings',
      icon: Settings,
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:border-slate-500/50',
      badge: 'Profile'
    }
  ];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Quick Operations</h3>
          <p className="text-xs text-slate-400 mt-0.5">High priority tasks for on-duty bus in-charge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.path}
              type="button"
              onClick={() => navigate(act.path)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 group flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${act.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/80">
                    {act.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {act.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold">
                <span>Access module</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
