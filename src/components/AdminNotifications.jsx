import React, { useState } from 'react';
import {
  Bell,
  Send,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Users,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import SendNotificationModal from './SendNotificationModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function AdminNotifications({
  notifications = [],
  staffMembers = [],
  customers = [],
  onSendNotification,
  onMarkSingleRead,
  onMarkAllRead,
  onDeleteSingle,
  onClearAll,
  onOpenInvoiceModal,
  triggerAlert
}) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'staff' | 'customer' | 'event' | 'invoice' | 'location' | 'system'
  const [filterReadStatus, setFilterReadStatus] = useState('all'); // 'all' | 'unread' | 'read'

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    const q = search.toLowerCase();
    const matchSearch =
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || n.msg || '').toLowerCase().includes(q) ||
      (n.recipientName || '').toLowerCase().includes(q) ||
      (n.recipientEmail || '').toLowerCase().includes(q) ||
      (n.invoiceNumber || '').toLowerCase().includes(q);

    let matchCat = true;
    if (filterCategory === 'staff') matchCat = n.recipientType === 'staff';
    else if (filterCategory === 'customer') matchCat = n.recipientType === 'customer';
    else if (filterCategory === 'event') matchCat = n.type === 'event' || n.type === 'booking';
    else if (filterCategory === 'invoice') matchCat = n.type === 'invoice' || n.type === 'payment';
    else if (filterCategory === 'location') matchCat = n.type === 'location';
    else if (filterCategory === 'system') matchCat = n.type === 'system' || n.type === 'important';

    let matchRead = true;
    const isUnread = !n.read && !n.isRead;
    if (filterReadStatus === 'unread') matchRead = isUnread;
    else if (filterReadStatus === 'read') matchRead = !isUnread;

    return matchSearch && matchCat && matchRead;
  });

  const totalCount = notifications.length;
  const staffCount = notifications.filter(n => n.recipientType === 'staff').length;
  const customerCount = notifications.filter(n => n.recipientType === 'customer').length;
  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  const getTypeIcon = (type = '') => {
    switch (type) {
      case 'event':
      case 'booking':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'invoice':
      case 'payment':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-rose-400" />;
      case 'important':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-5 text-white">
      
      {/* 1. HEADER & ACTION BAR */}
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Notifications Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">NOTIFICATION CONTROL CENTER</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast targeted event updates, invoice receipts, and duty alerts to Staff & Customers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 transition flex items-center gap-2 text-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>SEND NOTIFICATION</span>
          </button>

          <button
            type="button"
            onClick={onMarkAllRead}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-amber-400" />
            <span>Mark All Read</span>
          </button>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDeleteAllOpen(true)}
              className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 font-medium block">Total Logged</span>
          <span className="text-xl font-black text-white mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-[#0f172a] border border-blue-500/30 p-4 rounded-xl">
          <span className="text-blue-400 font-medium block">Staff Broadcasts</span>
          <span className="text-xl font-black text-white mt-1 block">{staffCount}</span>
        </div>

        <div className="bg-[#0f172a] border border-emerald-500/30 p-4 rounded-xl">
          <span className="text-emerald-400 font-medium block">Customer Alerts</span>
          <span className="text-xl font-black text-white mt-1 block">{customerCount}</span>
        </div>

        <div className="bg-[#0f172a] border border-amber-500/30 p-4 rounded-xl">
          <span className="text-amber-400 font-medium block">Unread Pending</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">{unreadCount}</span>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications by title, message, recipient or invoice..."
            className="w-full bg-slate-950 border border-slate-700 pl-10 pr-3 py-2.5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: 'all', label: 'All' },
            { id: 'staff', label: 'Staff' },
            { id: 'customer', label: 'Customer' },
            { id: 'event', label: 'Events' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'location', label: 'Location' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                filterCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. NOTIFICATION HISTORY LIST */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <Bell className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-slate-400">No notifications found in this view</p>
            <p className="text-xs text-slate-600">Dispatched staff alerts, client updates, and system logs will show here.</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const isUnread = !n.read && !n.isRead;
            return (
              <div
                key={n.id}
                onClick={() => onMarkSingleRead?.(n.id)}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs ${
                  isUnread
                    ? 'bg-gradient-to-r from-amber-500/10 via-[#0f172a] to-[#0f172a] border-amber-500/40 shadow-md'
                    : 'bg-[#0f172a] border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUnread ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-black text-sm ${isUnread ? 'text-white' : 'text-slate-200'}`}>
                        {n.title || 'Studio Notification'}
                      </h4>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                          NEW
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        n.recipientType === 'staff' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        To: {n.recipientName || (n.recipientType === 'staff' ? 'All Staff' : 'Customer')}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">
                      {n.message || n.msg}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{n.createdAt || n.timestamp || 'Just now'}</span>
                      </span>
                      <span>•</span>
                      <span>Sent by: <strong className="text-slate-400">{n.sentBy || 'Admin'}</strong></span>
                      {n.invoiceNumber && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-mono font-bold">Inv #{n.invoiceNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions on right */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {n.invoiceNumber && onOpenInvoiceModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInvoiceModal(n);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      <span>View Invoice</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSingle?.(n.id);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SEND NOTIFICATION MODAL */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        staffMembers={staffMembers}
        customers={customers}
        onSendNotification={onSendNotification}
        triggerAlert={triggerAlert}
      />

      {/* CLEAR ALL CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={onClearAll}
        title="Clear All Notifications History"
        message="Are you sure you want to delete all notifications? This action is irreversible."
        itemName="All Notifications"
        itemType="History"
      />

    </div>
  );
}
