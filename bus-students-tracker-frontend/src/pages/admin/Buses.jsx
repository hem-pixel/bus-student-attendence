import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { BusTable } from '../../components/admin/BusTable';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export default function Buses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [buses, setBuses] = useState([]);
  
  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBusId, setEditingBusId] = useState(null);
  const [busNumber, setBusNumber] = useState('');
  const [busStatus, setBusStatus] = useState('WORKING');
  const [busCapacity, setBusCapacity] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  // View details modal
  const [viewingBus, setViewingBus] = useState(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/buses');
      
      if (response.data && response.data.success) {
        setBuses(response.data.data);
      } else {
        setError('Failed to load buses');
      }
    } catch (err) {
      setError('Error fetching buses: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBusId(null);
    setBusNumber('');
    setBusStatus('WORKING');
    setBusCapacity('50');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (busId) => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return;
    setEditingBusId(bus.id);
    setBusNumber(bus.bus_number || '');
    setBusStatus(bus.status || 'WORKING');
    setBusCapacity(bus.capacity ? String(bus.capacity) : '50');
    setError('');
    setShowModal(true);
  };

  const handleSubmitBus = async (e) => {
    if (e) e.preventDefault();
    if (!busNumber.trim()) {
      setError('Bus number is required (e.g., BUS-001)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingBusId) {
        // Update bus
        const response = await apiClient.put(`/admin/buses/${editingBusId}`, {
          bus_number: busNumber.trim(),
          status: busStatus,
          capacity: parseInt(busCapacity, 10) || 50
        });

        if (response.data && response.data.success) {
          setBuses(buses.map(b => b.id === editingBusId ? response.data.data : b));
          setSuccessMsg(`Bus ${busNumber} updated successfully!`);
          setShowModal(false);
        } else {
          setError(response.data?.message || 'Failed to update bus');
        }
      } else {
        // Create bus
        const response = await apiClient.post('/admin/buses', {
          bus_number: busNumber.trim(),
          status: busStatus,
          capacity: parseInt(busCapacity, 10) || 50
        });

        if (response.data && response.data.success) {
          setBuses([...buses, response.data.data]);
          setSuccessMsg(`Bus ${busNumber} created successfully!`);
          setBusNumber('');
          setShowModal(false);
        } else {
          setError(response.data?.message || 'Failed to create bus');
        }
      }
    } catch (err) {
      setError((editingBusId ? 'Failed to update bus: ' : 'Failed to create bus: ') + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    const targetBus = buses.find(b => b.id === busId);
    const busName = targetBus ? targetBus.bus_number : 'this bus';
    if (!window.confirm(`Are you sure you want to delete ${busName}? This action cannot be undone.`)) return;

    try {
      const response = await apiClient.delete(`/admin/buses/${busId}`);
      
      if (response.data && response.data.success) {
        setBuses(buses.filter(b => b.id !== busId));
        setSuccessMsg(`Bus deleted successfully`);
      } else {
        setError(response.data?.message || 'Failed to delete bus');
      }
    } catch (err) {
      setError('Error deleting bus: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetails = (busId) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setViewingBus(bus);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar title="Buses Management" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fleet Management</h1>
                <p className="text-sm text-gray-500 mt-1">Register, monitor, and assign buses in your institutional fleet</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                >
                  + Add New Bus
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

            {/* Buses Table */}
            <BusTable
              buses={buses}
              loading={loading}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteBus}
              onViewDetails={handleViewDetails}
              onRefresh={fetchBuses}
            />

            {/* Create / Edit Bus Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingBusId ? 'Edit Bus' : 'Create New Bus'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitBus} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Bus Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., BUS-001 or TN-09-AB-1234"
                        value={busNumber}
                        onChange={(e) => setBusNumber(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Status
                      </label>
                      <select
                        value={busStatus}
                        onChange={(e) => setBusStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WORKING">Working (Operational)</option>
                        <option value="NOT_WORKING">Not Working (Maintenance / Breakdown)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Passenger Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={busCapacity}
                        onChange={(e) => setBusCapacity(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        {editingBusId ? 'Save Changes' : 'Create Bus'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Details Modal */}
            {viewingBus && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-blue-100 rounded-xl">🚌</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{viewingBus.bus_number}</h2>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          viewingBus.status === 'WORKING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingBus.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingBus(null)}
                      className="text-gray-400 hover:text-gray-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bus ID:</span>
                        <span className="font-mono text-gray-700">{viewingBus.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="font-semibold text-gray-800">{viewingBus.capacity || 50} passengers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned Driver:</span>
                        <span className="font-semibold text-gray-800">{viewingBus.drivers?.name || viewingBus.driver_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned In-Charge:</span>
                        <span className="font-semibold text-gray-800">{viewingBus.bus_incharges?.name || viewingBus.incharge_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Enrolled Students:</span>
                        <span className="font-semibold text-blue-600">{viewingBus.student_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setViewingBus(null)}>
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const targetId = viewingBus.id;
                        setViewingBus(null);
                        handleOpenEditModal(targetId);
                      }}
                    >
                      Edit Bus
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
