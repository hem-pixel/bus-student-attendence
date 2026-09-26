import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Bus, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('InitialPassword123!');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'ADMIN') {
      setEmail('admin@college.edu');
      setPassword('InitialPassword123!');
    } else if (selectedRole === 'BUS_INCHARGE') {
      setEmail('incharge@college.edu');
      setPassword('Incharge123!');
    } else {
      setEmail('student@college.edu');
      setPassword('Student123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.login({ email, password, role });
      if (res.data.success) {
        localStorage.setItem('bus_tracker_token', res.data.token);
        localStorage.setItem('bus_tracker_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      } else {
        setError(res.data.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Bus color="#ffffff" size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Sign In to Portal</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '6px' }}>
            Bus Students Tracker — Phase 1 RBAC Authentication
          </p>
        </div>

        {/* Quick Role Switcher */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Select Persona Demo:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {['ADMIN', 'BUS_INCHARGE', 'STUDENT'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSelect(r)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: role === r ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                  background: role === r ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                  color: role === r ? '#60a5fa' : '#9ca3af',
                  transition: 'all 0.2s ease'
                }}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>
              Institutional Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.85rem', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound size={18} color="#6b7280" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Continue to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10b981" /> Secured with Supabase / JWT RBAC
        </div>
      </div>
    </div>
  );
}
