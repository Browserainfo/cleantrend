import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Calendar, 
  Filter, 
  X, 
  Clock, 
  User, 
  Lock 
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

export const AuditLogModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { auditLogs, currentUser, currentRole, showToast } = useApp();
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const isManager = currentRole === 'MANAGER';

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;
    const matchesSearch = 
      log.performedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.orderId && log.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Financial Audit Log & Compliance Ledger</span>
                <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-600/60">
                  Immutable Audit Trail
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Timestamped records of every price modification, discount granted, payment collection, and handover.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by user, order, or event details..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded bg-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-1.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
          >
            <option value="ALL">All Event Types ({auditLogs.length})</option>
            <option value="ORDER_CREATED">Order Creations</option>
            <option value="PRICE_MODIFIED">Price Modifications</option>
            <option value="DISCOUNT_MODIFIED">Discounts Granted</option>
            <option value="PAYMENT_COLLECTED">Payments Collected</option>
            <option value="DELIVERY_COMPLETED">Handover & Deliveries</option>
            <option value="SETTINGS_UPDATED">Settings & Branding Updates</option>
            <option value="UNAUTHORIZED_ATTEMPT">Anti-Fraud Security Alerts</option>
          </select>
        </div>

        {/* Log Entries Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[11px]">
                <tr>
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">User & Role</th>
                  <th className="p-2.5">Action Type</th>
                  <th className="p-2.5">Audit Details & Financial Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    
                    <td className="p-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{log.performedByName}</div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                        log.performedByRole === 'ADMIN' ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {log.performedByRole}
                      </span>
                    </td>

                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.actionType === 'UNAUTHORIZED_ATTEMPT'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : log.actionType === 'PRICE_MODIFIED' || log.actionType === 'DISCOUNT_MODIFIED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>

                    <td className="p-2.5 text-slate-700 text-[11.5px] leading-relaxed">
                      <div>{log.details}</div>
                      {(log.previousValue || log.newValue) && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {log.previousValue && <span>Prev: {JSON.stringify(log.previousValue)} </span>}
                          {log.newValue && <span>→ New: {JSON.stringify(log.newValue)}</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
