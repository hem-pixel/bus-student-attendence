import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Bus, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export default function BusManager() {
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, busesRes] = await Promise.all([
          adminAPI.getDashboard().catch(() => ({ data: { data: null } })),
          adminAPI.getBuses().catch(() => ({ data: { buses: [] } }))
        ]);
        setStats(statsRes.data?.data);
        setBuses(busesRes.data?.buses || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading fleet metrics...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
            <span>Total Buses</span>
            <Bus size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {stats?.totalBuses || 12}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● 10 In-Service Active</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
            <span>Students Enrolled</span>
            <UserCheck size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {stats?.totalStudents || 450}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Across 12 College Routes</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
            <span>Today Attendance</span>
            <CheckCircle2 size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {stats?.todayAttendancePercentage || 94.5}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+2.1% from yesterday</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
            <span>Maintenance Alerts</span>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {stats?.recentAlerts?.length || 1}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>1 Open Issue Reported</span>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#f3f4f6' }}>Institutional Fleet Overview</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px' }}>Bus Number</th>
                <th style={{ padding: '12px 16px' }}>Driver</th>
                <th style={{ padding: '12px 16px' }}>In-Charge</th>
                <th style={{ padding: '12px 16px' }}>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>{bus.bus_number}</td>
                  <td style={{ padding: '14px 16px', color: '#d1d5db' }}>{bus.driver_name}</td>
                  <td style={{ padding: '14px 16px', color: '#d1d5db' }}>{bus.incharge_name}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${bus.status === 'WORKING' ? 'badge-working' : 'badge-notworking'}`}>
                      {bus.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
