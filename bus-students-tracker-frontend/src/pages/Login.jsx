import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorAlert } from '../components/common/ErrorAlert';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please verify credentials and backend status.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 text-white text-3xl rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-300">
              🚌
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Bus Students Tracker
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              College Transport Management System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
                  tabIndex="-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 shadow-lg shadow-blue-500/30"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Quick Selector */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700">
            <p className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <span>⚡</span> Quick Demo Logins (Click to autofill):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('admin@college.edu', 'Admin@123')}
                className="py-1.5 px-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-semibold text-center transition-colors truncate"
                title="admin@college.edu / Admin@123"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('incharge@college.edu', 'Incharge@123')}
                className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold text-center transition-colors truncate"
                title="incharge@college.edu / Incharge@123"
              >
                Incharge
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('student@college.edu', 'Student@123')}
                className="py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded font-semibold text-center transition-colors truncate"
                title="student@college.edu / Student@123"
              >
                Student
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Password pattern: <code className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">Role@123</code>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-6">
            © 2026 College Bus Tracking System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
