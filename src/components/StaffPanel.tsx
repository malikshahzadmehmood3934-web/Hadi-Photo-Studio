import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Bell,
  Send,
  CalendarPlus,
  Briefcase,
  AlertCircle,
  Check,
  X,
  Navigation,
  CheckCheck
} from 'lucide-react';
import {
  StaffMember,
  OpenDate,
  BookingRequest,
  EventDuty,
  CheckIn,
  PaymentRequest,
  AppNotification,
  StudioSettings,
  PaymentMethod
} from '../types';
import { StorageService } from '../lib/storage';

interface StaffPanelProps {
  currentStaff: StaffMember;
  settings: StudioSettings;
  openDates: OpenDate[];
  bookingRequests: BookingRequest[];
  eventDuties: EventDuty[];
  checkIns: CheckIn[];
  paymentRequests: PaymentRequest[];
  notifications: AppNotification[];
  onRefreshData: () => void;
  onUpdateManualCamera?: (eventId: string, cameraNotes: string) => void;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({
  currentStaff,
  settings,
  openDates,
  bookingRequests,
  eventDuties,
  checkIns,
  paymentRequests,
  notifications,
  onRefreshData,
  onUpdateManualCamera
}) => {
  const [activeTab, setActiveTab] = useState<'duties' | 'calendar' | 'opendates' | 'payment' | 'notifs'>('duties');

  // Decline Reason Modal State
  const [declineEventId, setDeclineEventId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Payment Request Form State
  const [pEventId, setPEventId] = useState('');
  const [pAmount, setPAmount] = useState<number | ''>(2000);
  const [pMethod, setPMethod] = useState<PaymentMethod>('JazzCash');
  const [pTitle, setPTitle] = useState(currentStaff.name);
  const [pAccount, setPAccount] = useState(currentStaff.phone);
  const [pReason, setPReason] = useState('');

  // Camera Notes State
  const [cameraInputs, setCameraInputs] = useState<Record<string, string>>({});

  // Geolocation Check-in Loading State
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [selectedNotifForLocation, setSelectedNotifForLocation] = useState<any>(null);

  // Local notifications read/deleted tracking
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [deletedNotifIds, setDeletedNotifIds] = useState<string[]>([]);

  // Selected calendar month
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Alert Banners
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Staff specific data
  const myDuties = eventDuties.filter(e => e.staffId === currentStaff.id);
  const myConfirmedDuties = myDuties.filter(e => e.status === 'YES');
  const availableOpenDates = openDates.filter(o => o.status === 'Open');
  const myBookings = bookingRequests.filter(b => b.staffId === currentStaff.id);
  const myPayments = paymentRequests.filter(p => p.staffId === currentStaff.id);
  const myCheckins = checkIns.filter(c => c.staffId === currentStaff.id);

  // Filter staff-only notifications
  const staffNotifs = notifications.filter(n => {
    if (deletedNotifIds.includes(n.id)) return false;
    const isForMe =
      n.recipientType === 'staff' &&
      (n.recipientId === currentStaff.id ||
       n.recipientId === 'all_staff' ||
       n.recipientEmail === currentStaff.email ||
       !n.recipientId);
    const isLegacyForMe = n.targetRole === 'staff' || n.targetRole === 'all' || n.staffId === currentStaff.id;
    return isForMe || isLegacyForMe;
  });

  const unreadStaffNotifsCount = staffNotifs.filter(n => !n.read && !n.isRead && !readNotifIds.includes(n.id)).length;

  const handleMarkNotifRead = (id: string) => {
    setReadNotifIds(prev => [...prev, id]);
    showAlert('Notification marked as read');
  };

  const handleDeleteNotif = (id: string) => {
    setDeletedNotifIds(prev => [...prev, id]);
    showAlert('Notification removed');
  };

  // Submit event location from notification
  const handleSubmitLocation = (locText: string) => {
    if (!locText.trim()) return;
    const checkin = {
      eventId: selectedNotifForLocation?.eventId || 'General-Location-Update',
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      location: locText.trim(),
      latitude: 30.1978,
      longitude: 71.4697,
      timestamp: new Date().toLocaleTimeString()
    };
    StorageService.addCheckIn(checkin);
    showAlert(`📍 Live location transmitted to Studio Admin for ${locText}!`);
    setSelectedNotifForLocation(null);
    setLocationInput('');
    onRefreshData();
  };

  // Duty Responses
  const handleRespondDuty = (eventId: string, status: 'YES' | 'NO') => {
    if (status === 'NO') {
      setDeclineEventId(eventId);
    } else {
      StorageService.respondDuty(eventId, 'YES');
      showAlert('You confirmed YES for this duty assignment!');
      onRefreshData();
    }
  };

  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineEventId) return;
    StorageService.respondDuty(declineEventId, 'NO', declineReason);
    showAlert('Duty declined and notification sent to Studio.', 'error');
    setDeclineEventId(null);
    setDeclineReason('');
    onRefreshData();
  };

  // Venue Arrival Check-In via Geolocation API
  const handleVenueCheckIn = async (eventId: string, locName: string) => {
    setCheckInLoadingId(eventId);

    if (!navigator.geolocation) {
      // Fallback if Geolocation is restricted or unsupported
      StorageService.addCheckIn({
        eventId,
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        location: locName,
        latitude: 30.1978, // Default Multan coordinates
        longitude: 71.4697
      });
      showAlert(`Venue arrival check-in sent to Admin for ${locName}!`);
      setCheckInLoadingId(null);
      onRefreshData();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        StorageService.addCheckIn({
          eventId,
          staffId: currentStaff.id,
          staffName: currentStaff.name,
          location: locName,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        showAlert(`📍 GPS Check-in verified at ${locName}! Notification sent to Admin.`);
        setCheckInLoadingId(null);
        onRefreshData();
      },
      (error) => {
        console.warn('Geolocation lookup notice:', error.message);
        // Fallback checkin
        StorageService.addCheckIn({
          eventId,
          staffId: currentStaff.id,
          staffName: currentStaff.name,
          location: locName,
          latitude: 30.1978,
          longitude: 71.4697
        });
        showAlert(`Check-in logged for ${locName}!`);
        setCheckInLoadingId(null);
        onRefreshData();
      },
      { timeout: 8000 }
    );
  };

  // Open Date Booking Request
  const handleBookOpenDate = (openDateId: string) => {
    const existing = myBookings.find(b => b.openDateId === openDateId);
    if (existing) {
      showAlert('You have already submitted a booking request for this open date!', 'error');
      return;
    }

    StorageService.requestBooking(currentStaff.id, openDateId);
    showAlert('Booking request submitted to Hadi Studio Admin!');
    onRefreshData();
  };

  // Request Advance Payment
  const handleRequestPay = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = pEventId || (myConfirmedDuties[0] ? myConfirmedDuties[0].id : '');

    if (!pAmount || pAmount <= 0) {
      showAlert('Please enter a valid advance amount', 'error');
      return;
    }

    StorageService.requestPayment({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      eventId: eventId || 'General Advance',
      amount: Number(pAmount),
      method: pMethod,
      title: pTitle,
      account: pAccount,
      reason: pReason || 'Duty Advance Payment'
    });

    setPReason('');
    showAlert('Advance payment request sent to Studio Admin!');
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      
      {/* Alert Notification Banner */}
      {alertMsg && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 ${
            alertMsg.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Staff Personal Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Photographer & Crew Portal</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Welcome back, {currentStaff.name}!</h2>
          <p className="text-xs text-slate-500">Phone: <span className="font-mono text-slate-800 font-semibold">{currentStaff.phone}</span> | Specialty: <span className="text-slate-800 font-semibold">{currentStaff.specialty || 'Lead Crew'}</span></p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-bold">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-center">
            <span className="text-slate-900 text-sm font-black block">{myDuties.length}</span>
            <span className="text-slate-500 text-[10px] uppercase">Assigned</span>
          </div>
          <div className="bg-green-50 border border-green-200 px-3 py-1.5 rounded text-center">
            <span className="text-green-700 text-sm font-black block">{myConfirmedDuties.length}</span>
            <span className="text-green-800 text-[10px] uppercase">Confirmed</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-center">
            <span className="text-blue-700 text-sm font-black block">{availableOpenDates.length}</span>
            <span className="text-blue-800 text-[10px] uppercase">Open Dates</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100 border border-slate-200 p-1 rounded-lg flex items-center justify-around sm:justify-start space-x-1 text-xs font-bold overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('duties')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'duties'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>My Duties ({myDuties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 Calendar ({myDuties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('opendates')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'opendates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>New Open Dates ({availableOpenDates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payment'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Request Advance</span>
        </button>

        <button
          onClick={() => setActiveTab('notifs')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'notifs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>🔔 Notifications</span>
          {unreadStaffNotifsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full">
              {unreadStaffNotifsCount}
            </span>
          )}
        </button>
      </div>

      {/* 1. MY ASSIGNED DUTIES */}
      {activeTab === 'duties' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>My Duty Schedule</span>
          </h3>

          {myDuties.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 space-y-1">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-xs">No duties currently assigned to you.</p>
              <p className="text-[11px] text-slate-500">Check the "New Open Dates" tab to book open wedding shoot dates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myDuties.map(evt => {
                const isCheckedIn = myCheckins.some(c => c.eventId === evt.id);

                return (
                  <div
                    key={evt.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm hover:border-blue-300 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 uppercase">{evt.date} [{evt.shift} Shift]</span>
                        <h4 className="font-bold text-slate-900 text-base mt-0.5">{evt.type}</h4>
                        <p className="text-slate-500 text-[11px]">{evt.role || 'Photographer Duty'}</p>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        evt.status === 'YES' ? 'bg-green-100 text-green-800 border border-green-200' :
                        evt.status === 'NO' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {evt.status === 'YES' ? 'Confirmed YES' : evt.status === 'NO' ? 'Declined NO' : 'Response Pending'}
                      </span>
                    </div>

                    <div className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-[11px]">
                      <p className="flex items-center gap-1.5 font-bold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Venue: {evt.locName}, {evt.city || 'Multan'}</span>
                      </p>
                      {evt.locAdd && <p className="text-slate-600 pl-5">Address: {evt.locAdd}</p>}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span>Total Pay: <strong className="text-slate-900">Rs. {evt.payment}</strong></span>
                        <span>Advance: <strong className="text-blue-600">Rs. {evt.advance}</strong></span>
                      </div>
                    </div>

                    {/* Duty Response Actions */}
                    {evt.status === 'Pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleRespondDuty(evt.id, 'YES')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>YES (Accept Duty)</span>
                        </button>
                        <button
                          onClick={() => handleRespondDuty(evt.id, 'NO')}
                          className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 rounded border border-slate-300 transition-colors cursor-pointer"
                        >
                          <span>NO (Decline)</span>
                        </button>
                      </div>
                    )}

                    {/* Venue Arrival Check-in Button */}
                    {evt.status === 'YES' && (
                      <div className="pt-1">
                        {/* Manual Camera Name / Notes Input */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Manual Camera Name / Notes:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cameraInputs[evt.id] !== undefined ? cameraInputs[evt.id] : ((evt as any).manualCamera || '')}
                              onChange={e => setCameraInputs(prev => ({ ...prev, [evt.id]: e.target.value }))}
                              placeholder="e.g. Sony A7IV, Canon R5"
                              className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = cameraInputs[evt.id] !== undefined ? cameraInputs[evt.id] : ((evt as any).manualCamera || '');
                                if (onUpdateManualCamera) {
                                  onUpdateManualCamera(evt.id, val);
                                  showAlert('Manual Camera details saved for duty!');
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer shrink-0"
                            >
                              Save Gear
                            </button>
                          </div>
                        </div>

                        {isCheckedIn ? (
                          <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-green-600" />
                            <span>Arrival Checked In at Venue!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVenueCheckIn(evt.id, evt.locName)}
                            disabled={checkInLoadingId === evt.id}
                            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Navigation className={`w-3.5 h-3.5 ${checkInLoadingId === evt.id ? 'animate-spin' : ''}`} />
                            <span>{checkInLoadingId === evt.id ? 'Locating GPS...' : '📍 I Have Reached Venue (Check-In)'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. STAFF CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>My Assigned Event Schedule & Duties</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calendar shows confirmed and assigned duties with venue locations, camera gear, and shoot shifts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Month:</label>
              <input
                type="month"
                value={calendarMonth}
                onChange={e => setCalendarMonth(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Calendar List / Cards for selected month */}
          {(() => {
            const monthDuties = myDuties.filter(d => (d.date || '').startsWith(calendarMonth));

            if (monthDuties.length === 0) {
              return (
                <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">No duties scheduled for {calendarMonth}.</p>
                  <p className="text-xs text-slate-500">New duty assignments from Hadi Studio management will appear here.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {monthDuties.map(evt => {
                  const isCheckedIn = myCheckins.some(c => c.eventId === evt.id);

                  return (
                    <div
                      key={evt.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-3 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Date badge and status */}
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-black rounded-lg text-xs">
                            📅 {evt.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.status === 'YES' ? 'bg-green-100 text-green-800' :
                            evt.status === 'NO' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {evt.status === 'YES' ? 'Confirmed' : evt.status === 'NO' ? 'Declined' : 'Pending'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{evt.type}</h4>
                          <p className="text-slate-500 text-[11px]">Shift: <strong className="text-slate-800">{evt.shift || 'Full Day'}</strong></p>
                        </div>

                        {/* Venue & Location */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{evt.locName}, {evt.city || 'Multan'}</span>
                          </p>
                          {evt.locAdd && (
                            <p className="text-slate-500 pl-5 text-[10px]">{evt.locAdd}</p>
                          )}
                          {evt.clientName && (
                            <p className="text-slate-600 pl-5 text-[10px]">
                              Client: <strong className="text-slate-800">{evt.clientName}</strong>
                            </p>
                          )}
                        </div>

                        {/* Assigned Camera Details */}
                        <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-lg space-y-1 text-[11px]">
                          <span className="text-[10px] font-black text-amber-800 uppercase block">📷 Assigned Equipment</span>
                          <p className="text-slate-800 font-semibold">
                            Camera: <span className="font-mono text-slate-950">{evt.camera || evt.manualCamera || 'Sony FX3 / A7IV'}</span>
                          </p>
                          {evt.cameraNotes && (
                            <p className="text-slate-600 text-[10px]">Gear: {evt.cameraNotes}</p>
                          )}
                        </div>
                      </div>

                      {/* Check-in / Location Transmit */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Pay: Rs. {evt.payment}</span>
                        {isCheckedIn ? (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>Checked In</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVenueCheckIn(evt.id, evt.locName)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Send GPS Location</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. BROWSE NEW OPEN DATES */}
      {activeTab === 'opendates' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-blue-600" />
            <span>Available Studio Open Dates for Booking</span>
          </h3>

          {availableOpenDates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 text-xs font-semibold">
              <p>No open shoot dates published at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableOpenDates.map(openDate => {
                const myRequest = myBookings.find(b => b.openDateId === openDate.id);

                return (
                  <div
                    key={openDate.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm hover:border-blue-300 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 uppercase">{openDate.date} [{openDate.shift} Shift]</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{openDate.locName}</h4>
                        <p className="text-slate-500 text-[11px]">{openDate.city} | Coverage: {openDate.type}</p>
                      </div>

                      <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Open
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                      <span>Payment: <strong className="text-slate-900">Rs. {openDate.payment}</strong></span>
                      <span>Advance: <strong className="text-blue-600">Rs. {openDate.advance}</strong></span>
                    </div>

                    {openDate.desc && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                        {openDate.desc}
                      </p>
                    )}

                    {myRequest ? (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center">
                        Request Status: {myRequest.status}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBookOpenDate(openDate.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Book & Send Request to Studio</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. REQUEST ADVANCE PAYMENT */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Request Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Request Advance Payment</span>
            </h3>

            <form onSubmit={handleRequestPay} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Confirmed Duty</label>
                <select
                  value={pEventId}
                  onChange={e => setPEventId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">General / Studio Advance</option>
                  {myConfirmedDuties.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.type} - {e.date} ({e.locName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Requested Amount (Rs.)</label>
                <input
                  type="number"
                  value={pAmount}
                  onChange={e => setPAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 3000"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Method</label>
                <select
                  value={pMethod}
                  onChange={e => setPMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">In Hand Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Title</label>
                <input
                  type="text"
                  value={pTitle}
                  onChange={e => setPTitle(e.target.value)}
                  placeholder="Account Holder Name"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Number / Phone</label>
                <input
                  type="text"
                  value={pAccount}
                  onChange={e => setPAccount(e.target.value)}
                  placeholder="03001234567 or IBAN"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason / Notes</label>
                <textarea
                  value={pReason}
                  onChange={e => setPReason(e.target.value)}
                  rows={2}
                  placeholder="Travel expense, camera memory card..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Advance Request</span>
              </button>
            </form>
          </div>

          {/* Payment Request History */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">My Payment Advance Requests</h3>

            {myPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment requests submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myPayments.map(p => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-blue-600 font-bold text-sm">Rs. {p.amount}</span>
                        <p className="text-[11px] text-slate-500">{p.method}</p>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        p.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                        p.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 bg-white p-2 rounded border border-slate-200">
                      <p>Title: {p.title}</p>
                      <p>Account: <span className="font-mono text-slate-900 font-bold">{p.account}</span></p>
                      {p.reason && <p>Reason: {p.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. NOTIFICATIONS TAB */}
      {activeTab === 'notifs' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>My Notifications & Studio Broadcasts</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted alerts from Studio Admin specifically for {currentStaff.name}.
              </p>
            </div>

            {unreadStaffNotifsCount > 0 && (
              <button
                type="button"
                onClick={() => setReadNotifIds(staffNotifs.map(n => n.id))}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {staffNotifs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-xs">No notifications for your account.</p>
              <p className="text-[11px] text-slate-500">Upcoming shoot announcements and duty notices will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {staffNotifs.map(n => {
                const isRead = n.read || n.isRead || readNotifIds.includes(n.id);
                const isLocationPrompt = n.type === 'location' || (n.title || '').toLowerCase().includes('location') || (n.message || n.msg || '').toLowerCase().includes('location');

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                      !isRead
                        ? 'bg-blue-50/60 border-blue-200 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${!isRead ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                        <h4 className="font-black text-xs text-slate-900">{n.title || 'Studio Alert'}</h4>
                        {!isRead && (
                          <span className="px-1.5 py-0.2 bg-blue-600 text-white font-bold text-[9px] rounded uppercase">
                            New
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.createdAt || n.timestamp || 'Today'}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed text-xs">
                      {n.message || n.msg}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <div className="flex items-center gap-2">
                        {isLocationPrompt && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNotifForLocation(n);
                              setLocationInput(currentStaff.city || 'Multan');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>📍 Upload Current Location</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isRead ? (
                          <button
                            type="button"
                            onClick={() => handleMarkNotifRead(n.id)}
                            className="text-slate-600 hover:text-blue-600 font-semibold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <span className="text-slate-400">Read</span>
                        )}
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotif(n.id)}
                          className="text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Location Submission Modal for Staff */}
      {selectedNotifForLocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <MapPin className="w-5 h-5" />
              <span>Submit Event Day Location</span>
            </div>

            <p className="text-xs text-slate-600">
              Transmit your current venue arrival location or GPS coordinates directly to Hadi Studio Admin.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Venue / City / Location</label>
              <input
                type="text"
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                placeholder="e.g. Royal Palm Marquee, Multan"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedNotifForLocation(null)}
                className="px-3 py-2 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmitLocation(locationInput)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Location to Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Duty Modal */}
      {declineEventId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg p-5 max-w-md w-full space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reason for Declining Duty</h3>
            <p className="text-xs text-slate-500">
              Please inform Hadi Photo Studio management why you cannot attend this duty assignment.
            </p>

            <form onSubmit={handleConfirmDecline} className="space-y-3">
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="e.g. Prior personal commitment or illness..."
                required
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
              />

              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDeclineEventId(null)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer uppercase tracking-wider"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
