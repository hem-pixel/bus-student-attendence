import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '32px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Denied</h3>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
            Your account ({user.role}) does not have permission to view this section.
          </p>
          <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Home</a>
        </div>
      </div>
    );
  }

  return children;
}
