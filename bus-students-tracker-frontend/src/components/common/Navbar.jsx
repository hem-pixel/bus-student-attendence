import React from 'react';
import { Bus, LogOut, Shield, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
        }}>
          <Bus color="#ffffff" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Bus Students Tracker</h2>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.04em' }}>PHASE 1 INFRASTRUCTURE & MONITOR</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>{user.email}</div>
              <span className="badge badge-role" style={{ marginTop: '2px' }}>
                <Shield size={12} style={{ marginRight: '4px' }} />
                {user.role}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
            <User size={16} /> Guest View
          </div>
        )}
      </div>
    </header>
  );
}
