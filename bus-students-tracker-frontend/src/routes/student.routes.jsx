import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from '../pages/student/StudentLayout';
import Dashboard from '../pages/student/Dashboard';

export const StudentRoutes = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentRoutes;
