import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';

export const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar title="Student Bus Tracker" />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children || <Outlet />}
      </main>

      <footer className="py-4 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
        Bus Students Tracker &bull; Student Transit Portal
      </footer>
    </div>
  );
};

export default StudentLayout;
