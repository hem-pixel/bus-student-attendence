import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  UserCheck, 
  Car, 
  Navigation, 
  RotateCw, 
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
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
      console.warn('Dashboard fetch warning:', err);
      setError('Error fetching dashboard: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950/5 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="Fleet Command Hub" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Executive Welcome & Live Status Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl overflow-hidden">
              <div className="absolute right-[-20px] top-[-30px] w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>Real-Time Fleet Operations</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Campus Transit Intelligence
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Live operational telemetry, active route status, driver assignments, and student safety supervision.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboardData}
                    className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 font-semibold gap-2 py-2.5 px-4 rounded-xl"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Sync Metrics</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/admin/live-track')}
                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 font-bold gap-2 py-2.5 px-4 rounded-xl"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Live Radar</span>
                  </Button>
                </div>
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

            {/* Section 1: Fleet & Transit KPIs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Fleet Deployment Status
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">Auto-calculated</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <DashboardCard
                  title="Total College Fleet"
                  value={dashboardData.buses?.total || 0}
                  icon={<Bus className="w-6 h-6" />}
                  color="blue"
                  subtitle="All registered campus vehicles"
                />
                <DashboardCard
                  title="Active in Service"
                  value={dashboardData.buses?.working || 0}
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  color="green"
                  trend={`${dashboardData.buses?.total ? Math.round((dashboardData.buses?.working / dashboardData.buses?.total) * 100) : 0}% Operational`}
                  trendUp={true}
                />
                <DashboardCard
                  title="Maintenance / Offline"
                  value={dashboardData.buses?.not_working || 0}
                  icon={<AlertTriangle className="w-6 h-6" />}
                  color="red"
                  subtitle="Awaiting clearance or repair"
                />
              </div>
            </div>

            {/* Section 2: Student Census & Staff Supervision */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Students & Operational Crew
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                <DashboardCard
                  title="Enrolled Students"
                  value={dashboardData.students?.total || 0}
                  icon={<GraduationCap className="w-6 h-6" />}
                  color="purple"
                  subtitle="Pass holders registered"
                />
                <DashboardCard
                  title="Male Students"
                  value={dashboardData.students?.boys || 0}
                  icon={<Users className="w-6 h-6" />}
                  color="blue"
                />
                <DashboardCard
                  title="Female Students"
                  value={dashboardData.students?.girls || 0}
                  icon={<Users className="w-6 h-6" />}
                  color="amber"
                />
                <DashboardCard
                  title="Certified Drivers"
                  value={dashboardData.staff?.drivers || 0}
                  icon={<Car className="w-6 h-6" />}
                  color="blue"
                  subtitle="Active route operators"
                />
                <DashboardCard
                  title="Bus In-Charges"
                  value={dashboardData.staff?.incharges || 0}
                  icon={<UserCheck className="w-6 h-6" />}
                  color="green"
                  subtitle="On-board staff officers"
                />
              </div>
            </div>

            {/* Section 3: Quick Operations Console */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Quick Operations Console
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Direct entry into management registries and spatial trackers</p>
                </div>
                <Layers className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/buses')}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        Bus Inventory
                      </p>
                      <p className="text-[11px] text-slate-500">Routes & fleet specs</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/students')}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-500/40 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                        Student Directory
                      </p>
                      <p className="text-[11px] text-slate-500">Boarding points & stops</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/drivers')}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        Driver Roster
                      </p>
                      <p className="text-[11px] text-slate-500">Licenses & assignments</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/live-track')}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-blue-500/30 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Live Fleet Radar
                      </p>
                      <p className="text-[11px] text-blue-100">Interactive GPS map</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
