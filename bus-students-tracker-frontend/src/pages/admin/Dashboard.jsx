import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    buses: { total: 0, working: 0, not_working: 0 },
    students: { total: 0, boys: 0, girls: 0 },
    staff: { drivers: 0, incharges: 0, total: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/dashboard/summary');
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      // If error or empty, provide graceful fallback numbers so admin can still use dashboard
      console.warn('Dashboard fetch warning:', err);
      setError('Error fetching dashboard: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="Admin Dashboard" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time status of college fleet, students, and staff</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                  🔄 Refresh Data
                </Button>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700 shadow-sm"
                  aria-label="Toggle menu"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <ErrorAlert
                  message={error}
                  type="error"
                  onClose={() => setError('')}
                />
              </div>
            )}

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Buses Cards */}
              <DashboardCard
                title="Total Buses"
                value={dashboardData.buses?.total || 0}
                icon="🚌"
                color="blue"
              />
              <DashboardCard
                title="Buses Working"
                value={dashboardData.buses?.working || 0}
                icon="✅"
                color="green"
              />
              <DashboardCard
                title="Buses Down"
                value={dashboardData.buses?.not_working || 0}
                icon="⚠️"
                color="red"
              />

              {/* Students Cards */}
              <DashboardCard
                title="Total Students"
                value={dashboardData.students?.total || 0}
                icon="👨‍🎓"
                color="amber"
              />
              <DashboardCard
                title="Boys"
                value={dashboardData.students?.boys || 0}
                icon="👦"
                color="blue"
              />
              <DashboardCard
                title="Girls"
                value={dashboardData.students?.girls || 0}
                icon="👧"
                color="amber"
              />

              {/* Staff Cards */}
              <DashboardCard
                title="Total Drivers"
                value={dashboardData.staff?.drivers || 0}
                icon="🚗"
                color="blue"
              />
              <DashboardCard
                title="Total In-Charges"
                value={dashboardData.staff?.incharges || 0}
                icon="👨‍💼"
                color="green"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500 mt-0.5">Jump directly to management consoles and tools</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="py-3 justify-center text-sm font-semibold"
                  onClick={() => navigate('/admin/buses')}
                >
                  🚌 Manage Buses
                </Button>
                <Button
                  variant="outline"
                  className="py-3 justify-center text-sm font-semibold"
                  onClick={() => navigate('/admin/students')}
                >
                  👨‍🎓 Manage Students
                </Button>
                <Button
                  variant="outline"
                  className="py-3 justify-center text-sm font-semibold"
                  onClick={() => navigate('/admin/drivers')}
                >
                  🚗 Manage Drivers
                </Button>
                <Button
                  variant="primary"
                  className="py-3 justify-center text-sm font-semibold shadow-md shadow-blue-500/20"
                  onClick={() => navigate('/admin/live-track')}
                >
                  📍 Live Track
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
