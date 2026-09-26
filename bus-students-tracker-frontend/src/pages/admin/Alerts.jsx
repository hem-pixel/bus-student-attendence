import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export default function Alerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingAlertId, setUpdatingAlertId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // apiClient baseURL already includes /api
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

  const filteredAlerts = filterStatus
    ? alerts.filter(a => a.status === filterStatus)
    : alerts;

  const alertStats = {
    open: alerts.filter(a => a.status === 'OPEN').length,
    inProgress: alerts.filter(a => a.status === 'IN_PROGRESS').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar title="Alerts" />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="container-custom py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Bus Alerts</h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>{alertStats.open} Open</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>{alertStats.inProgress} In Progress</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>{alertStats.resolved} Resolved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAlerts}
                >
                  🔄 Refresh
                </Button>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <ErrorAlert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}

            {/* Alerts Table Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Filter by Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses ({alerts.length})</option>
                    <option value="OPEN">Open ({alertStats.open})</option>
                    <option value="IN_PROGRESS">In Progress ({alertStats.inProgress})</option>
                    <option value="RESOLVED">Resolved ({alertStats.resolved})</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  Showing {filteredAlerts.length} of {alerts.length} total alerts
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bus</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Problem Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reported Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <span className="text-3xl block mb-2">🎉</span>
                          No alerts matching current filter
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map(alert => (
                        <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {alert.buses?.bus_number || alert.bus_id || 'Unknown Bus'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            <span className="px-2.5 py-1 bg-gray-100 rounded text-gray-700 border border-gray-200">
                              {alert.problem_type || 'GENERAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={alert.description}>
                            {alert.description || 'No description provided'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                alert.status === 'OPEN'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : alert.status === 'IN_PROGRESS'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}
                            >
                              {alert.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            {alert.status !== 'RESOLVED' ? (
                              <Button
                                variant={alert.status === 'OPEN' ? 'primary' : 'success'}
                                size="sm"
                                loading={updatingAlertId === alert.id}
                                onClick={() => handleStatusUpdate(
                                  alert.id,
                                  alert.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED'
                                )}
                              >
                                {alert.status === 'OPEN' ? 'Start Resolution' : 'Mark Resolved'}
                              </Button>
                            ) : (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                ✓ Resolved
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
