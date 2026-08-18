import React, { useState, useMemo } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  FileText,
  UserCheck,
  Package,
  Clock,
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function NotificationCenterModal({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onMarkSingleRead,
  onDeleteSingle,
  onClearAllNotifications,
  onOpenInvoiceModal,
  triggerAlert
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'invoice_transfer' | 'staff_request' | 'invoice' | 'stock' | 'system'
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  if (!isOpen) return null;

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    const matchSearch = (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (n.message || n.msg || '').toLowerCase().includes(search.toLowerCase()) ||
                        (n.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (n.invoiceNumber || '').toLowerCase().includes(search.toLowerCase());
    
    let matchType = true;
    if (filterType === 'invoice_transfer') matchType = n.type === 'invoice_transfer' || (n.title || '').includes('Sent to Hadi Studio') || (n.title || '').includes('Transfer');
    else if (filterType === 'staff_request') matchType = n.type === 'staff_request' || (n.title || '').includes('Staff');
    else if (filterType === 'invoice') matchType = n.type === 'invoice' || (n.title || '').includes('Invoice');
    else if (filterType === 'stock') matchType = n.type === 'stock' || (n.title || '').includes('Stock') || (n.title || '').includes('Product');
    else if (filterType === 'system') matchType = n.type === 'system' || (n.title || '').includes('Settings') || (n.title || '').includes('Backup');

    return matchSearch && matchType;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  const getIconForType = (type, title = '') => {
    if (type === 'invoice_transfer' || title.includes('Hadi Studio') || title.includes('Transfer')) {
      return <Send className="w-4 h-4 text-purple-400" />;
    }
    if (type === 'staff_request' || title.includes('Staff')) {
      return <UserCheck className="w-4 h-4 text-amber-400" />;
    }
    if (type === 'stock' || title.includes('Stock') || title.includes('Product')) {
      return <Package className="w-4 h-4 text-sky-400" />;
    }
    if (type === 'invoice' || title.includes('Invoice')) {
      return <FileText className="w-4 h-4 text-emerald-400" />;
    }
    return <Bell className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Admin Notification Center & History</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-400/90 font-medium">Real-time studio alerts, invoice transfers & system audit logs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by invoice #, customer, keyword..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Mark All Read</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={() => setIsDeleteAllOpen(true)}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold flex items-center gap-1.5 border border-red-500/30 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'invoice_transfer', label: 'Invoice Transfers (Studio)' },
            { id: 'staff_request', label: 'Staff Requests' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'stock', label: 'Stock & Products' },
            { id: 'system', label: 'System' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Bell className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm font-bold text-slate-400">No notifications found</p>
              <p className="text-xs text-slate-600">All alerts and actions will appear here in real-time.</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const isUnread = !n.read && !n.isRead;
              return (
                <div
                  key={n.id}
                  onClick={() => onMarkSingleRead?.(n.id)}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    isUnread
                      ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUnread ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {getIconForType(n.type, n.title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                          {n.title || 'System Notification'}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        )}
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {n.timestamp || (n.date ? new Date(n.date).toLocaleString() : 'Just now')}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                        {n.message || n.msg || 'Notification action executed successfully.'}
                      </p>

                      {/* Extra details if available */}
                      {(n.invoiceNumber || n.customerName || n.amount) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                          {n.invoiceNumber && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                              Inv: {n.invoiceNumber}
                            </span>
                          )}
                          {n.customerName && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              Client: {n.customerName}
                            </span>
                          )}
                          {n.amount && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                              Rs. {Number(n.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions on right */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {(n.invoiceId || n.linkedStudioInvoiceId || n.invoiceNumber) && onOpenInvoiceModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInvoiceModal(n);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <span>View Invoice</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSingle?.(n.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span>Showing {filteredNotifications.length} of {notifications.length} logged events</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            Close Center
          </button>
        </div>

      </div>

      {/* Delete All Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={onClearAllNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notification records? This action is permanent and will clear your entire alert history."
        itemName="All Notification History"
        itemType="Collection"
      />

    </div>
  );
}
