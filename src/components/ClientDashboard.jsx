import React, { useState } from 'react';
import { Calendar, Plus, FileText, Download, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, MapPin, User, LogOut, Bell, X, CheckCheck, Trash2 } from 'lucide-react';

export default function ClientDashboard({
  currentClient,
  invoices,
  events,
  bookings,
  openDates,
  notifications = [],
  onOpenCreateInvoice,
  onDownloadPDF,
  onSendToStudio,
  onLogout
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [searchDateInput, setSearchDateInput] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [deletedNotifIds, setDeletedNotifIds] = useState([]);

  // Client-specific notifications
  const clientNotifs = notifications.filter(n => {
    if (deletedNotifIds.includes(n.id)) return false;
    const matchType = n.recipientType === 'customer' || n.targetRole === 'client' || n.targetRole === 'customer' || n.targetRole === 'all';
    const matchUser =
      n.recipientId === currentClient?.id ||
      n.recipientId === 'all_customers' ||
      n.recipientEmail?.toLowerCase() === currentClient?.email?.toLowerCase() ||
      !n.recipientId;
    return matchType && matchUser;
  });

  const unreadCount = clientNotifs.filter(n => !n.read && !n.isRead && !readNotifIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    setReadNotifIds(clientNotifs.map(n => n.id));
  };

  const handleMarkSingleRead = (id) => {
    setReadNotifIds(prev => [...prev, id]);
  };

  const handleDeleteNotif = (id) => {
    setDeletedNotifIds(prev => [...prev, id]);
  };

  // Collect all booked dates from events, bookings, and invoices
  const bookedDatesSet = new Set();
  
  events?.forEach(e => {
    if (e.date && (e.status === 'YES' || e.status === 'Confirmed' || e.status === 'Pending')) {
      bookedDatesSet.add(e.date);
    }
  });

  bookings?.forEach(b => {
    if (b.date && b.status === 'Confirmed') {
      bookedDatesSet.add(b.date);
    }
  });

  openDates?.forEach(o => {
    if (o.date && o.status === 'Booked') {
      bookedDatesSet.add(o.date);
    }
  });

  invoices?.forEach(inv => {
    if (inv.eventDate) {
      bookedDatesSet.add(inv.eventDate);
    }
  });

  // Calculate days in selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const yearNum = parseInt(yearStr, 10) || new Date().getFullYear();
  const monthNum = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const calendarDays = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${dayStr}`;
    const isBooked = bookedDatesSet.has(fullDate);
    calendarDays.push({ dayNumber: d, dateStr: fullDate, isBooked });
  }

  // Filter client's own invoices
  const myInvoices = invoices?.filter(inv =>
    inv.clientID === currentClient?.id ||
    inv.clientEmail?.toLowerCase() === currentClient?.email?.toLowerCase() ||
    inv.clientPhone === currentClient?.phone
  ) || [];

  return (
    <div className="space-y-6 text-white">
      
      {/* 1. TOP WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Welcome, {currentClient?.name || 'Client'}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">CLIENT PORTAL DASHBOARD</h1>
          <p className="text-xs text-slate-400">
            Phone: <span className="text-slate-200 font-semibold">{currentClient?.phone}</span> |
            Email: <span className="text-slate-200 font-semibold">{currentClient?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Client Notifications Bell */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-amber-400 p-3 rounded-xl transition cursor-pointer shrink-0"
            title="My Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCreateInvoice}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 px-5 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE NEW INVOICE</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold p-3 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CLIENT NOTIFICATIONS MODAL */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 text-white flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">MY STUDIO NOTIFICATIONS</h3>
                  <p className="text-[11px] text-slate-400">{currentClient?.name || 'Customer'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
              {clientNotifs.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="font-bold text-slate-400">No notifications yet</p>
                  <p className="text-[11px] text-slate-600">Event invoice updates and studio alerts will show here.</p>
                </div>
              ) : (
                clientNotifs.map(n => {
                  const isRead = n.read || n.isRead || readNotifIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                        !isRead
                          ? 'bg-amber-500/10 border-amber-500/30 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isRead && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                          <h4 className="font-black text-xs text-white">{n.title || 'Studio Alert'}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {n.createdAt || n.timestamp || 'Today'}
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed">
                        {n.message || n.msg}
                      </p>

                      <div className="flex items-center justify-end gap-3 pt-1 text-[11px]">
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="text-amber-400 hover:underline font-bold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteNotif(n.id)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. AVAILABILITY CALENDAR SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">AVAILABILITY CALENDAR</h2>
              <p className="text-xs text-slate-400">Live Studio Schedule & Date Checker</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Legend Indicators */}
            <div className="flex items-center gap-3 text-xs font-bold shrink-0 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-400">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-400">Available</span>
              </div>
            </div>

            {/* Month Picker */}
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Date Availability Search Bar */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-300 font-bold">Check specific date availability:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={searchDateInput}
              onChange={e => setSearchDateInput(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg outline-none focus:border-amber-400"
            />
            {searchDateInput && (
              <div className="text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                {bookedDatesSet.has(searchDateInput) ? (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg">
                    🔴 BOOKED / BUSY
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    🟢 AVAILABLE FOR BOOKING
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {calendarDays.map((day) => (
            <div
              key={day.dateStr}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                day.isBooked
                  ? 'bg-red-950/20 border-red-500/30 text-red-300 hover:border-red-500'
                  : 'bg-slate-950/80 border-slate-800/80 text-emerald-300 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-lg font-black">{day.dayNumber}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${day.isBooked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </div>
              
              <div className="mt-2 text-[10px] font-black uppercase tracking-wider">
                {day.isBooked ? (
                  <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">BOOKED</span>
                ) : (
                  <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">AVAILABLE</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 3. MY SAVED INVOICES TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base text-white">MY SAVED INVOICES & BILLS ({myInvoices.length})</h2>
          </div>

          <button
            type="button"
            onClick={onOpenCreateInvoice}
            className="text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + New Invoice
          </button>
        </div>

        {myInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
            <p>You have not saved any event invoices yet.</p>
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="text-amber-400 font-bold underline hover:text-amber-300"
            >
              Click here to Generate your first Event Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Event Details</th>
                  <th className="py-2.5 px-3">City & Venue</th>
                  <th className="py-2.5 px-3">Grand Total</th>
                  <th className="py-2.5 px-3">Advance / Balance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-400">
                      #{inv.id ? inv.id.slice(0, 8).toUpperCase() : 'INV-1001'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{inv.eventType}</div>
                      <div className="text-[11px] text-slate-400">{inv.eventDate} ({inv.shift})</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-semibold">{inv.venue}</div>
                      <div className="text-[11px] text-slate-400">{inv.city} {inv.outOfLahore ? '(Out City)' : ''}</div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-white">
                      Rs. {(inv.grandTotal || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-emerald-400 font-bold">Adv: Rs. {(inv.advancePayment || 0).toLocaleString()}</div>
                      <div className="text-amber-400 font-bold">Bal: Rs. {(inv.remainingBalance || 0).toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onDownloadPDF(inv)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer text-[11px]"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendToStudio(inv)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                          title="Send to Hadi Studio"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Email</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
