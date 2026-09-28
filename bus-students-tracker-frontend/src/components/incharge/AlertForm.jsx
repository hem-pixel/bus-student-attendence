import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ErrorAlert } from '../common/ErrorAlert';

export const AlertForm = ({ busId, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    problem_type: '',
    description: ''
  });
  const [error, setError] = useState('');

  const problemTypes = [
    'Engine Problem',
    'Brake Issue',
    'Tire Problem',
    'Electrical Problem',
    'Accident',
    'Traffic Delay',
    'Medical Emergency',
    'Fuel Shortage',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.problem_type.trim()) {
      setError('Please select a problem category');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a brief description of the incident');
      return;
    }

    const success = await onSubmit(formData);
    if (success !== false) {
      setFormData({ problem_type: '', description: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <ErrorAlert
          message={error}
          type="error"
          onClose={() => setError('')}
        />
      )}

      {/* Problem Type Select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Problem Type <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.problem_type}
            onChange={(e) => setFormData({ ...formData, problem_type: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select a problem classification</option>
            {problemTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Description Textarea */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Incident Details <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          placeholder="Explain the incident, current vehicle location, student safety condition, or assistance needed..."
          rows="4"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-none disabled:opacity-50 leading-relaxed"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Transmit Emergency Alert</span>
      </Button>
    </form>
  );
};
