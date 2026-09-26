import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus, 
  GraduationCap, 
  Car, 
  UserCheck, 
  Navigation, 
  AlertTriangle, 
  CheckSquare, 
  MapPin, 
  Settings, 
  X,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { userRole } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/buses', label: 'Fleet & Buses', icon: Bus },
    { path: '/admin/students', label: 'Student Directory', icon: GraduationCap },
    { path: '/admin/drivers', label: 'Drivers', icon: Car },
    { path: '/admin/incharges', label: 'In-Charges', icon: UserCheck },
    { path: '/admin/live-track', label: 'Live Tracking Radar', icon: Navigation },
    { path: '/admin/alerts', label: 'Security Alerts', icon: AlertTriangle }
  ];

  const inchargeMenuItems = [
    { path: '/incharge/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/incharge/attendance', label: 'Daily Attendance', icon: CheckSquare },
    { path: '/incharge/map', label: 'Live Route Map', icon: MapPin },
    { path: '/incharge/alerts', label: 'Incident Alerts', icon: AlertTriangle }
  ];

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Bus Tracker', icon: Navigation }
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'ADMIN':
        return adminMenuItems;
      case 'BUS_INCHARGE':
        return inchargeMenuItems;
      case 'STUDENT':
        return studentMenuItems;
      default:
        return [
          { path: '/settings', label: 'Settings', icon: Settings }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile backdrop with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm md:hidden z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`
          fixed md:static
          left-0 top-0
          w-64
          h-full
          bg-slate-950
          border-r border-slate-800/80
          text-slate-300
          transition-transform
          duration-300
          ease-in-out
          flex
          flex-col
          z-50 md:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-2xl md:shadow-none
        `}
      >
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Bus className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white">TransitPulse</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Banner (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-slate-800/70">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight leading-none">TransitPulse</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              {userRole?.replace('_', ' ') || 'PORTAL'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3.5 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 px-3">
              Operational Navigation
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={`
                      group flex items-center gap-3
                      px-3.5 py-2.5
                      rounded-xl
                      font-semibold
                      text-xs
                      transition-all
                      duration-150
                      relative
                      ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                      }
                    `}
                  >
                    <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick System Badge Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200">Campus Cloud</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              GPS telemetry is continuously logged and verified with college servers.
            </p>
          </div>
        </div>

        {/* Bottom Profile / Quick Links */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80">
          <Link
            to="/settings"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Workspace Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
