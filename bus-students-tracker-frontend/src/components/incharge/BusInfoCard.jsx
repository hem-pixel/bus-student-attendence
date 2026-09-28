import React from 'react';
import { Bus, User, Phone, CheckCircle2, AlertOctagon, Activity, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

export const BusInfoCard = ({ bus, inchargeName, className = '' }) => {
  if (!bus) {
    return (
      <Card className={`border-l-4 border-l-blue-500 ${className}`}>
        <div className="flex items-center gap-3 text-slate-500 py-3">
          <Bus className="w-6 h-6 text-slate-400" />
          <p className="text-sm font-semibold">No bus assigned to your account yet. Please contact administration.</p>
        </div>
      </Card>
    );
  }

  const isWorking = bus.status === 'WORKING';
  const driver = bus.drivers;

  return (
    <div className={`relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 sm:p-7 text-white border border-slate-800 shadow-xl overflow-hidden ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Bus Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" />
              <span>Assigned Vehicle</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isWorking 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {isWorking ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Operational Active</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Maintenance Required</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {bus.bus_number}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Registered Transit Fleet Unit • Capacity: <span className="text-slate-200 font-bold">{bus.capacity || 40} seats</span>
            </p>
          </div>

          {/* Driver & In-Charge Contact Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {driver && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block leading-none">
                    Driver
                  </span>
                  <span className="text-slate-200 font-bold">{driver.name}</span>
                </div>
                {driver.phone_number && (
                  <a
                    href={`tel:${driver.phone_number}`}
                    className="ml-2 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Call Driver"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {inchargeName && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block leading-none">
                    In-Charge
                  </span>
                  <span className="text-slate-200 font-bold">{inchargeName}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Graphic Badge */}
        <div className="hidden sm:flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-2">
            <Bus className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Transit Unit</span>
        </div>
      </div>
    </div>
  );
};
