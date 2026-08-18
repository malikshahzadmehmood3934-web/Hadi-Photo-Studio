import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  Users,
  User,
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  DollarSign,
  MapPin,
  ShieldAlert
} from 'lucide-react';

export default function SendNotificationModal({
  isOpen,
  onClose,
  staffMembers = [],
  customers = [],
  onSendNotification,
  triggerAlert
}) {
  const [recipientType, setRecipientType] = useState('staff'); // 'staff' | 'customer'
  const [selectionMode, setSelectionMode] = useState('all'); // 'all' | 'single' | 'multiple'
  const [selectedSingleId, setSelectedSingleId] = useState('');
  const [selectedMultipleIds, setSelectedMultipleIds] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('general'); // 'general' | 'event' | 'booking' | 'invoice' | 'payment' | 'reminder' | 'location' | 'important' | 'system'
  const [scheduleType, setScheduleType] = useState('now'); // 'now' | 'later'
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentList = recipientType === 'staff' ? staffMembers : customers;
  const filteredList = currentList.filter(item => {
    const name = (item.name || item.fullName || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const q = searchFilter.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const toggleMultipleId = (id) => {
    setSelectedMultipleIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllMultiple = () => {
    if (selectedMultipleIds.length === filteredList.length) {
      setSelectedMultipleIds([]);
    } else {
      setSelectedMultipleIds(filteredList.map(item => item.id));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please provide a notification title and message');
      return;
    }

    // Determine targeted recipients list
    let targetRecipients = [];
    if (selectionMode === 'all') {
      targetRecipients = currentList.map(u => ({
        id: u.id,
        name: u.name || u.fullName || 'User',
        email: u.email || '',
        phone: u.phone || '',
        type: recipientType
      }));
    } else if (selectionMode === 'single') {
      if (!selectedSingleId) {
        setErrorMsg('Please select a recipient / User select karein');
        return;
      }
      const matched = currentList.find(u => u.id === selectedSingleId);
      if (matched) {
        targetRecipients = [{
          id: matched.id,
          name: matched.name || matched.fullName || 'User',
          email: matched.email || '',
          phone: matched.phone || '',
          type: recipientType
        }];
      }
    } else if (selectionMode === 'multiple') {
      if (selectedMultipleIds.length === 0) {
        setErrorMsg('Please select at least one recipient / Kam az kam aik user select karein');
        return;
      }
      targetRecipients = currentList
        .filter(u => selectedMultipleIds.includes(u.id))
        .map(u => ({
          id: u.id,
          name: u.name || u.fullName || 'User',
          email: u.email || '',
          phone: u.phone || '',
          type: recipientType
        }));
    }

    if (targetRecipients.length === 0) {
      setErrorMsg('No valid recipients found');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save notification records locally and in Firestore
      await onSendNotification?.({
        recipientType,
        selectionMode,
        recipients: targetRecipients,
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        scheduleType,
        scheduleDateTime: scheduleType === 'later' ? scheduleDateTime : null,
        sentAt: new Date().toISOString()
      });

      // 2. Dispatch email alerts via backend API
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: targetRecipients,
            title: title.trim(),
            message: message.trim(),
            type: notifType
          })
        });
      } catch (mailErr) {
        console.warn('Mail dispatch warning:', mailErr);
      }

      triggerAlert?.(`Notification sent to ${targetRecipients.length} ${recipientType}(s)! / Notification bhej di gayi`);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>SEND ROLE-BASED NOTIFICATION</span>
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">Broadcast alerts to Staff & Customers with email dispatch</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. RECIPIENT TYPE SELECTOR */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Select Recipient Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRecipientType('staff');
                  setSelectedSingleId('');
                  setSelectedMultipleIds([]);
                }}
                className={`py-2.5 px-4 rounded-xl font-black border transition flex items-center justify-center gap-2 cursor-pointer ${
                  recipientType === 'staff'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>STAFF MEMBERS ({staffMembers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecipientType('customer');
                  setSelectedSingleId('');
                  setSelectedMultipleIds([]);
                }}
                className={`py-2.5 px-4 rounded-xl font-black border transition flex items-center justify-center gap-2 cursor-pointer ${
                  recipientType === 'customer'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>CUSTOMERS ({customers.length})</span>
              </button>
            </div>
          </div>

          {/* 2. TARGET SELECTION MODE */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Recipient Targeting Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: `All ${recipientType === 'staff' ? 'Staff' : 'Customers'}` },
                { id: 'single', label: `One ${recipientType === 'staff' ? 'Staff' : 'Customer'}` },
                { id: 'multiple', label: `Multiple Selected` }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectionMode(mode.id)}
                  className={`py-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                    selectionMode === mode.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. RECIPIENT PICKER BASED ON MODE */}
          {selectionMode === 'single' && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-slate-400 font-medium">Select Specific {recipientType === 'staff' ? 'Staff' : 'Customer'}</label>
              <select
                value={selectedSingleId}
                onChange={e => setSelectedSingleId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-amber-400 outline-none"
              >
                <option value="">-- Choose recipient --</option>
                {currentList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.fullName} {item.email ? `(${item.email})` : ''} {item.phone ? `— ${item.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectionMode === 'multiple' && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-medium">
                  Select Recipients ({selectedMultipleIds.length} chosen)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllMultiple}
                  className="text-amber-400 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  {selectedMultipleIds.length === filteredList.length ? 'Deselect All' : 'Select All Filtered'}
                </button>
              </div>

              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filter users by name, phone or email..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredList.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">No matching users found</div>
                ) : (
                  filteredList.map(item => {
                    const isSelected = selectedMultipleIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleMultipleId(item.id)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="font-bold">{item.name || item.fullName}</span>
                          <span className="text-[10px] text-slate-500">{item.phone || item.email}</span>
                        </div>
                        {item.role && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {item.role}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. NOTIFICATION TITLE */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Notification Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Event Reminder / Camera Equipment Check"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          {/* 5. NOTIFICATION MESSAGE */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Notification Message / Details *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write the message text clearly..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-amber-400 outline-none resize-none"
            />
          </div>

          {/* 6. NOTIFICATION TYPE & SCHEDULE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Category / Type</label>
              <select
                value={notifType}
                onChange={e => setNotifType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-amber-400 outline-none"
              >
                <option value="general">🔔 General Notice</option>
                <option value="event">📷 Event Schedule</option>
                <option value="booking">📅 Booking Alert</option>
                <option value="invoice">📄 Invoice Update</option>
                <option value="payment">💰 Payment Reminder</option>
                <option value="reminder">⏰ Urgent Reminder</option>
                <option value="location">📍 Location Check-in Request</option>
                <option value="important">⚠️ Important / Urgent</option>
                <option value="system">⚙️ System Update</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Timing</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType('now')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    scheduleType === 'now'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Send Now
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('later')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    scheduleType === 'later'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Schedule Later
                </button>
              </div>
            </div>
          </div>

          {scheduleType === 'later' && (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Schedule Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={e => setScheduleDateTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-amber-400 outline-none"
              />
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'DISPATCHING...' : 'DISPATCH NOTIFICATION'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
