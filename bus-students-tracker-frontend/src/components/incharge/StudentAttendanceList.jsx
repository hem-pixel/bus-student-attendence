import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCheck, 
  XCircle, 
  Check, 
  X, 
  Save, 
  Users, 
  UserCheck, 
  UserX,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentAttendanceList = ({
  students = [],
  loading = false,
  onAttendanceChange,
  onSave,
  saving = false,
  initialAttendance = {}
}) => {
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');

  // Initialize or update attendance states
  useEffect(() => {
    if (students && students.length > 0) {
      setAttendance(prev => {
        const next = { ...prev };
        students.forEach(student => {
          if (!next[student.id]) {
            next[student.id] = initialAttendance[student.id] || 'PRESENT';
          }
        });
        return next;
      });
    }
  }, [students, initialAttendance]);

  const handleToggleAttendance = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId] || 'PRESENT';
      const updated = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      const newState = { ...prev, [studentId]: updated };
      onAttendanceChange?.(newState);
      return newState;
    });
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = 'PRESENT';
    });
    setAttendance(newAttendance);
    onAttendanceChange?.(newAttendance);
  };

  const handleMarkAllAbsent = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = 'ABSENT';
    });
    setAttendance(newAttendance);
    onAttendanceChange?.(newAttendance);
  };

  const handleSave = () => {
    onSave(attendance);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const regMatch = (student.register_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const stopMatch = (student.stop_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const genderMatch = filterGender === 'ALL' || student.gender === filterGender;
    return (nameMatch || regMatch || stopMatch) && genderMatch;
  });

  const presentCount = Object.values(attendance).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter(s => s === 'ABSENT').length;
  const totalCount = students.length;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <LoadingSpinner />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Loading student roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Toolbar & Summary Badges */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name, register no, or stop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Total: {totalCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Present: {presentCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
              <UserX className="w-3.5 h-3.5" />
              <span>Absent: {absentCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
              <Sparkles className="w-3 h-3" />
              <span>{attendanceRate}% Turnout</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
              className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold py-1.5 px-3 rounded-xl gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Present
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAbsent}
              className="text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-xs font-semibold py-1.5 px-3 rounded-xl gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Mark All Absent
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gender:</span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              {['ALL', 'MALE', 'FEMALE'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilterGender(g)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                    filterGender === g
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {g === 'ALL' ? 'All' : g === 'MALE' ? 'Boys' : 'Girls'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student List Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search or change the filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredStudents.map((student, idx) => {
              const isPresent = attendance[student.id] === 'PRESENT';
              return (
                <div
                  key={student.id}
                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-150 ${
                    isPresent
                      ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                      : 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/30'
                  }`}
                >
                  {/* Left: Index + Avatar + Name + RegNo + Stop */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 w-6 text-center">
                      {idx + 1}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors ${
                      isPresent
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                          {student.name}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                          student.gender === 'FEMALE' 
                            ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}>
                          {student.gender || 'STUDENT'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {student.register_number}
                        </span>
                        {student.stop_name && (
                          <span className="flex items-center gap-1 text-slate-500">
                            • Stop: <strong className="font-semibold text-slate-700 dark:text-slate-300">{student.stop_name}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleAttendance(student.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                      isPresent
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 ring-2 ring-rose-500/20'
                    }`}
                  >
                    {isPresent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating or Bottom Save Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl border border-slate-800 shadow-xl">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-white">Ready to save daily attendance?</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmed: {presentCount} Present • {absentCount} Absent ({totalCount} Total)
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={saving}
          onClick={handleSave}
          disabled={students.length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 gap-2 flex items-center justify-center"
        >
          <Save className="w-4 h-4" />
          <span>Save Attendance Record</span>
        </Button>
      </div>
    </div>
  );
};
