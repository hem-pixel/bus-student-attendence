import React, { useState } from 'react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const BusTable = ({
  buses = [],
  loading = false,
  onEdit,
  onDelete,
  onViewDetails,
  onRefresh
}) => {
  const [sortBy, setSortBy] = useState('bus_number');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredBuses = filterStatus
    ? buses.filter(bus => bus.status === filterStatus)
    : buses;

  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (sortBy === 'bus_number') {
      return (a.bus_number || '').localeCompare(b.bus_number || '');
    }
    return 0;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Filter by Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="WORKING">Working</option>
              <option value="NOT_WORKING">Not Working</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              🔄 Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bus Number</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">In-Charge</th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedBuses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  <div className="text-3xl mb-2">🚌</div>
                  <p className="font-medium text-gray-700">No buses found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting the filter or create a new bus.</p>
                </td>
              </tr>
            ) : (
              sortedBuses.map(bus => (
                <tr key={bus.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{bus.bus_number}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        bus.status === 'WORKING'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'WORKING' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {bus.drivers?.name || (bus.driver_name ? bus.driver_name : 'Unassigned')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {bus.bus_incharges?.name || (bus.incharge_name ? bus.incharge_name : 'Unassigned')}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-800">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-sm">
                      {bus.student_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(bus.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit && onEdit(bus.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete && onDelete(bus.id)}
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
        <span>Showing {sortedBuses.length} of {buses.length} buses</span>
        <span className="text-gray-400">Sort: By Bus Number</span>
      </div>
    </div>
  );
};

export default BusTable;
