import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function AuditHistorySection({
  auditLogs = [],
  onClearLogs,
  triggerAlert
}) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.user || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.targetId || '').toLowerCase().includes(search.toLowerCase());
      
      const matchAction = filterAction === 'All' || log.category === filterAction || log.action.toLowerCase().includes(filterAction.toLowerCase());

      let matchDate = true;
      if (startDate && log.timestamp) {
        matchDate = matchDate && new Date(log.timestamp) >= new Date(startDate);
      }
      if (endDate && log.timestamp) {
        matchDate = matchDate && new Date(log.timestamp) <= new Date(endDate + 'T23:59:59');
      }

      return matchSearch && matchAction && matchDate;
    });
  }, [auditLogs, search, filterAction, startDate, endDate]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      triggerAlert?.('No audit records to export', 'error');
      return;
    }

    const headers = ['Timestamp', 'Action', 'Category', 'User', 'Details', 'Target ID'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp || ''}"`,
      `"${l.action || ''}"`,
      `"${l.category || ''}"`,
      `"${l.user || 'Admin'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hadi_audit_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerAlert?.('Audit log successfully exported to CSV!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/25 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Admin Security & Audit Trail</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Tamper-Proof
              </span>
            </h2>
            <p className="text-xs text-amber-400/90 font-medium mt-0.5">
              Comprehensive chronological ledger of all invoice transfers, modifications, staff approvals and deletions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Action Category */}
        <div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="All">All Event Categories</option>
            <option value="transfer">Invoice Transfers & Locks</option>
            <option value="override">Admin Overrides</option>
            <option value="staff">Staff Account & Permissions</option>
            <option value="invoice">Invoices (Create/Edit)</option>
            <option value="product">Product & Stock</option>
            <option value="delete">Deletions</option>
            <option value="settings">Settings & Backup</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* End Date */}
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">User / Initiator</th>
                <th className="p-3.5">Details & Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                    <p className="font-bold text-slate-400">No audit logs recorded yet</p>
                    <p className="text-[11px] text-slate-600">All administrative operations and invoice actions will be captured here automatically.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                        {log.category || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">
                      {log.user || 'Admin (Malik Shahzad)'}
                    </td>
                    <td className="p-3.5 text-slate-300 leading-relaxed">
                      {log.details}
                      {log.targetId && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400">
                          ID: {log.targetId}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-4">
          <span>Total Logged Records: <strong>{filteredLogs.length}</strong></span>
          <span className="text-[11px] text-slate-500">Persistent storage synchronized with Firestore</span>
        </div>
      </div>

    </div>
  );
}
