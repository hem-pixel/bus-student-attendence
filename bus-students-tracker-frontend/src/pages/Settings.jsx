import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Button } from '../components/common/Button';
import {
  User,
  Shield,
  Key,
  LogOut,
  Mail,
  Fingerprint,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Server,
  Sparkles
} from 'lucide-react';

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
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar title="Account & Preferences" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Profile & Security
                </span>
                <span className="text-xs text-slate-400">Enterprise Authentication</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Account Settings
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage your credentials, active session parameters, and role-based permissions.
              </p>
            </div>

            {/* Profile Information Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Identity & Operator Profile</h2>
                    <p className="text-xs text-slate-400">Authenticated user details stored on the security server</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Session
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-base font-semibold text-white truncate select-all">
                    {user?.email || 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Access Role</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-blue-400">
                      {userRole || 'Standard User'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      RBAC Active
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                    <span>Unique Subject Identifier (UUID)</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 break-all select-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    {user?.id || 'Session Active'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Security & Password Management</h2>
                  <p className="text-xs text-slate-400">Manage credentials and cryptographic recovery</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-white text-sm">Account Password Reset</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send a secure magic recovery link to your registered corporate email.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => window.open(getResetUrl(), '_blank')}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-slate-900 shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Initiate Reset
                </Button>
              </div>
            </div>

            {/* Session Termination Card */}
            <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Session Termination</h2>
                  <p className="text-xs text-slate-400">Revoke current JWT authentication tokens and sign out</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
                <div>
                  <div className="font-semibold text-rose-300 text-sm">Sign Out from this Device</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your local storage token will be purged. You will be redirected to the secure login gateway.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="md"
                  loading={loggingOut}
                  onClick={handleLogout}
                  className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30 shrink-0"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
