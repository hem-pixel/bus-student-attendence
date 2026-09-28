import React, { useEffect, useState, useCallback } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Bus, 
  Sparkles, 
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { StudentAttendanceList } from '../../components/incharge/StudentAttendanceList';

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState([]);
  const [bus, setBus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [initialAttendance, setInitialAttendance] = useState({});

  // 1. Fetch Bus & Students
  const fetchBusAndStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get assigned bus
      let busData = null;
      try {
        const busRes = await apiClient.get('/incharge/bus');
        if (busRes.data?.success && busRes.data?.data) {
          busData = busRes.data.data;
          setBus(busData);
        }
      } catch (busErr) {
        // Fallback to dashboard endpoint
        const dashRes = await apiClient.get('/incharge/dashboard');
        if (dashRes.data?.success && dashRes.data?.data?.bus) {
          busData = dashRes.data.data.bus;
          setBus(busData);
        }
      }

      if (!busData) {
        setError('No bus assigned to your account. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Fetch students for this bus
      let studentList = [];
      try {
        const stdRes = await apiClient.get('/incharge/students');
        if (stdRes.data?.success && Array.isArray(stdRes.data?.data)) {
          studentList = stdRes.data.data;
        }
      } catch (stdErr) {
        // Fallback to admin students endpoint filtered by bus_id
        const adminStdRes = await apiClient.get(`/admin/students?bus_id=${busData.id}`);
        if (adminStdRes.data?.success && Array.isArray(adminStdRes.data?.data)) {
          studentList = adminStdRes.data.data;
        }
      }

      setStudents(studentList);

      // Fetch existing attendance for the selected date
      await fetchExistingAttendance(busData.id, selectedDate);
    } catch (err) {
      console.error('Error fetching attendance setup:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load attendance roster');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // 2. Fetch existing attendance records for given bus and date
  const fetchExistingAttendance = async (busId, dateStr) => {
    try {
      const attRes = await apiClient.get(`/attendance?bus_id=${busId}&date=${dateStr}`);
      if (attRes.data?.success && Array.isArray(attRes.data?.data)) {
        const existingMap = {};
        attRes.data.data.forEach((rec) => {
          if (rec.student_id) {
            existingMap[rec.student_id] = rec.status;
          }
        });
        setInitialAttendance(existingMap);
      }
    } catch (attErr) {
      console.warn('Could not query existing date attendance:', attErr.message);
      // Fallback: leave default present
      setInitialAttendance({});
    }
  };

  useEffect(() => {
    fetchBusAndStudents();
  }, [fetchBusAndStudents]);

  // Change date handler
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (bus?.id) {
      fetchExistingAttendance(bus.id, newDate);
    }
  };

  const handleStepDay = (step) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + step);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  // 3. Save Attendance batch
  const handleSaveAttendance = async (attendanceData) => {
    if (!bus?.id) {
      setError('Assigned bus identifier is missing. Cannot persist attendance.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const entries = Object.entries(attendanceData);
      if (entries.length === 0) {
        setError('No students available to mark.');
        return;
      }

      // Execute batch posts to POST /api/attendance
      const promises = entries.map(([studentId, status]) => {
        return apiClient.post('/attendance', {
          student_id: studentId,
          bus_id: bus.id,
          status: status,
          attendance_date: selectedDate
        });
      });

      const results = await Promise.all(promises);
      const allSuccess = results.every((r) => r.data?.success !== false);

      if (allSuccess) {
        setSuccess(`Successfully marked and saved attendance for ${entries.length} students on ${selectedDate}!`);
        // Update initialAttendance cache
        setInitialAttendance(attendanceData);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Some attendance submissions failed to record. Please review.');
      }
    } catch (err) {
      console.error('Save attendance error:', err);
      setError(err.response?.data?.message || err.message || 'Error saving attendance records');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar 
          title="Daily Attendance Roll Call" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Roll Call Registry</span>
                </span>
                {bus && (
                  <span className="text-xs text-slate-400 font-medium">
                    Bus {bus.bus_number} • {students.length} Enrolled Passengers
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Student Attendance
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Mark passenger boarding status for morning and evening transit runs.
              </p>
            </div>

            {/* Date Selector Navigation Strip */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => handleStepDay(-1)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                />
                {isToday && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleStepDay(1)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Reset Today
                </button>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <ErrorAlert
              message={error}
              type="error"
              onClose={() => setError('')}
            />
          )}

          {success && (
            <ErrorAlert
              message={success}
              type="success"
              onClose={() => setSuccess('')}
            />
          )}

          {/* Bus Overview Pill Bar */}
          {bus && (
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Assigned Fleet: {bus.bus_number}</p>
                  <p className="text-slate-400">
                    Driver: {bus.drivers?.name || 'Assigned Driver'} {bus.drivers?.phone_number && `(${bus.drivers.phone_number})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Marking Date: <strong className="text-white">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
              </div>
            </div>
          )}

          {/* Student Attendance List Component */}
          <StudentAttendanceList
            students={students}
            loading={loading}
            onAttendanceChange={() => {}}
            onSave={handleSaveAttendance}
            saving={saving}
            initialAttendance={initialAttendance}
          />
        </main>
      </div>
    </div>
  );
}
