import React from 'react';
import BusManager from '../components/admin/BusManager';
import AttendanceScanner from '../components/incharge/AttendanceScanner';
import BusLiveTracker from '../components/student/BusLiveTracker';
import { ROLES } from '../utils/constants';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage({ user }) {
  if (!user) return null;

  const renderRoleDashboard = () => {
    switch (user.role) {
      case ROLES.ADMIN:
        return <BusManager />;
      case ROLES.BUS_INCHARGE:
        return <AttendanceScanner />;
      case ROLES.STUDENT:
        return <BusLiveTracker />;
      default:
        return (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af' }}>No dashboard assigned for role: {user.role}</p>
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <LayoutDashboard size={16} /> Console Workspace
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Welcome back, {user.name || user.email.split('@')[0]}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: '4px' }}>
            Role Authority: <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{user.role}</span> | System Status: <span style={{ color: '#10b981', fontWeight: 600 }}>Operational</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-active">Live Sync</span>
          <span className="badge badge-role">Phase 1 Active</span>
        </div>
      </div>

      {/* Role-specific Component */}
      {renderRoleDashboard()}
    </div>
  );
}
