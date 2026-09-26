import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export default function Drivers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    license_number: '',
    bus_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchBuses();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/drivers');
      
      if (response.data && response.data.success) {
        setDrivers(response.data.data || []);
      } else {
        setError('Failed to load drivers');
      }
    } catch (err) {
      setError('Error fetching drivers: ' + (err.response?.data?.message || err.message));
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
    setEditingDriverId(null);
    setFormData({
      name: '',
      phone_number: '',
      license_number: '',
      bus_id: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriverId(driver.id);
    setFormData({
      name: driver.name || '',
      phone_number: driver.phone_number || '',
      license_number: driver.license_number || '',
      bus_id: driver.buses?.id || driver.bus_id || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmitDriver = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError('Driver name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingDriverId) {
        // Update driver
        const response = await apiClient.put(`/admin/drivers/${editingDriverId}`, {
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          license_number: formData.license_number.trim()
        });

        if (response.data && response.data.success) {
          // If bus assignment is selected
          if (formData.bus_id) {
            try {
              await apiClient.put(`/admin/buses/${formData.bus_id}/assign-driver`, {
                driver_id: editingDriverId
              });
            } catch (assignErr) {
              console.warn('Driver bus assign notice:', assignErr.message);
            }
          }

          setSuccessMsg(`Driver ${formData.name} updated successfully!`);
          setShowModal(false);
          fetchDrivers();
        } else {
          setError(response.data?.message || 'Failed to update driver');
        }
      } else {
        // Create driver
        const response = await apiClient.post('/admin/drivers', {
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          license_number: formData.license_number.trim(),
          user_id: ''
        });

        if (response.data && response.data.success) {
          const newDriver = response.data.data;
          // If bus assigned
          if (formData.bus_id && newDriver?.id) {
            try {
              await apiClient.put(`/admin/buses/${formData.bus_id}/assign-driver`, {
                driver_id: newDriver.id
              });
            } catch (assignErr) {
              console.warn('Driver bus assign notice:', assignErr.message);
            }
          }

          setSuccessMsg(`Driver ${formData.name} added successfully!`);
          setShowModal(false);
          fetchDrivers();
        } else {
          setError(response.data?.message || 'Failed to create driver');
        }
      }
    } catch (err) {
      setError((editingDriverId ? 'Failed to update driver: ' : 'Failed to create driver: ') + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (driverId, driverName) => {
    if (!window.confirm(`Are you sure you want to delete driver ${driverName || ''}?`)) return;

    try {
      const response = await apiClient.delete(`/admin/drivers/${driverId}`);
      if (response.data && response.data.success) {
        setDrivers(drivers.filter(d => d.id !== driverId));
        setSuccessMsg('Driver deleted successfully');
      } else {
        setError(response.data?.message || 'Failed to delete driver');
      }
    } catch (err) {
      setError('Error deleting driver: ' + (err.response?.data?.message || err.message));
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
        <Navbar title="Drivers Management" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Drivers Directory ({drivers.length})
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage institutional bus operators and licensing details</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                >
                  + Add New Driver
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

            {/* Drivers Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License Number</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Bus</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                          <div className="text-3xl mb-2">🚗</div>
                          <p className="font-medium text-gray-700">No drivers found</p>
                          <p className="text-sm text-gray-400 mt-1">Add drivers to assign them to your fleet.</p>
                        </td>
                      </tr>
                    ) : (
                      drivers.map(driver => (
                        <tr key={driver.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{driver.name}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {driver.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                            {driver.phone_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                            {driver.license_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {driver.buses?.bus_number || driver.bus_number ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                🚌 {driver.buses?.bus_number || driver.bus_number}
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
                                onClick={() => handleOpenEditModal(driver)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteDriver(driver.id, driver.name)}
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
                <span>Total: {drivers.length} drivers registered</span>
                <Button variant="outline" size="sm" onClick={fetchDrivers}>
                  🔄 Refresh
                </Button>
              </div>
            </div>

            {/* Create / Edit Driver Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingDriverId ? 'Edit Driver Details' : 'Add New Driver'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitDriver} className="space-y-4">
                    <Input
                      label="Driver Name *"
                      placeholder="e.g., Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />

                    <Input
                      label="Phone Number"
                      placeholder="e.g., 9876543210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />

                    <Input
                      label="Driver License Number"
                      placeholder="e.g., DL-04-2015-1234567"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
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
                        {editingDriverId ? 'Save Changes' : 'Add Driver'}
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
