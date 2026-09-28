import React from 'react';
import { Card } from '../common/Card';
import { Bus, User, Phone, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const BusInfoCard = ({ bus }) => {
  if (!bus) {
    return (
      <Card className="border-l-4 border-l-amber-500">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">No Bus Assigned</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please contact your administrator to assign a bus to your profile.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const isWorking = bus.status === 'WORKING';
  const busIncharge = Array.isArray(bus.bus_incharges) ? bus.bus_incharges[0] : bus.bus_incharges;

  return (
    <Card className="border-l-4 border-l-blue-600 dark:border-l-blue-500 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Your Assigned Bus</span>
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
          isWorking
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isWorking ? 'Operational' : 'Out of Service'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Bus Number */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Bus Registration / Number
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {bus.bus_number || 'N/A'}
            </p>
            {bus.capacity && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Capacity: {bus.capacity} seats
              </span>
            )}
          </div>
        </div>

        {/* Operational Status Detail */}
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">
            Status Mode
          </p>
          <div className="flex items-center gap-2">
            {isWorking ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-semibold ${isWorking ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {isWorking ? 'Normal active transit mode' : 'Bus temporarily unavailable'}
            </span>
          </div>
        </div>

        {/* Bus In-Charge Contact */}
        {busIncharge ? (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Bus In-Charge
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {busIncharge.name || 'Assigned Officer'}
                </p>
                {busIncharge.phone_number && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {busIncharge.phone_number}
                  </p>
                )}
              </div>

              {busIncharge.phone_number && (
                <a
                  href={`tel:${busIncharge.phone_number}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              No in-charge contact assigned to this bus
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BusInfoCard;
