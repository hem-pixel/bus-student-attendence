import React, { useEffect, useState, useCallback } from 'react';
import { 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Filter, 
  PhoneCall, 
  ShieldAlert, 
  Radio, 
  Bus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { AlertForm } from '../../components/incharge/AlertForm';

export default function Alerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bus, setBus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchBusAndAlerts = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError('');

      // 1. Get assigned bus
      let busData = null;
      try {
        const busRes = await apiClient.get('/incharge/bus');
        if (busRes.data?.success && busRes.data?.data) {
          busData = busRes.data.data;
          setBus(busData);
        }
      } catch (busErr) {
        const dashRes = await apiClient.get('/incharge/dashboard');
        if (dashRes.data?.success && dashRes.data?.data?.bus) {
          busData = dashRes.data.data.bus;
          setBus(busData);
        }
      }

      if (!busData) {
        setError('No assigned bus found for this in-charge account.');
        setLoading(false);
        return;
      }

      // 2. Fetch alerts for this bus
      const alertsRes = await apiClient.get(`/alerts?bus_id=${busData.id}`);
      if (alertsRes.data?.success && Array.isArray(alertsRes.data?.data)) {
        setAlerts(alertsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load reported alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBusAndAlerts();
  }, [fetchBusAndAlerts]);

  const handleSubmitAlert = async (formData) => {
    if (!bus?.id) {
      setError('Assigned bus ID not found. Cannot submit alert.');
      return false;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await apiClient.post('/alerts', {
        bus_id: bus.id,
        problem_type: formData.problem_type,
        description: formData.description
      });

      if (response.data?.success) {
        const newAlert = response.data.data;
        setAlerts(prev => [newAlert, ...prev]);
        setSuccess('Emergency incident report transmitted successfully to transport control room.');
        setTimeout(() => setSuccess(''), 5000);
        return true;
      } else {
        setError(response.data?.message || 'Failed to file alert ticket');
        return false;
      }
    } catch (err) {
      console.error('Submit alert error:', err);
      setError(err.response?.data?.message || err.message || 'Error transmitting incident alert');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const alertStats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    inProgress: alerts.filter(a => a.status === 'IN_PROGRESS').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length
  };

  const filteredAlerts = filterStatus === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.status === filterStatus);

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar 
          title="Incident Dispatch & Alerts" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Transit Safety Channel</span>
                </span>
                {bus && (
                  <span className="text-xs text-slate-400 font-medium">
                    Bus Unit: <strong className="text-slate-200">{bus.bus_number}</strong>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Report & Track Incidents
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Immediately report mechanical breakdowns, accidents, or transit delays to administration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchBusAndAlerts(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync Alerts'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {success && (
            <ErrorAlert
              message={success}
              type="success"
              onClose={() => setSuccess('')}
            />
          )}

          {/* Incident Stats Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">All Filed</span>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">{alertStats.total}</p>
              <span className="text-[11px] text-slate-500 font-medium">incident records</span>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 border border-rose-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Open Tickets</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mt-1">{alertStats.open}</p>
              <span className="text-[11px] text-rose-400/70 font-medium">requires attention</span>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 border border-amber-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">In Progress</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-1">{alertStats.inProgress}</p>
              <span className="text-[11px] text-amber-400/70 font-medium">response dispatched</span>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 border border-emerald-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resolved</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-1">{alertStats.resolved}</p>
              <span className="text-[11px] text-emerald-400/70 font-medium">closed issues</span>
            </div>
          </div>

          {/* Grid Layout: Left form, Right alerts list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Alert Form & Emergency Help */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Report Incident</h3>
                    <p className="text-xs text-slate-400">Instant notification to central control</p>
                  </div>
                </div>

                <AlertForm
                  busId={bus?.id}
                  onSubmit={handleSubmitAlert}
                  loading={submitting}
                />
              </div>

              {/* Transit Emergency Contact Card */}
              <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 rounded-3xl p-6 border border-rose-500/20 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <PhoneCall className="w-4 h-4" />
                  <span>Immediate Assistance</span>
                </div>
                <p className="text-xs text-slate-300">
                  In case of critical road accidents or medical emergencies, contact emergency authorities directly before filing a ticket.
                </p>
                <div className="pt-2 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400">Transport Control Hotline:</span>
                    <strong className="text-white">+91 98765 43210</strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400">Campus Emergency Desk:</span>
                    <strong className="text-white">+91 98765 00000</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Alerts List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-5">
                {/* Header & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Filed Incident Reports ({filteredAlerts.length})
                    </h3>
                    <p className="text-xs text-slate-400">Chronological history for Bus {bus?.bus_number}</p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/70 p-1 rounded-2xl border border-slate-700/70 text-xs">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          filterStatus === status
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tickets Stream */}
                {filteredAlerts.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">
                      No {filterStatus === 'ALL' ? '' : filterStatus.toLowerCase()} incidents reported
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All transit parameters for this bus unit are currently running smoothly without operational complaints.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {filteredAlerts.map((alert) => {
                      const isOpen = alert.status === 'OPEN';
                      const isInProgress = alert.status === 'IN_PROGRESS';
                      const isResolved = alert.status === 'RESOLVED';

                      return (
                        <div
                          key={alert.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                            isOpen
                              ? 'bg-rose-500/5 border-rose-500/30'
                              : isInProgress
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'bg-slate-800/40 border-slate-700/70'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white tracking-tight">
                                {alert.problem_type}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isOpen
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : isInProgress
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {alert.status.replace('_', ' ')}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{new Date(alert.created_at).toLocaleString()}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {alert.description}
                          </p>

                          {alert.resolution_notes && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                              <span className="font-bold text-emerald-400">Resolution Note: </span>
                              <span className="text-slate-300">{alert.resolution_notes}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
