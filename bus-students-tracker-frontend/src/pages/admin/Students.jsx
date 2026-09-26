import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  GraduationCap,
  Users,
  Search,
  RotateCw,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Phone,
  Bus,
  Layers,
  Filter,
  User,
  ShieldCheck
} from 'lucide-react';

export default function Students() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [filterGender, setFilterGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    gender: 'MALE',
    bus_id: '',
    phone_number: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchBuses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/students');
      
      if (response.data && response.data.success) {
        setStudents(response.data.data || []);
      } else {
        setError('Failed to load students');
      }
    } catch (err) {
      setError('Error fetching students: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await apiClient.get('/admin/buses');
      if (response.data && response.data.success) {
        setBuses(response.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch buses for assignment dropdown:', err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStudentId(null);
    setFormData({
      name: '',
      register_number: '',
      gender: 'MALE',
      bus_id: '',
      phone_number: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name || '',
      register_number: student.register_number || '',
      gender: student.gender || 'MALE',
      bus_id: student.bus_id || (student.buses ? student.buses.id : ''),
      phone_number: student.phone_number || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmitStudent = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.register_number.trim()) {
      setError('Student name and register number are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingStudentId) {
        const response = await apiClient.put(`/admin/students/${editingStudentId}`, {
          name: formData.name.trim(),
          register_number: formData.register_number.trim(),
          gender: formData.gender,
          bus_id: formData.bus_id || null,
          phone_number: formData.phone_number.trim()
        });

        if (response.data && response.data.success) {
          if (formData.bus_id) {
            try {
              await apiClient.put(`/admin/students/${editingStudentId}/assign-bus`, {
                bus_id: formData.bus_id
              });
            } catch (assignErr) {
              console.warn('Bus assign notice:', assignErr.message);
            }
          }

          setSuccessMsg(`Student ${formData.name} updated successfully!`);
          setShowModal(false);
          fetchStudents();
        } else {
          setError(response.data?.message || 'Failed to update student');
        }
      } else {
        const response = await apiClient.post('/admin/students', {
          name: formData.name.trim(),
          register_number: formData.register_number.trim(),
          gender: formData.gender,
          bus_id: formData.bus_id || null,
          phone_number: formData.phone_number.trim(),
          user_id: ''
        });

        if (response.data && response.data.success) {
          setSuccessMsg(`Student ${formData.name} created successfully!`);
          setShowModal(false);
          fetchStudents();
        } else {
          setError(response.data?.message || 'Failed to create student');
        }
      }
    } catch (err) {
      setError((editingStudentId ? 'Failed to update student: ' : 'Failed to create student: ') + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentName || ''}?`)) return;

    try {
      const response = await apiClient.delete(`/admin/students/${studentId}`);
      if (response.data && response.data.success) {
        setStudents(students.filter(s => s.id !== studentId));
        setSuccessMsg('Student removed successfully');
      } else {
        setError(response.data?.message || 'Failed to delete student');
      }
    } catch (err) {
      setError('Error deleting student: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredStudents = students
    .filter(s => !filterGender || s.gender === filterGender)
    .filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.register_number && s.register_number.toLowerCase().includes(q))
      );
    });

  const stats = {
    total: students.length,
    boys: students.filter(s => s.gender === 'MALE').length,
    girls: students.filter(s => s.gender === 'FEMALE').length,
    assigned: students.filter(s => s.bus_id || s.bus_number || s.buses).length
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/60">
        {/* Navbar */}
        <Navbar title="Student Directory" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Enrolled Commuters</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Student Directory</h1>
                <p className="text-sm text-slate-400 mt-1">Manage student profiles, bus route assignments, and emergency contacts</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                  className="shadow-glow-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </Button>
              </div>
            </div>

            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Enrolled</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-slate-500 mt-1">Active transit roster</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Male Students</span>
                  <User className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-sky-400">{stats.boys}</div>
                <p className="text-xs text-slate-500 mt-1">Registered boys</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Female Students</span>
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">{stats.girls}</div>
                <p className="text-xs text-slate-500 mt-1">Registered girls</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Assigned Route</span>
                  <Bus className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{stats.assigned}</div>
                <p className="text-xs text-slate-500 mt-1">Bus allocated</p>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <ErrorAlert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}
            {successMsg && (
              <ErrorAlert
                message={successMsg}
                type="success"
                onClose={() => setSuccessMsg('')}
              />
            )}

            {/* Filters Bar & Search */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gender:</span>
                </div>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">All Students</option>
                  <option value="MALE">Male Only</option>
                  <option value="FEMALE">Female Only</option>
                  <option value="OTHER">Other</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStudents}
                  className="flex items-center gap-2 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/70 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Register Number</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Bus</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-slate-200">No students found</p>
                          <p className="text-xs text-slate-500 mt-1">Try modifying your search criteria or register a new student.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                                {getInitials(student.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{student.name}</div>
                                {student.phone_number ? (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span>{student.phone_number}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-500">No contact provided</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-300">
                            {student.register_number}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              student.gender === 'MALE'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : student.gender === 'FEMALE'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                student.gender === 'MALE' ? 'bg-sky-400' : student.gender === 'FEMALE' ? 'bg-purple-400' : 'bg-slate-400'
                              }`}></span>
                              {student.gender === 'MALE' ? 'Male' : student.gender === 'FEMALE' ? 'Female' : student.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {student.buses?.bus_number || student.bus_number ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200">
                                <Bus className="w-3.5 h-3.5 text-indigo-400" />
                                {student.buses?.bus_number || student.bus_number}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {student.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(student)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="Edit Student"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                                title="Delete Student"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3.5 bg-slate-950/70 border-t border-slate-800 text-xs font-medium text-slate-400 flex justify-between items-center">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
                <span className="text-slate-500">Live roster synchronized</span>
              </div>
            </div>

            {/* Create / Edit Student Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {editingStudentId ? 'Edit Student Profile' : 'Enroll New Student'}
                        </h2>
                        <p className="text-xs text-slate-400">Assign transit seat & details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitStudent} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Alex Johnson"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Register Number / Roll No <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 21CS001"
                        value={formData.register_number}
                        onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Assign to Bus Route (Optional)
                      </label>
                      <select
                        value={formData.bus_id}
                        onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="">-- No Bus Assigned --</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bus_number} ({b.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Parent Contact / Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 9876543210"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                      >
                        {editingStudentId ? 'Save Changes' : 'Enroll Student'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
