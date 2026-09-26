import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { Navigation, MapPin, CheckCircle2, Radio } from 'lucide-react';

export default function BusLiveTracker() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await studentAPI.getStatus();
        setData(res.data?.student);
      } catch (err) {
        console.error(err);
      }
    }
    loadStudent();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Student Details Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>Student Profile</h3>
          <span className="badge badge-active">Enrolled</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Name</div>
            <div style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600 }}>{data?.name || 'Student Name'}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Register Number</div>
            <div style={{ color: '#d1d5db', fontSize: '0.95rem' }}>{data?.registerNumber || '910021104001'}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Assigned Bus</div>
            <div style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 700 }}>{data?.assignedBus || 'BUS-05'}</div>
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Designated Pickup / Drop Stop</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f3f4f6', marginTop: '4px' }}>
              <MapPin size={16} color="#f43f5e" />
              <span>{data?.stopName || 'Chromepet Main Road'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Tracking Status */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#10b981" /> Live Bus Status
          </h3>
          <span className="badge badge-working">Active Telemetry</span>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Navigation size={22} color="#3b82f6" />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600 }}>Approaching Stop</div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Estimated Arrival: ~8 mins (3.2 km away)</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Today's Boarding:</span>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} /> Ready
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Current Speed:</span>
            <span style={{ color: '#ffffff' }}>38 km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
