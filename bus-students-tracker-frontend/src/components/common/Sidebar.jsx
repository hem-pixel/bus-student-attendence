import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { userRole } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/buses', label: 'Buses', icon: '🚌' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/drivers', label: 'Drivers', icon: '🚗' },
    { path: '/admin/incharges', label: 'In-Charges', icon: '👨‍💼' },
    { path: '/admin/live-track', label: 'Live Track', icon: '📍' },
    { path: '/admin/alerts', label: 'Alerts', icon: '🚨' }
  ];

  const inchargeMenuItems = [
    { path: '/incharge/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/incharge/attendance', label: 'Attendance', icon: '✅' },
    { path: '/incharge/map', label: 'Map', icon: '📍' },
    { path: '/incharge/alerts', label: 'Alerts', icon: '🚨' }
  ];

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📍' }
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
          { path: '/settings', label: 'Settings', icon: '⚙️' }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          left-0 top-0
          w-64
          h-full
          bg-gray-900
          text-white
          transition-transform
          duration-300
          ease-in-out
          flex
          flex-col
          z-50 md:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl md:shadow-none
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚌</span>
            <span className="font-bold text-white">Menu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-3 px-3">
            Navigation ({userRole || 'User'})
          </p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={`
                    flex items-center gap-3
                    px-3.5 py-2.5
                    rounded-xl
                    font-medium
                    text-sm
                    transition-all
                    duration-150
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / Quick Links */}
        <div className="p-4 border-t border-gray-800">
          <Link
            to="/settings"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white text-sm font-medium transition-colors"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
