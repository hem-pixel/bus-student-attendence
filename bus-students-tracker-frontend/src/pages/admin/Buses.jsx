import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { BusTable } from '../../components/admin/BusTable';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  Bus,
  Plus,
  X,
  ShieldCheck,
  Users,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Layers,
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';

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
        const response = await apiClient.post('/admin/buses', {
          bus_number: busNumber.trim(),
          status: busStatus,
          capacity: parseInt(busCapacity, 10) || 50
        });

        if (response.data && response.data.success) {
          setBuses([...buses, response.data.data]);
          setSuccessMsg(`Bus ${busNumber} registered successfully!`);
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

  // Fleet Quick Stats
  const totalBuses = buses.length;
  const operationalBuses = buses.filter(b => b.status === 'WORKING').length;
  const maintenanceBuses = buses.filter(b => b.status !== 'WORKING').length;
  const totalCapacity = buses.reduce((acc, curr) => acc + (parseInt(curr.capacity, 10) || 50), 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/60">
        {/* Navbar */}
        <Navbar title="Fleet Registry" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Institutional Transport Network</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Fleet Management</h1>
                <p className="text-sm text-slate-400 mt-1">Register, monitor, and assign buses in your institutional fleet</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                  className="shadow-glow-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Bus</span>
                </Button>
              </div>
            </div>

            {/* Fleet Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Fleet</span>
                  <Bus className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">{totalBuses}</div>
                <p className="text-xs text-slate-500 mt-1">Registered vehicles</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Operational</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{operationalBuses}</div>
                <p className="text-xs text-slate-500 mt-1">In service</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Maintenance</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">{maintenanceBuses}</div>
                <p className="text-xs text-slate-500 mt-1">Standby or repair</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Seats</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-sky-400">{totalCapacity}</div>
                <p className="text-xs text-slate-500 mt-1">Student capacity</p>
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
              <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {editingBusId ? 'Edit Vehicle Information' : 'Register New Vehicle'}
                        </h2>
                        <p className="text-xs text-slate-400">Configure fleet specs & status</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitBus} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Bus Number / Reg ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., BUS-001 or TN-09-AB-1234"
                        value={busNumber}
                        onChange={(e) => setBusNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Operational Status
                      </label>
                      <select
                        value={busStatus}
                        onChange={(e) => setBusStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        <option value="WORKING">Working (Operational)</option>
                        <option value="NOT_WORKING">Maintenance / Out of Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Passenger Capacity (Seats)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={busCapacity}
                        onChange={(e) => setBusCapacity(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                        {editingBusId ? 'Save Changes' : 'Register Vehicle'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Details Modal */}
            {viewingBus && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 text-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{viewingBus.bus_number}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          viewingBus.status === 'WORKING' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${viewingBus.status === 'WORKING' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          {viewingBus.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingBus(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="bg-slate-950/80 p-4 rounded-xl space-y-3 border border-slate-800/80">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 uppercase tracking-wider">Internal Reference</span>
                        <span className="font-mono text-slate-300">{viewingBus.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Capacity</span>
                        <span className="font-medium text-slate-200">{viewingBus.capacity || 50} passengers</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Assigned Driver</span>
                        <span className="font-medium text-slate-200">{viewingBus.drivers?.name || viewingBus.driver_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bus In-Charge</span>
                        <span className="font-medium text-slate-200">{viewingBus.bus_incharges?.name || viewingBus.incharge_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Enrolled Students</span>
                        <span className="font-semibold text-indigo-400">{viewingBus.student_count || 0} students</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
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
                      Edit Vehicle
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
