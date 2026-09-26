import React, { useState, useEffect } from 'react';
import { inchargeAPI } from '../../services/api';
import { Bus, Check, X, Users, PhoneCall } from 'lucide-react';

export default function AttendanceScanner() {
  const [busDetails, setBusDetails] = useState(null);
  const [regNo, setRegNo] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [recentMarks, setRecentMarks] = useState([]);

  useEffect(() => {
    async function loadBus() {
      try {
        const res = await inchargeAPI.getAssignedBus();
        setBusDetails(res.data?.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBus();
  }, []);

  const handleMark = (status) => {
    if (!regNo.trim()) return;
    const newRecord = {
      registerNumber: regNo.trim(),
      status,
      time: new Date().toLocaleTimeString()
    };
    setRecentMarks([newRecord, ...recentMarks]);
    setStatusMessage(`Marked ${regNo} as ${status}`);
    setRegNo('');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Bus Assigned Info */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bus color="#3b82f6" /> Assigned Bus Details
        </h3>
        {busDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Bus Number:</span>
              <strong style={{ color: '#ffffff' }}>{busDetails.busNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Route:</span>
              <span style={{ color: '#d1d5db' }}>{busDetails.route}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Driver:</span>
              <span style={{ color: '#d1d5db' }}>{busDetails.driverName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Driver Contact:</span>
              <a href={`tel:${busDetails.driverPhone}`} style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PhoneCall size={14} /> {busDetails.driverPhone}
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ color: '#9ca3af' }}>Total Assigned:</span>
              <span className="badge badge-active">{busDetails.totalAssignedStudents} Students</span>
            </div>
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>Loading assigned bus...</div>
        )}
      </div>

      {/* Attendance Rapid Marker */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="#10b981" /> Quick Attendance Marker
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '16px' }}>
          Enter student register number or barcode scan value to mark board status:
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="e.g. 910021104001"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.3)',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={() => handleMark('PRESENT')}
            style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', justifyContent: 'center' }}
          >
            <Check size={18} /> Mark Present
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => handleMark('ABSENT')}
            style={{ flex: 1, borderColor: 'rgba(244,63,94,0.4)', color: '#fb7185', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={18} /> Mark Absent
          </button>
        </div>

        {statusMessage && (
          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontSize: '0.9rem' }}>
            {statusMessage}
          </div>
        )}

        {/* Live marked queue */}
        {recentMarks.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Marks (Session)</span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentMarks.slice(0, 4).map((rec, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ color: '#ffffff' }}>{rec.registerNumber}</span>
                  <span className={`badge ${rec.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                    {rec.status} ({rec.time})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
