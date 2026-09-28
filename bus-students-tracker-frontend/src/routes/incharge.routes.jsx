import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InchargeDashboard from '../pages/incharge/Dashboard';
import Attendance from '../pages/incharge/Attendance';
import Map from '../pages/incharge/Map';
import Alerts from '../pages/incharge/Alerts';

export const InchargeRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<InchargeDashboard />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="map" element={<Map />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default InchargeRoutes;
