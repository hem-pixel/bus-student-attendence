import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export default function InCharges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [incharges, setIncharges] = useState([]);
  const [buses, setBuses] = useState([]);

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
      // Try /admin/incharges first, then /admin/bus-incharges
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
    if (!window.confirm(`Are you sure you want to delete In-Charge ${inchargeName || ''}?`)) return;

    try {
      const response = await apiClient.delete(`/admin/incharges/${inchargeId}`);
      if (response.data && response.data.success) {
        setIncharges(incharges.filter(i => i.id !== inchargeId));
        setSuccessMsg('In-Charge removed successfully');
      } else {
        setError(response.data?.message || 'Failed to delete in-charge');
      }
    } catch (err) {
      setError('Error deleting in-charge: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="In-Charges Management" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Bus In-Charges ({incharges.length})
                </h1>
                <p className="text-sm text-gray-500 mt-1">Supervisors responsible for on-board attendance & safety alerts</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                >
                  + Add New In-Charge
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

            {/* In-Charges Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supervisor Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Bus</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incharges.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                          <div className="text-3xl mb-2">👨‍💼</div>
                          <p className="font-medium text-gray-700">No in-charges found</p>
                          <p className="text-sm text-gray-400 mt-1">Register supervisors to oversee bus attendance.</p>
                        </td>
                      </tr>
                    ) : (
                      incharges.map(incharge => (
                        <tr key={incharge.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{incharge.name}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {incharge.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {incharge.email || incharge.users?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                            {incharge.phone_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {incharge.buses?.bus_number || incharge.bus_number ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                🚌 {incharge.buses?.bus_number || incharge.bus_number}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(incharge)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteIncharge(incharge.id, incharge.name)}
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
                <span>Total: {incharges.length} in-charges registered</span>
                <Button variant="outline" size="sm" onClick={fetchIncharges}>
                  🔄 Refresh
                </Button>
              </div>
            </div>

            {/* Create / Edit In-Charge Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingInchargeId ? 'Edit In-Charge Details' : 'Add New In-Charge'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitIncharge} className="space-y-4">
                    <Input
                      label="In-Charge Name *"
                      placeholder="e.g., Prof. Sarah Wilson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="e.g., sarah@college.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Input
                      label="Phone Number"
                      placeholder="e.g., 9876543210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Assign Bus (Optional)
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
                        {editingInchargeId ? 'Save Changes' : 'Add In-Charge'}
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
