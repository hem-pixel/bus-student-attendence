import React, { useState } from 'react';
import { 
  Bus, 
  RotateCw, 
  Eye, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  User, 
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredBuses = buses.filter(bus => {
    const matchesStatus = filterStatus ? bus.status === filterStatus : true;
    const matchesSearch = searchTerm
      ? (bus.bus_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.drivers?.name || bus.driver_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.bus_incharges?.name || bus.incharge_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const sortedBuses = [...filteredBuses].sort((a, b) => {
    return (a.bus_number || '').localeCompare(b.bus_number || '');
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
      {/* Table Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by bus number, driver, or in-charge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 cursor-pointer appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="WORKING">Working</option>
                <option value="NOT_WORKING">Maintenance / Down</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-3.5">Bus Identity</th>
              <th className="px-6 py-3.5">Operational Status</th>
              <th className="px-6 py-3.5">Assigned Driver</th>
              <th className="px-6 py-3.5">Bus In-Charge</th>
              <th className="px-6 py-3.5 text-center">Boarding Capacity</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {sortedBuses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto mb-3">
                    <Bus className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Fleet Vehicles Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchTerm || filterStatus ? 'Try clearing your search or status filter to see registered buses.' : 'Register new campus transit vehicles using the button above.'}
                  </p>
                </td>
              </tr>
            ) : (
              sortedBuses.map((bus) => {
                const isWorking = bus.status === 'WORKING';
                return (
                  <tr key={bus.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Bus ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {bus.bus_number}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{bus.id?.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isWorking
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isWorking ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        <span>{isWorking ? 'Operational' : 'Maintenance'}</span>
                      </span>
                    </td>

                    {/* Driver */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">
                          {bus.drivers?.name || bus.driver_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Incharge */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">
                          {bus.bus_incharges?.name || bus.incharge_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Students Count */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-800 dark:text-slate-200">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{bus.student_count || 0}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails && onViewDetails(bus.id)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit && onEdit(bus.id)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Edit Bus"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete && onDelete(bus.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Bus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3.5 bg-slate-50/60 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
        <span>Showing {sortedBuses.length} of {buses.length} registered vehicles</span>
        <span>Fleet registry synchronized</span>
      </div>
    </div>
  );
};

export default BusTable;
