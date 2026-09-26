import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import Buses from '../pages/admin/Buses';
import Students from '../pages/admin/Students';
import Drivers from '../pages/admin/Drivers';
import InCharges from '../pages/admin/InCharges';
import LiveTrack from '../pages/admin/LiveTrack';
import Alerts from '../pages/admin/Alerts';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="buses" element={<Buses />} />
      <Route path="students" element={<Students />} />
      <Route path="drivers" element={<Drivers />} />
      <Route path="incharges" element={<InCharges />} />
      <Route path="live-track" element={<LiveTrack />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
