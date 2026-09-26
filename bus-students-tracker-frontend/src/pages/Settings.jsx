import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export default function Settings() {
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getResetUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    return supabaseUrl ? `${supabaseUrl}/auth/v1/recover` : '#';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="Settings" />

        {/* Mobile Toggle Bar */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm text-gray-700 font-medium px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            <span>☰</span>
            <span>Open Menu</span>
          </button>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {userRole}
          </span>
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Account Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your profile, credentials, and session preferences.
              </p>
            </div>

            {/* Profile Information */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>👤</span> Profile Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Email Address
                  </p>
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {user?.email || 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Current Assigned Role
                  </p>
                  <p className="text-base font-semibold text-blue-600">
                    {userRole || 'Standard User'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    User Identifier
                  </p>
                  <p className="text-xs font-mono text-gray-700 break-all select-all">
                    {user?.id || 'Session Active'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Security Settings */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🛡️</span> Security & Authentication
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Authentication and credential resets are managed through the transport security service.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => window.open(getResetUrl(), '_blank')}
              >
                Reset Password
              </Button>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-200 bg-red-50/50">
              <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                <span>⚠️</span> Session Termination
              </h2>
              <p className="text-sm text-red-600/90 mb-4">
                Logging out will clear your authorization token from this browser. You must sign in again to access the tracker.
              </p>
              <Button
                variant="danger"
                size="md"
                loading={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
