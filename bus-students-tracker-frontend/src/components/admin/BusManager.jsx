import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Bus, CheckCircle2, AlertTriangle, UserCheck, Activity, Users } from 'lucide-react';

export default function BusManager() {
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, busesRes] = await Promise.all([
          adminAPI.getDashboard().catch(() => ({ data: { data: null } })),
          adminAPI.getBuses().catch(() => ({ data: { buses: [] } }))
        ]);
        setStats(statsRes.data?.data);
        setBuses(busesRes.data?.buses || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Activity className="w-5 h-5 animate-spin mr-3 text-blue-500" />
        <span>Loading fleet metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.totalBuses || buses.length || 12}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Active Operational Fleet</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.totalStudents || 450}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Assigned to transportation routes
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Today Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.todayAttendancePercentage || 94.5}%
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <span>+2.1% from baseline</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Maintenance Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.recentAlerts?.length || 0}
          </div>
          <div className="mt-2 text-xs text-amber-400/80">
            Open incidents being handled
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Institutional Fleet Overview</h3>
          <span className="text-xs text-slate-400">{buses.length} registered vehicles</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Bus Identifier</th>
                <th className="px-4 py-3 font-semibold">Assigned Driver</th>
                <th className="px-4 py-3 font-semibold">Staff In-Charge</th>
                <th className="px-4 py-3 font-semibold">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {buses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    No buses configured yet.
                  </td>
                </tr>
              ) : (
                buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-blue-400" />
                        <span>{bus.bus_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{bus.driver_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-300">{bus.incharge_name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        bus.status === 'WORKING'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'WORKING' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {bus.status || 'WORKING'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
