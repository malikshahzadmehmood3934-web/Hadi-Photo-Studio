import React, { useState } from 'react';
import {
  Users,
  Calendar,
  CalendarPlus,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  Download,
  MapPin,
  Send,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Map
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
  ShiftType,
  CoverageType,
  EventType
} from '../types';
import { StorageService } from '../lib/storage';
import { generateDutyLetterPDF } from '../lib/pdfGenerator';

interface AdminPanelProps {
  settings: StudioSettings;
  staffMembers: StaffMember[];
  openDates: OpenDate[];
  bookingRequests: BookingRequest[];
  eventDuties: EventDuty[];
  checkIns: CheckIn[];
  paymentRequests: PaymentRequest[];
  notifications: AppNotification[];
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  staffMembers,
  openDates,
  bookingRequests,
  eventDuties,
  checkIns,
  paymentRequests,
  notifications,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'staff' | 'opendate' | 'openreq' | 'event' | 'allduties' | 'checkins' | 'payment' | 'pdf' | 'settings'
  >('overview');

  // Add Staff State
  const [sName, setSName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sPass, setSPass] = useState('');
  const [sSpecialty, setSSpecialty] = useState('Lead Photographer');
  const [showSPass, setShowSPass] = useState(false);

  // Publish Open Date State
  const [oDate, setODate] = useState('');
  const [oShift, setOShift] = useState<ShiftType>('Night');
  const [oType, setOType] = useState<CoverageType>('Both');
  const [oLocName, setOLocName] = useState('');
  const [oLocAdd, setOLocAdd] = useState('');
  const [oCity, setOCity] = useState('Multan');
  const [oPay, setOPay] = useState<number | ''>(15000);
  const [oAdv, setOAdv] = useState<number | ''>(3000);
  const [oDesc, setODesc] = useState('');

  // Assign Manual Event State
  const [eStaff, setEStaff] = useState('');
  const [eType, setEType] = useState<EventType | 'Other'>('Baraat');
  const [eOther, setEOther] = useState('');
  const [eDate, setEDate] = useState('');
  const [eShift, setEShift] = useState<ShiftType>('Night');
  const [eLocName, setELocName] = useState('');
  const [eLocAdd, setELocAdd] = useState('');
  const [eCity, setECity] = useState('Multan');
  const [ePay, setEPay] = useState<number | ''>(15000);
  const [eAdv, setEAdv] = useState<number | ''>(3000);
  const [eRole, setERole] = useState('Lead Photographer');

  // Filter State for All Duties
  const [fDate, setFDate] = useState('');
  const [fShift, setFShift] = useState<string>('');
  const [fCity, setFCity] = useState('');
  const [fVenue, setFVenue] = useState('');
  const [fStatus, setFStatus] = useState<string>('');

  // Settings State
  const [setName, setSetName] = useState(settings.name);
  const [setContact, setSetContact] = useState(settings.contact);
  const [setAddress, setSetAddress] = useState(settings.address || '');
  const [setTerms, setSetTerms] = useState(settings.terms);
  const [setAdminUser, setSetAdminUser] = useState(settings.adminEmail);
  const [setAdminPass, setSetAdminPass] = useState(settings.adminPass);

  // Success / Alert Banners
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Handlers
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sPhone || !sPass) {
      showAlert('Please enter Name, Phone, and Password', 'error');
      return;
    }
    StorageService.addStaffMember({
      name: sName,
      phone: sPhone,
      password: sPass,
      role: 'staff',
      specialty: sSpecialty
    });
    setSName('');
    setSPhone('');
    setSPass('');
    showAlert('New Staff Member added successfully!');
    onRefreshData();
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete staff member "${name}"?`)) {
      StorageService.deleteStaffMember(id);
      showAlert(`Staff member ${name} deleted.`);
      onRefreshData();
    }
  };

  const handlePublishOpenDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oDate || !oLocName) {
      showAlert('Please provide Date and Location Name', 'error');
      return;
    }
    StorageService.publishOpenDate({
      date: oDate,
      shift: oShift,
      type: oType,
      locName: oLocName,
      locAdd: oLocAdd,
      city: oCity,
      payment: Number(oPay) || 0,
      advance: Number(oAdv) || 0,
      desc: oDesc
    });
    setODate('');
    setOLocName('');
    setOLocAdd('');
    setODesc('');
    showAlert('Open Date published and broadcasted to all staff!');
    onRefreshData();
  };

  const handleDeleteOpenDate = (id: string) => {
    if (confirm('Delete this published open date?')) {
      StorageService.deleteOpenDate(id);
      showAlert('Open date deleted.');
      onRefreshData();
    }
  };

  const handleConfirmBooking = (bookingId: string) => {
    StorageService.confirmBookingRequest(bookingId);
    showAlert('Booking request confirmed! Duty auto-assigned to staff.');
    onRefreshData();
  };

  const handleRejectBooking = (bookingId: string) => {
    StorageService.rejectBookingRequest(bookingId);
    showAlert('Booking request rejected.', 'error');
    onRefreshData();
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaffId = eStaff || (staffMembers[0] ? staffMembers[0].id : '');
    if (!selectedStaffId) {
      showAlert('Please select or add a staff member first!', 'error');
      return;
    }
    if (!eDate || !eLocName) {
      showAlert('Please fill in Date and Venue/Location Name', 'error');
      return;
    }

    const finalType = eType === 'Other' ? (eOther || 'Custom Event') : eType;

    StorageService.addEventDuty({
      staffId: selectedStaffId,
      type: finalType,
      date: eDate,
      shift: eShift,
      locName: eLocName,
      locAdd: eLocAdd,
      city: eCity,
      payment: Number(ePay) || 0,
      advance: Number(eAdv) || 0,
      role: eRole,
      status: 'Pending',
      source: 'Manual'
    });

    setEDate('');
    setELocName('');
    setELocAdd('');
    setEOther('');
    showAlert('Duty manually assigned to staff member!');
    onRefreshData();
  };

  const handleApprovePay = (payId: string) => {
    StorageService.approvePaymentRequest(payId);
    showAlert('Payment request APPROVED!');
    onRefreshData();
  };

  const handleRejectPay = (payId: string) => {
    StorageService.rejectPaymentRequest(payId);
    showAlert('Payment request rejected.', 'error');
    onRefreshData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: StudioSettings = {
      name: setName,
      contact: setContact,
      address: setAddress,
      terms: setTerms,
      adminEmail: setAdminUser,
      adminPass: setAdminPass,
      currency: settings.currency || 'Rs.'
    };
    StorageService.saveSettings(newSettings);
    showAlert('Studio Settings updated successfully!');
    onRefreshData();
  };

  const handleGeneratePDF = () => {
    const confirmedEvents = eventDuties.filter(e => e.status === 'YES');
    generateDutyLetterPDF(confirmedEvents, staffMembers, settings);
    showAlert('Confirmed Duties PDF generated and download triggered!');
  };

  // Filter logic for All Duties tab
  const filteredDuties = eventDuties.filter(item => {
    if (fDate && item.date !== fDate) return false;
    if (fShift && item.shift !== fShift) return false;
    if (fCity && item.city && !item.city.toLowerCase().includes(fCity.toLowerCase())) return false;
    if (fVenue && !item.locName.toLowerCase().includes(fVenue.toLowerCase())) return false;
    if (fStatus && item.status !== fStatus) return false;
    return true;
  });

  const pendingBookings = bookingRequests.filter(b => b.status === 'Requested');
  const pendingPayments = paymentRequests.filter(p => p.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-[#0f172a] border border-slate-800 p-1.5 rounded-lg overflow-x-auto scrollbar-none shadow-sm">
        <div className="flex items-center space-x-1 min-w-max text-xs font-semibold text-slate-300">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory ({staffMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('opendate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'opendate'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Open Dates ({openDates.filter(o => o.status === 'Open').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('openreq')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded relative transition-all ${
              activeTab === 'openreq'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Booking Requests</span>
            {pendingBookings.length > 0 && (
              <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'event'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Manual Assignment</span>
          </button>

          <button
            onClick={() => setActiveTab('allduties')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'allduties'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Staff & Duties</span>
          </button>

          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'checkins'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Venue Check-Ins ({checkIns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded relative transition-all ${
              activeTab === 'payment'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payment Requests</span>
            {pendingPayments.length > 0 && (
              <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Duty Letter PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Studio Settings</span>
          </button>

        </div>
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Active Staff</p>
              <div className="flex items-end justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">{staffMembers.length}</span>
                <span className="text-green-600 text-xs font-bold">+2 this month</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Open Requests</p>
              <div className="flex items-end justify-between mt-1">
                <span className="text-2xl font-black text-blue-600">{pendingBookings.length}</span>
                <button onClick={() => setActiveTab('openreq')} className="text-blue-600 text-xs font-bold underline cursor-pointer">
                  Review all
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Monthly Duties</p>
              <div className="flex items-end justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">{eventDuties.length}</span>
                <span className="text-slate-500 text-xs font-bold">{eventDuties.filter(e => e.status === 'YES').length} Confirmed</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Pending Advances</p>
              <div className="flex items-end justify-between mt-1">
                <span className="text-2xl font-black text-red-600">{pendingPayments.length}</span>
                <button onClick={() => setActiveTab('payment')} className="text-red-600 text-xs font-bold underline cursor-pointer">
                  {pendingPayments.length} actions
                </button>
              </div>
            </div>

          </div>

          {/* Quick Action & Broadcast Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Booking Requests Table */}
            <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Live Booking Requests</h3>
                <button onClick={() => setActiveTab('openreq')} className="text-[10px] text-blue-600 font-bold uppercase hover:underline">
                  View All Table
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Staff Member</th>
                      <th className="px-4 py-3">Event / Date</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingBookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400 font-medium">
                          No pending booking requests at the moment.
                        </td>
                      </tr>
                    ) : (
                      pendingBookings.slice(0, 4).map(req => {
                        const staff = staffMembers.find(s => s.id === req.staffId);
                        const openDate = openDates.find(o => o.id === req.openDateId);
                        return (
                          <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{staff?.name || 'Staff Member'}</div>
                              <div className="text-slate-400 text-[10px]">{staff?.specialty || 'Photographer'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{openDate?.type || 'Event'} - {openDate?.shift}</div>
                              <div className="text-blue-600 font-semibold text-[11px]">{openDate?.date}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{openDate?.locName}, {openDate?.city}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => handleConfirmBooking(req.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectBooking(req.id)}
                                className="px-3 py-1 bg-slate-100 text-slate-700 rounded font-bold border border-slate-200 hover:bg-slate-200 text-xs"
                              >
                                Decline
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Broadcast Side Panel */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              
              <div className="bg-[#1e293b] text-white rounded-lg p-5 shadow-sm border border-slate-700">
                <h3 className="text-xs font-bold uppercase text-slate-300 mb-3 tracking-widest flex items-center justify-between">
                  <span>Publish Quick Open Date</span>
                  <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">BROADCAST</span>
                </h3>
                
                <form onSubmit={handlePublishOpenDate} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] block text-slate-400 mb-1 font-bold uppercase">DATE</label>
                      <input
                        type="date"
                        value={oDate}
                        onChange={e => setODate(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] block text-slate-400 mb-1 font-bold uppercase">SHIFT</label>
                      <select
                        value={oShift}
                        onChange={e => setOShift(e.target.value as ShiftType)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="Day">Day</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] block text-slate-400 mb-1 font-bold uppercase">VENUE / CITY</label>
                    <input
                      type="text"
                      value={oLocName}
                      onChange={e => setOLocName(e.target.value)}
                      placeholder="e.g. Wedding Hall - Multan"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors uppercase tracking-wider shadow-sm mt-1"
                  >
                    Broadcast to All Staff
                  </button>
                </form>
              </div>

              {/* Real-time Notifications Feed */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Notifications Feed</h3>
                  <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-black">LIVE</span>
                </div>
                <div className="p-3 space-y-2 overflow-auto max-h-56">
                  {notifications.slice(0, 3).map(n => (
                    <div key={n.id} className="p-2.5 bg-blue-50/70 border-l-4 border-blue-600 rounded text-xs flex flex-col">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">System Alert</span>
                      <p className="text-xs text-slate-800 font-medium">{n.msg}</p>
                      <span className="text-[9px] text-slate-400 mt-1">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Recent Duties Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Recent Duty Assignments</h3>
              <button
                onClick={() => setActiveTab('allduties')}
                className="text-xs text-blue-600 font-bold hover:underline uppercase tracking-wide text-[10px]"
              >
                View All Table →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date & Shift</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Pay / Adv</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventDuties.slice(0, 6).map(evt => {
                    const staff = staffMembers.find(s => s.id === evt.staffId);
                    return (
                      <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{staff?.name || 'Deleted Staff'}</td>
                        <td className="px-4 py-3 text-blue-600 font-bold">{evt.type}</td>
                        <td className="px-4 py-3 text-slate-800">{evt.date} <span className="text-[10px] text-slate-400">({evt.shift})</span></td>
                        <td className="px-4 py-3 text-slate-600">{evt.locName}, {evt.city || 'Multan'}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">Rs. {evt.payment} <span className="text-slate-400 text-[10px] font-normal">(Adv: {evt.advance})</span></td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.status === 'YES' ? 'bg-green-100 text-green-800 border border-green-200' :
                            evt.status === 'NO' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {evt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. ADD & MANAGE STAFF TAB */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Staff Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Add New Staff Member</span>
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Staff Name</label>
                <input
                  type="text"
                  value={sName}
                  onChange={e => setSName(e.target.value)}
                  placeholder="e.g. Shahzad Mehmood"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={sPhone}
                  onChange={e => setSPhone(e.target.value)}
                  placeholder="e.g. 03058304908"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Role / Specialty</label>
                <select
                  value={sSpecialty}
                  onChange={e => setSSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Lead Photographer">Lead Photographer</option>
                  <option value="Candid Videographer">Candid Videographer</option>
                  <option value="Drone Operator">Drone Operator</option>
                  <option value="Assistant Cameraman">Assistant Cameraman</option>
                  <option value="Photo & Video Both">Photo & Video Both</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Login Password</label>
                <div className="relative">
                  <input
                    type={showSPass ? 'text' : 'password'}
                    value={sPass}
                    onChange={e => setSPass(e.target.value)}
                    placeholder="Set Password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 pr-9 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSPass(!showSPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff to Studio</span>
              </button>
            </form>
          </div>

          {/* Staff Directory List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">All Registered Staff Members</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffMembers.map(staff => {
                const assignedCount = eventDuties.filter(e => e.staffId === staff.id).length;
                return (
                  <div
                    key={staff.id}
                    className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between hover:bg-white hover:border-blue-300 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                        <p className="text-xs text-blue-600 font-bold">{staff.specialty || 'Photographer'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-200 transition-colors"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-slate-600 space-y-0.5 text-[11px]">
                      <p>Phone: <span className="text-slate-900 font-mono font-bold">{staff.phone}</span></p>
                      <p>Password: <span className="text-slate-900 font-mono font-bold">{staff.password}</span></p>
                      <p>Assigned Duties: <span className="text-green-600 font-black">{assignedCount}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. OPEN DATES TAB */}
      {activeTab === 'opendate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Publish Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-blue-600" />
              <span>Publish New Open Date</span>
            </h3>

            <form onSubmit={handlePublishOpenDate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Date</label>
                <input
                  type="date"
                  value={oDate}
                  onChange={e => setODate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Shift</label>
                  <select
                    value={oShift}
                    onChange={e => setOShift(e.target.value as ShiftType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Coverage Type</label>
                  <select
                    value={oType}
                    onChange={e => setOType(e.target.value as CoverageType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Video Cam">Video Cam</option>
                    <option value="Photo Cam">Photo Cam</option>
                    <option value="Both">Both (Photo + Video)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={oLocName}
                  onChange={e => setOLocName(e.target.value)}
                  placeholder="e.g. Al Jannat Marriage Hall"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Address & City</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={oLocAdd}
                    onChange={e => setOLocAdd(e.target.value)}
                    placeholder="Northern Bypass"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={oCity}
                    onChange={e => setOCity(e.target.value)}
                    placeholder="Multan"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pay (Rs.)</label>
                  <input
                    type="number"
                    value={oPay}
                    onChange={e => setOPay(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Total Payment"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Advance (Rs.)</label>
                  <input
                    type="number"
                    value={oAdv}
                    onChange={e => setOAdv(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Advance Pay"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Special Instructions</label>
                <textarea
                  value={oDesc}
                  onChange={e => setODesc(e.target.value)}
                  rows={2}
                  placeholder="Equipment required, timing..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Staff</span>
              </button>
            </form>
          </div>

          {/* Published Open Dates List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Published Open Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {openDates.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 space-y-2 hover:bg-white hover:border-blue-300 transition-all text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase">{item.date} [{item.shift}]</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.locName}</h4>
                      <p className="text-slate-500">{item.city} | {item.type}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        item.status === 'Open' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => handleDeleteOpenDate(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-700 border-t border-slate-200 pt-2 flex items-center justify-between text-[11px]">
                    <span>Pay: <strong className="text-slate-900">Rs. {item.payment}</strong></span>
                    <span>Adv: <strong className="text-blue-600">Rs. {item.advance}</strong></span>
                  </div>

                  {item.desc && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                      {item.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. OPEN DATE BOOKING REQUESTS TAB */}
      {activeTab === 'openreq' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Open Date Booking Requests from Staff</span>
          </h3>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-green-600" />
              <p className="text-xs font-semibold">No pending open date booking requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingBookings.map(req => {
                const staff = staffMembers.find(s => s.id === req.staffId);
                const openDate = openDates.find(o => o.id === req.openDateId);

                return (
                  <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{staff?.name || 'Staff Member'}</h4>
                        <p className="text-slate-500 text-[11px]">Phone: {staff?.phone}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Requested
                      </span>
                    </div>

                    {openDate ? (
                      <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                        <p className="font-bold text-blue-600">{openDate.date} ({openDate.shift}) - {openDate.type}</p>
                        <p className="text-slate-800">Venue: {openDate.locName}, {openDate.city}</p>
                        <p className="text-slate-500 text-[11px]">Pay: Rs. {openDate.payment} | Advance: Rs. {openDate.advance}</p>
                      </div>
                    ) : (
                      <p className="text-red-600 text-xs font-semibold">Open Date info unavailable</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmBooking(req.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 rounded transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Confirm Assignment
                      </button>
                      <button
                        onClick={() => handleRejectBooking(req.id)}
                        className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-1.5 px-3 rounded border border-slate-300 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. ASSIGN MANUAL DUTY TAB */}
      {activeTab === 'event' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Assign Duty Manually to Staff Member</span>
          </h3>

          <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Staff Member</label>
              <select
                value={eStaff}
                onChange={e => setEStaff(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Choose Staff Member --</option>
                {staffMembers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone}) - {s.specialty || 'Staff'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Type</label>
                <select
                  value={eType}
                  onChange={e => setEType(e.target.value as EventType | 'Other')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Mayo">Mayo</option>
                  <option value="Nikkah">Nikkah</option>
                  <option value="Baraat">Baraat</option>
                  <option value="Walima">Walima</option>
                  <option value="Birthday">Birthday</option>
                  <option value="School Event">School Event</option>
                  <option value="Other">Other Custom Event</option>
                </select>
              </div>

              {eType === 'Other' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Event Name</label>
                  <input
                    type="text"
                    value={eOther}
                    onChange={e => setEOther(e.target.value)}
                    placeholder="e.g. Corporate Shoot"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Duty Role</label>
                  <input
                    type="text"
                    value={eRole}
                    onChange={e => setERole(e.target.value)}
                    placeholder="e.g. Lead Photographer"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={eDate}
                  onChange={e => setEDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Shift</label>
                <select
                  value={eShift}
                  onChange={e => setEShift(e.target.value as ShiftType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Location / Venue Name</label>
              <input
                type="text"
                value={eLocName}
                onChange={e => setELocName(e.target.value)}
                placeholder="e.g. Royal Palm Marquee"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Address</label>
                <input
                  type="text"
                  value={eLocAdd}
                  onChange={e => setELocAdd(e.target.value)}
                  placeholder="e.g. Bosan Road"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={eCity}
                  onChange={e => setECity(e.target.value)}
                  placeholder="e.g. Multan"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment (Rs.)</label>
                <input
                  type="number"
                  value={ePay}
                  onChange={e => setEPay(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Total Pay"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Advance (Rs.)</label>
                <input
                  type="number"
                  value={eAdv}
                  onChange={e => setEAdv(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Advance Pay"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Assign Event Duty</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. ALL STAFF & DUTIES (SEARCH & FILTER) */}
      {activeTab === 'allduties' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>All Staff & Duty Assignments Explorer</span>
            </h3>

            <button
              onClick={handleGeneratePDF}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export PDF Duty Report</span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1 text-[11px]">Filter Date</label>
              <input
                type="date"
                value={fDate}
                onChange={e => setFDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 text-[11px]">Filter Shift</label>
              <select
                value={fShift}
                onChange={e => setFShift(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              >
                <option value="">All Shifts</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 text-[11px]">City</label>
              <input
                type="text"
                value={fCity}
                onChange={e => setFCity(e.target.value)}
                placeholder="Search city..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 text-[11px]">Venue</label>
              <input
                type="text"
                value={fVenue}
                onChange={e => setFVenue(e.target.value)}
                placeholder="Search venue..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 text-[11px]">Status</label>
              <select
                value={fStatus}
                onChange={e => setFStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              >
                <option value="">All Statuses</option>
                <option value="YES">YES (Confirmed)</option>
                <option value="NO">NO (Declined)</option>
                <option value="Pending">Pending Response</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {filteredDuties.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs font-semibold">No duty records found matching search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDuties.map(duty => {
                const staff = staffMembers.find(s => s.id === duty.staffId);
                return (
                  <div
                    key={duty.id}
                    className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 space-y-1.5 hover:bg-white hover:border-blue-300 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{staff?.name || 'Deleted Staff'}</h4>
                        <p className="text-xs text-blue-600 font-bold">{duty.type} {duty.role ? `(${duty.role})` : ''}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        duty.status === 'YES' ? 'bg-green-100 text-green-800 border border-green-200' :
                        duty.status === 'NO' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {duty.status}
                      </span>
                    </div>

                    <div className="text-slate-600 space-y-0.5 text-[11px]">
                      <p>Date: <strong className="text-slate-900">{duty.date}</strong> [{duty.shift}]</p>
                      <p>Venue: {duty.locName}, {duty.city || 'Multan'}</p>
                      <p>Address: {duty.locAdd}</p>
                      <p>Pay: Rs. {duty.payment} | Advance: Rs. {duty.advance}</p>
                    </div>

                    {duty.declineReason && (
                      <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 font-medium">
                        Reason: {duty.declineReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. VENUE CHECK-INS TRACKER */}
      {activeTab === 'checkins' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span>Staff Live Venue Check-ins Log</span>
          </h3>

          {checkIns.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30 text-green-600" />
              <p className="text-xs font-semibold">No venue arrival check-ins logged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkIns.map(c => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.staffName}</h4>
                      <p className="text-slate-600 font-medium">Location: {c.location}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                    <span>GPS: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</span>
                    <a
                      href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Map className="w-3.5 h-3.5" />
                      View Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. PAYMENT REQUESTS TAB */}
      {activeTab === 'payment' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>Staff Advance Payment Requests</span>
          </h3>

          {paymentRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-600" />
              <p className="text-xs font-semibold">No advance payment requests found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentRequests.map(p => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.staffName}</h4>
                      <p className="text-blue-600 font-bold text-sm">Requested: Rs. {p.amount}</p>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      p.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                      p.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="text-slate-700 bg-white p-3 rounded border border-slate-200 space-y-0.5 text-[11px]">
                    <p>Method: <strong className="text-slate-900">{p.method}</strong></p>
                    <p>Account Title: {p.title}</p>
                    <p>Account / Phone: <strong className="font-mono text-blue-600 font-bold">{p.account}</strong></p>
                    <p>Reason: {p.reason}</p>
                  </div>

                  {p.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApprovePay(p.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 rounded transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => handleRejectPay(p.id)}
                        className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-1.5 px-3 rounded border border-slate-300 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. DUTY LETTER PDF GENERATOR TAB */}
      {activeTab === 'pdf' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 text-center">
          <FileText className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Generate Official Duty Letter PDF</h3>
          <p className="text-xs text-slate-500">
            Download a formatted PDF duty confirmation voucher with Studio branding, contact details, assigned event schedule, payment breakdowns, terms, and signature lines.
          </p>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
            <p>• Studio Title: <strong className="text-slate-900">{settings.name}</strong></p>
            <p>• Contact Info: {settings.contact}</p>
            <p>• Confirmed Duty Records: <strong className="text-green-600 font-bold">{eventDuties.filter(e => e.status === 'YES').length} Duty Assignments</strong></p>
          </div>

          <button
            onClick={handleGeneratePDF}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Duty Confirmation PDF</span>
          </button>
        </div>
      )}

      {/* 10. STUDIO SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-blue-600" />
            <span>Studio & Admin Configuration</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Studio Name</label>
              <input
                type="text"
                value={setName}
                onChange={e => setSetName(e.target.value)}
                placeholder="HADI PHOTO STUDIO"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={setContact}
                  onChange={e => setSetContact(e.target.value)}
                  placeholder="0305-8304908"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Studio Address</label>
                <input
                  type="text"
                  value={setAddress}
                  onChange={e => setSetAddress(e.target.value)}
                  placeholder="Studio Address"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Username</label>
                <input
                  type="text"
                  value={setAdminUser}
                  onChange={e => setSetAdminUser(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Password</label>
                <input
                  type="text"
                  value={setAdminPass}
                  onChange={e => setSetAdminPass(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Studio Terms & Conditions (Appears on PDF)</label>
              <textarea
                value={setTerms}
                onChange={e => setSetTerms(e.target.value)}
                rows={4}
                placeholder="Terms and conditions..."
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
