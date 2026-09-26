import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { 
  Car, 
  Phone, 
  CreditCard, 
  Bus, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  RotateCw, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck
} from 'lucide-react';

export default function Drivers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const filteredDrivers = drivers.filter(d => {
    const q = searchTerm.toLowerCase();
    const name = (d.name || '').toLowerCase();
    const phone = (d.phone_number || '').toLowerCase();
    const lic = (d.license_number || '').toLowerCase();
    const busNum = (d.buses?.bus_number || d.bus_number || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || lic.includes(q) || busNum.includes(q);
  });

  const assignedCount = drivers.filter(d => d.buses?.bus_number || d.bus_number).length;
  const unassignedCount = drivers.length - assignedCount;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <Navbar title="Drivers Directory" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Drivers Directory
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Institutional bus operators, licensing credentials and route assignments
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchDrivers}
                  className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  onClick={handleOpenCreateModal}
                  className="shadow-lg shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New Driver
                </Button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Operators</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Car className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white mt-2">{drivers.length}</div>
                <p className="text-xs text-slate-400 mt-1">Authorized campus fleet pilots</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned To Fleet</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">{assignedCount}</div>
                <p className="text-xs text-slate-400 mt-1">Currently operating active buses</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reserve / Available</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">{unassignedCount}</div>
                <p className="text-xs text-slate-400 mt-1">Available for backup or relief shifts</p>
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

            {/* Drivers Table Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
              {/* Filter / Search Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, license, bus..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  Showing <span className="font-semibold text-slate-200">{filteredDrivers.length}</span> of {drivers.length} drivers
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Driver Profile</th>
                      <th className="px-6 py-4">Contact Phone</th>
                      <th className="px-6 py-4">Commercial License</th>
                      <th className="px-6 py-4">Assigned Unit</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-sm">
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          <Car className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                          <p className="font-semibold text-slate-300">No driver records found</p>
                          <p className="text-xs text-slate-500 mt-1">Try modifying search filters or register a new fleet operator.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map(driver => {
                        const hasBus = driver.buses?.bus_number || driver.bus_number;
                        return (
                          <tr key={driver.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-500/10">
                                  {getInitials(driver.name)}
                                </div>
                                <div>
                                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {driver.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    UID: {driver.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                {driver.phone_number || <span className="text-slate-600">Unlisted</span>}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                {driver.license_number || <span className="text-slate-600">Pending</span>}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {hasBus ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  <Bus className="w-3 h-3" />
                                  {driver.buses?.bus_number || driver.bus_number}
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
                                  onClick={() => handleOpenEditModal(driver)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                  title="Edit details"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDriver(driver.id, driver.name)}
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
                <span>Total Operators: {drivers.length}</span>
                <span className="font-mono text-[11px]">System Status: Ready</span>
              </div>
            </div>

            {/* Create / Edit Driver Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Car className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {editingDriverId ? 'Edit Driver Operator' : 'Register Fleet Driver'}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmitDriver} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Driver Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Contact Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Commercial Driving License
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DL-04-2015-1234567"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Assign Dedicated Bus (Optional)
                      </label>
                      <select
                        value={formData.bus_id}
                        onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                        className="shadow-lg shadow-blue-600/30"
                      >
                        {editingDriverId ? 'Save Changes' : 'Confirm Registration'}
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
