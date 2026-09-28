import React from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

export const AttendanceStats = ({ studentsCount = 0, presentCount = 0, absentCount = 0 }) => {
  const attendancePercentage = studentsCount === 0
    ? 0
    : ((presentCount / studentsCount) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Students Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-blue-500/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enrolled</span>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{studentsCount}</span>
          <span className="text-xs text-slate-400 font-medium">students on bus</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Assigned route passengers</span>
        </div>
      </div>

      {/* Present Today Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs relative overflow-hidden group hover:border-emerald-500/60 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Present Today</span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{presentCount}</span>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-bold">boarded</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active safe on transit</span>
        </div>
      </div>

      {/* Absent Today Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-rose-500/30 dark:border-rose-500/20 shadow-xs relative overflow-hidden group hover:border-rose-500/60 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Absent Today</span>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{absentCount}</span>
          <span className="text-xs text-rose-500/80 dark:text-rose-400/80 font-bold">unmarked</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Not boarded today</span>
        </div>
      </div>

      {/* Turnout Percentage Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Turnout Rate</span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{attendancePercentage}%</span>
          <span className="text-xs text-slate-400 font-medium">completion</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
