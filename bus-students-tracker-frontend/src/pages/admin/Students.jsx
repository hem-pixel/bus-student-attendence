import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

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
        // Update student
        const response = await apiClient.put(`/admin/students/${editingStudentId}`, {
          name: formData.name.trim(),
          register_number: formData.register_number.trim(),
          gender: formData.gender,
          bus_id: formData.bus_id || null,
          phone_number: formData.phone_number.trim()
        });

        if (response.data && response.data.success) {
          // If bus assignment also changed
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
        // Create student
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
    girls: students.filter(s => s.gender === 'FEMALE').length
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="Students Management" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Directory</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 font-medium">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                    Total: <strong className="text-gray-900">{stats.total}</strong>
                  </span>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                    👦 Boys: <strong>{stats.boys}</strong>
                  </span>
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                    👧 Girls: <strong>{stats.girls}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                >
                  + Add New Student
                </Button>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700 shadow-sm"
                  aria-label="Toggle menu"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-6">
                <ErrorAlert
                  message={error}
                  type="error"
                  onClose={() => setError('')}
                />
              </div>
            )}
            {successMsg && (
              <div className="mb-6">
                <ErrorAlert
                  message={successMsg}
                  type="success"
                  onClose={() => setSuccessMsg('')}
                />
              </div>
            )}

            {/* Filters Bar & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Search student by name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Gender:
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Students</option>
                  <option value="MALE">Boys Only</option>
                  <option value="FEMALE">Girls Only</option>
                  <option value="OTHER">Other</option>
                </select>
                <Button variant="outline" size="sm" onClick={fetchStudents}>
                  🔄 Refresh
                </Button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Register Number</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Bus</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                          <div className="text-3xl mb-2">👨‍🎓</div>
                          <p className="font-medium text-gray-700">No students found</p>
                          <p className="text-sm text-gray-400 mt-1">Try modifying search or add a new student.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{student.name}</div>
                            {student.phone_number && (
                              <div className="text-xs text-gray-400">{student.phone_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-700">
                            {student.register_number}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              student.gender === 'MALE'
                                ? 'bg-blue-100 text-blue-800'
                                : student.gender === 'FEMALE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {student.gender === 'MALE' ? '👦 Male' : student.gender === 'FEMALE' ? '👧 Female' : student.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {student.buses?.bus_number || student.bus_number || (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              {student.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(student)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 text-xs font-medium text-gray-600 flex justify-between items-center">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
              </div>
            </div>

            {/* Create / Edit Student Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitStudent} className="space-y-4">
                    <Input
                      label="Full Name *"
                      placeholder="e.g., Alex Johnson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />

                    <Input
                      label="Register Number *"
                      placeholder="e.g., 21CS001"
                      value={formData.register_number}
                      onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                      required
                    />

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Assign to Bus (Optional)
                      </label>
                      <select
                        value={formData.bus_id}
                        onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- No Bus Assigned --</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bus_number} ({b.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Phone / Parent Contact"
                      placeholder="e.g., 9876543210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                        {editingStudentId ? 'Save Changes' : 'Add Student'}
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
