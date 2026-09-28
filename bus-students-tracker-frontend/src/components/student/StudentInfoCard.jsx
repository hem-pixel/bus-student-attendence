import React from 'react';
import { Card } from '../common/Card';
import { User, MapPin, Bus, GraduationCap, ShieldCheck } from 'lucide-react';

export const StudentInfoCard = ({ 
  studentName = 'Student', 
  registerNumber = 'N/A', 
  assignedBus = null,
  stopName = null 
}) => {
  const busNumber = typeof assignedBus === 'object' && assignedBus 
    ? assignedBus.bus_number 
    : (assignedBus || 'Not Assigned');

  return (
    <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
            {studentName ? studentName.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Student Profile
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {studentName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Reg No: <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{registerNumber}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Meta Badges */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Assigned: <strong className="text-blue-600 dark:text-blue-400 font-bold">{busNumber}</strong></span>
          </div>

          {stopName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Stop: {stopName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StudentInfoCard;
