import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Bus, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  RotateCw, 
  Search, 
  Users, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function InCharges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [incharges, setIncharges] = useState([]);
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingInchargeId, setEditingInchargeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    bus_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIncharges();
    fetchBuses();
  }, []);

  const fetchIncharges = async () => {
    try {
      setLoading(true);
      let response;
      try {
        response = await apiClient.get('/admin/incharges');
      } catch (err) {
        response = await apiClient.get('/admin/bus-incharges');
      }
      
      if (response.data && response.data.success) {
        setIncharges(response.data.data || []);
      } else {
        setError('Failed to load in-charges');
      }
    } catch (err) {
      setError('Error fetching in-charges: ' + (err.response?.data?.message || err.message));
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
      console.warn('Failed to fetch buses:', err.message);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingInchargeId(null);
    setFormData({
      name: '',
      phone_number: '',
      email: '',
      bus_id: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (incharge) => {
    setEditingInchargeId(incharge.id);
    setFormData({
      name: incharge.name || '',
      phone_number: incharge.phone_number || '',
      email: incharge.email || '',
      bus_id: incharge.buses?.id || incharge.bus_id || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmitIncharge = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError('In-Charge name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingInchargeId) {
        // Update in-charge
        const response = await apiClient.put(`/admin/incharges/${editingInchargeId}`, {
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          email: formData.email.trim()
        });

        if (response.data && response.data.success) {
          if (formData.bus_id) {
            try {
              await apiClient.put(`/admin/buses/${formData.bus_id}/assign-incharge`, {
                incharge_id: editingInchargeId
              });
            } catch (assignErr) {
              console.warn('Incharge bus assign notice:', assignErr.message);
            }
          }

          setSuccessMsg(`In-Charge ${formData.name} updated successfully!`);
          setShowModal(false);
          fetchIncharges();
        } else {
          setError(response.data?.message || 'Failed to update in-charge');
        }
      } else {
        // Create in-charge
        const response = await apiClient.post('/admin/incharges', {
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          email: formData.email.trim(),
          user_id: ''
        });

        if (response.data && response.data.success) {
          const newIncharge = response.data.data;
          if (formData.bus_id && newIncharge?.id) {
            try {
              await apiClient.put(`/admin/buses/${formData.bus_id}/assign-incharge`, {
                incharge_id: newIncharge.id
              });
            } catch (assignErr) {
              console.warn('Incharge bus assign notice:', assignErr.message);
            }
          }

          setSuccessMsg(`In-Charge ${formData.name} added successfully!`);
          setShowModal(false);
          fetchIncharges();
        } else {
          setError(response.data?.message || 'Failed to create in-charge');
        }
      }
    } catch (err) {
      setError((editingInchargeId ? 'Failed to update in-charge: ' : 'Failed to create in-charge: ') + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncharge = async (inchargeId, inchargeName) => {
    if (!window.confirm(`Are you sure you want to delete in-charge ${inchargeName || ''}?`)) return;

    try {
      const response = await apiClient.delete(`/admin/incharges/${inchargeId}`);
      if (response.data && response.data.success) {
        setIncharges(incharges.filter(i => i.id !== inchargeId));
        setSuccessMsg('In-charge deleted successfully');
      } else {
        setError(response.data?.message || 'Failed to delete in-charge');
      }
    } catch (err) {
      setError('Error deleting in-charge: ' + (err.response?.data?.message || err.message));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'IC';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const filteredIncharges = incharges.filter(i => {
    const q = searchTerm.toLowerCase();
    const name = (i.name || '').toLowerCase();
    const phone = (i.phone_number || '').toLowerCase();
    const email = (i.email || '').toLowerCase();
    const busNum = (i.buses?.bus_number || i.bus_number || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || email.includes(q) || busNum.includes(q);
  });

  const assignedCount = incharges.filter(i => i.buses?.bus_number || i.bus_number).length;
  const unassignedCount = incharges.length - assignedCount;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar title="Faculty In-Charges" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Bus In-Charges Directory
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Faculty supervisors, student roll call coordinators and route monitoring personnel
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchIncharges}
                  className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                  className="shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New In-Charge
                </Button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total In-Charges</span>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white mt-2">{incharges.length}</div>
                <p className="text-xs text-slate-400 mt-1">Supervisors registered on platform</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned To Route</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">{assignedCount}</div>
                <p className="text-xs text-slate-400 mt-1">Overseeing student transit attendance</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unassigned / Standby</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">{unassignedCount}</div>
                <p className="text-xs text-slate-400 mt-1">Available for substitution assignments</p>
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

            {/* In-Charges Table Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
              {/* Filter / Search Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-200">{filteredIncharges.length}</span> of {incharges.length} supervisors
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">In-Charge Profile</th>
                      <th className="px-6 py-4">Institutional Email</th>
                      <th className="px-6 py-4">Contact Phone</th>
                      <th className="px-6 py-4">Supervised Unit</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-sm">
                    {filteredIncharges.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                          <p className="font-semibold text-slate-300">No in-charge records found</p>
                          <p className="text-xs text-slate-500 mt-1">Try modifying search filters or register a new bus in-charge.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredIncharges.map(incharge => {
                        const hasBus = incharge.buses?.bus_number || incharge.bus_number;
                        return (
                          <tr key={incharge.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-500/10">
                                  {getInitials(incharge.name)}
                                </div>
                                <div>
                                  <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                    {incharge.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    UID: {incharge.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-300 text-xs">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                {incharge.email || <span className="text-slate-600">Unspecified</span>}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                {incharge.phone_number || <span className="text-slate-600">Unlisted</span>}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {hasBus ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  <Bus className="w-3 h-3" />
                                  {incharge.buses?.bus_number || incharge.bus_number}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(incharge)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                  title="Edit details"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIncharge(incharge.id, incharge.name)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-white hover:bg-rose-600/80 transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                <span>Total Registered Supervisors: {incharges.length}</span>
                <span className="font-mono text-[11px]">System Status: Operational</span>
              </div>
            </div>

            {/* Create / Edit In-Charge Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {editingInchargeId ? 'Edit In-Charge Details' : 'Register Bus In-Charge'}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitIncharge} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        In-Charge Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Prof. Sundar Rajan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Institutional Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. incharge@college.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Mobile Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9840123456"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Assign Dedicated Bus (Optional)
                      </label>
                      <select
                        value={formData.bus_id}
                        onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">-- No Bus Assigned --</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                            {b.bus_number} ({b.status || 'Active'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                        className="shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500"
                      >
                        {editingInchargeId ? 'Save Changes' : 'Confirm Registration'}
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
