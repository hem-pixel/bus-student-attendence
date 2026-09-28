import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Loading from './pages/Loading';
import Login from './pages/Login';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { AdminRoutes } from './routes/admin.routes';
import { InchargeRoutes } from './routes/incharge.routes';
import { StudentRoutes } from './routes/student.routes';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Loading />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Phase 4 */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* In-Charge Routes - Phase 5 */}
      <Route
        path="/incharge/*"
        element={
          <ProtectedRoute requiredRoles={['BUS_INCHARGE']}>
            <InchargeRoutes />
          </ProtectedRoute>
        }
      />
      {/* Student Routes - Phase 6 */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRoles={['STUDENT']}>
            <StudentRoutes />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
