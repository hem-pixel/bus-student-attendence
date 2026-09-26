import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Bus,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Alerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingAlertId, setUpdatingAlertId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await apiClient.get('/alerts');
      if (response.data.success) {
        setAlerts(response.data.data || []);
        setError('');
      } else {
        setError('Failed to load alerts');
      }
    } catch (err) {
      console.warn('Direct /alerts failed, attempting fallback:', err.message);
      try {
        const fallbackRes = await apiClient.get('/api/alerts');
        if (fallbackRes.data.success) {
          setAlerts(fallbackRes.data.data || []);
          setError('');
          return;
        }
      } catch (fallbackErr) {
        setError('Error fetching alerts: ' + err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      setUpdatingAlertId(alertId);
      const response = await apiClient.patch(`/alerts/${alertId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setAlerts(prev => prev.map(a => 
          a.id === alertId ? { ...a, status: newStatus } : a
        ));
      } else {
        setError('Failed to update alert status');
      }
    } catch (err) {
      setError('Error updating alert: ' + err.message);
    } finally {
      setUpdatingAlertId(null);
    }
  };

  const alertStats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    inProgress: alerts.filter(a => a.status === 'IN_PROGRESS').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filterStatus ? alert.status === filterStatus : true;
    const busName = (alert.buses?.bus_number || alert.bus_id || '').toLowerCase();
    const problem = (alert.problem_type || '').toLowerCase();
    const desc = (alert.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || busName.includes(query) || problem.includes(query) || desc.includes(query);
    return matchesStatus && matchesSearch;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar title="Incident & Fleet Alerts" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Telemetry Dispatch
                </span>
                <span className="text-xs text-slate-400">Live Incident Monitoring</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Fleet Alert Center
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Monitor mechanical breakdowns, route delays, emergency SOS triggers, and operational tickets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAlerts(true)}
                disabled={refreshing}
                className="border-slate-800 text-slate-300 hover:bg-slate-900 bg-slate-900/60"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Sync Alerts
              </Button>
            </div>
          </div>

          {/* KPI Metrics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Alerts</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{alertStats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">Historical records logged</div>
            </div>

            <div className="bg-slate-900/70 border border-rose-900/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Open / Active</p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">{alertStats.open}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400/80">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Immediate action required</span>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-amber-900/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">In Progress</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{alertStats.inProgress}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-amber-400/80">Dispatched & being handled</div>
            </div>

            <div className="bg-slate-900/70 border border-emerald-900/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{alertStats.resolved}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-emerald-400/80">Resolved incidents closed</div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {/* Filter & Search Bar */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by bus number, problem type, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterStatus('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('OPEN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterStatus === 'OPEN'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Open ({alertStats.open})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterStatus === 'IN_PROGRESS'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                In Progress ({alertStats.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterStatus === 'RESOLVED'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Resolved ({alertStats.resolved})
              </button>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Bus Assignment</th>
                    <th className="px-6 py-4 font-semibold">Issue Type</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Logged Timestamp</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="text-base font-semibold text-slate-300">All Clear</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          No alerts matching your current filter. The active fleet is operating within normal parameters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                              <Bus className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {alert.buses?.bus_number || alert.bus_id || 'Bus Unknown'}
                              </div>
                              <div className="text-xs text-slate-400">
                                {alert.buses?.route_name || 'Standard Route'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-lg text-xs font-semibold tracking-wide">
                            {alert.problem_type || 'GENERAL'}
                          </span>
                        </td>

                        <td className="px-6 py-4 max-w-xs sm:max-w-md">
                          <p className="text-slate-300 text-sm line-clamp-2" title={alert.description}>
                            {alert.description || 'No additional telemetry description available.'}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                              alert.status === 'OPEN'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : alert.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                alert.status === 'OPEN'
                                  ? 'bg-rose-500 animate-ping'
                                  : alert.status === 'IN_PROGRESS'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            ></span>
                            {alert.status === 'OPEN' && 'Open'}
                            {alert.status === 'IN_PROGRESS' && 'In Progress'}
                            {alert.status === 'RESOLVED' && 'Resolved'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {alert.status !== 'RESOLVED' ? (
                            <Button
                              variant={alert.status === 'OPEN' ? 'primary' : 'success'}
                              size="sm"
                              loading={updatingAlertId === alert.id}
                              onClick={() => handleStatusUpdate(
                                alert.id,
                                alert.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED'
                              )}
                              className="text-xs"
                            >
                              {alert.status === 'OPEN' ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Start Fix</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Close Alert</span>
                                </span>
                              )}
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Closed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3.5 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div>
                Showing <span className="font-semibold text-white">{filteredAlerts.length}</span> of{' '}
                <span className="font-semibold text-white">{alerts.length}</span> recorded alerts
              </div>
              <div className="text-slate-500">Live Telemetry Synchronized</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
