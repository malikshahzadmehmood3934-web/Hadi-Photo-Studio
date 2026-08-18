import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Camera,
  Users,
  FileText,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Send,
  Download,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  UserCheck,
  Briefcase
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';

export default function HadiStudioPortal({
  invoices = [],
  openDates = [],
  openDateRequests = [],
  staffMembers = [],
  assignedDuties = [],
  paymentRequests = [],
  studioSettings = {},
  onSaveInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onAddOpenDate,
  onDeleteOpenDate,
  onApproveOpenDateRequest,
  onRejectOpenDateRequest,
  onAssignDuty,
  onDeleteDuty,
  onApprovePaymentRequest,
  onRejectPaymentRequest,
  onAddStaffMember,
  onApproveStaffMember,
  onDeleteStaffMember,
  triggerAlert
}) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'assign_duty' | 'open_dates' | 'staff_duties' | 'payment_requests' | 'staff_list'

  // Invoice States
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoiceData, setEditingInvoiceData] = useState(null);
  const [savedSuccessModal, setSavedSuccessModal] = useState(null);

  // Manual Duty Form (9 Forms / Fields)
  const [dutyEventName, setDutyEventName] = useState('');
  const [dutyClientName, setDutyClientName] = useState('');
  const [dutyClientPhone, setDutyClientPhone] = useState('');
  const [dutyEventType, setDutyEventType] = useState('Baraat');
  const [dutyDate, setDutyDate] = useState('');
  const [dutyVenue, setDutyVenue] = useState('');
  const [dutyCity, setDutyCity] = useState('Lahore');
  const [dutyShift, setDutyShift] = useState('Night');
  const [dutyStaffIds, setDutyStaffIds] = useState([]);
  const [dutyCameraGear, setDutyCameraGear] = useState('Sony A7IV, Canon R5, DJI Drone');
  const [dutyLeadStaff, setDutyLeadStaff] = useState('');
  const [dutyPayRate, setDutyPayRate] = useState('3000');
  const [dutySpecialNotes, setDutySpecialNotes] = useState('');

  // Open Date Form
  const [newOpenDate, setNewOpenDate] = useState('');
  const [newOpenShift, setNewOpenShift] = useState('Both');
  const [newOpenNotes, setNewOpenNotes] = useState('');

  // Staff registration form
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Lead Photographer');
  const [newStaffPass, setNewStaffPass] = useState('');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = (inv.clientName || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.eventType || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.venue || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.city || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.eventDate || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.id || '').toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  // Invoice Handlers
  const handleOpenCreateInvoice = () => {
    setEditingInvoiceData(null);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (inv) => {
    setEditingInvoiceData(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoiceSuccess = (inv) => {
    setSavedSuccessModal(inv);
  };

  const handleSaveOrUpdateInvoice = (invData) => {
    if (editingInvoiceData?.id) {
      onUpdateInvoice?.(editingInvoiceData.id, invData);
      triggerAlert?.('Studio Invoice updated successfully in Firestore!');
    } else {
      onSaveInvoice?.(invData);
      triggerAlert?.('Studio Invoice saved successfully in Firestore!');
    }
    setIsInvoiceModalOpen(false);
    setSavedSuccessModal(invData);
  };

  // Duty Assignment Submit
  const handleAssignDutySubmit = (e) => {
    e.preventDefault();
    if (!dutyDate || !dutyVenue || !dutyClientName) {
      triggerAlert?.('Please fill in Event Date, Client Name and Venue', 'error');
      return;
    }

    const dutyObj = {
      eventName: dutyEventName || `${dutyClientName}'s ${dutyEventType}`,
      clientName: dutyClientName,
      clientPhone: dutyClientPhone,
      eventType: dutyEventType,
      eventDate: dutyDate,
      venue: dutyVenue,
      city: dutyCity,
      shift: dutyShift,
      assignedStaff: dutyStaffIds,
      leadStaff: dutyLeadStaff,
      cameraGear: dutyCameraGear,
      payRatePerStaff: Number(dutyPayRate) || 0,
      specialNotes: dutySpecialNotes,
      status: 'Assigned',
      createdAt: new Date().toISOString()
    };

    onAssignDuty?.(dutyObj);
    triggerAlert?.('Duty successfully assigned to staff!');
    
    // Reset Form
    setDutyEventName('');
    setDutyClientName('');
    setDutyClientPhone('');
    setDutyDate('');
    setDutyVenue('');
    setDutyStaffIds([]);
    setDutySpecialNotes('');
    setActiveTab('staff_duties');
  };

  // Open Date Submit
  const handleOpenDateSubmit = (e) => {
    e.preventDefault();
    if (!newOpenDate) return;
    onAddOpenDate?.({
      date: newOpenDate,
      shift: newOpenShift,
      notes: newOpenNotes,
      status: 'Available',
      createdAt: new Date().toISOString()
    });
    setNewOpenDate('');
    setNewOpenNotes('');
    triggerAlert?.('Open date published for booking!');
  };

  // Staff Member Submit
  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      triggerAlert?.('Staff Name and Email are required', 'error');
      return;
    }
    onAddStaffMember?.({
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone,
      role: newStaffRole,
      password: newStaffPass || 'staff@123',
      createdAt: new Date().toISOString()
    });
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffPass('');
    triggerAlert?.('Staff member registered successfully!');
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* STUDIO HEADER & TAB NAVIGATION */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-amber-400" />
            <span>HADI STUDIO & EVENT BOOKINGS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official Event Rates, Studio Invoices, Manual Duty Assignments & Staff Management</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Studio Invoices ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assign_duty')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'assign_duty'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Assign Manual Duty</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff_duties')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff_duties'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Duties & Letters ({assignedDuties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('open_dates')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'open_dates'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Open Dates ({openDates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment_requests')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payment_requests'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payment Requests ({paymentRequests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff_list')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff_list'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Staff Accounts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL STUDIO INVOICES (WITH VIEW & EDIT BUTTONS) */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                placeholder="Search studio invoices by customer, date, venue, city, ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={invoiceStatusFilter}
                onChange={e => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 outline-none cursor-pointer"
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partial">Advance Paid (Partial)</option>
                <option value="Pending">Pending Advance</option>
              </select>

              <button
                type="button"
                onClick={handleOpenCreateInvoice}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Studio Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoices Table with View & Edit Buttons */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice # & Date</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Event & Venue</th>
                    <th className="py-3 px-4">Equipment / Gear</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Advance / Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions (View / Edit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No studio event invoices found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-amber-400">#{inv.id?.slice(0, 8).toUpperCase() || 'INV'}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{inv.eventDate || inv.createdAt?.split('T')[0] || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{inv.clientName || 'Unnamed Client'}</div>
                          <div className="text-[11px] text-slate-400">{inv.clientPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-amber-300">{inv.eventType} ({inv.shift || 'Night'})</span>
                          <div className="text-[11px] text-slate-400">{inv.venue}, {inv.city || 'Lahore'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-slate-300">
                            V: {inv.services?.videoQty || 0} | P: {inv.services?.photoQty || 0} | D: {inv.services?.droneQty || 0}
                          </div>
                          {inv.manualCameraNotes && (
                            <div className="text-[10px] text-amber-400 font-mono truncate max-w-[140px]">
                              {inv.manualCameraNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-black text-white text-sm">
                          Rs. {(inv.grandTotal || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-emerald-400 font-bold">Adv: Rs. {(inv.advancePayment || 0).toLocaleString()}</div>
                          <div className="text-amber-400 font-bold">Due: Rs. {(inv.remainingBalance || 0).toLocaleString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : inv.status === 'Partial'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {inv.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* VIEW BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleViewInvoiceSuccess(inv)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                              title="View Invoice & PDF Actions"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>VIEW</span>
                            </button>

                            {/* EDIT BUTTON (Opens full GENERATE EVENT INVOICE form with all data pre-filled) */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditInvoice(inv)}
                              className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer border border-blue-500/30"
                              title="Edit Full Invoice Form"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete invoice for ${inv.clientName}?`)) {
                                  onDeleteInvoice?.(inv.id);
                                  triggerAlert?.('Invoice deleted from Firestore.');
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN MANUAL DUTY (9 FORM FIELDS) */}
      {activeTab === 'assign_duty' && (
        <form onSubmit={handleAssignDutySubmit} className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl text-white">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <span>ASSIGN MANUAL EVENT DUTY (9 FORMS / FIELDS)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Assign specialized staff, camera gear, pay rates and venues for upcoming events.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Field 1: Client Name */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">1. Client / Groom & Bride Name *</label>
              <input
                type="text"
                value={dutyClientName}
                onChange={e => setDutyClientName(e.target.value)}
                placeholder="e.g. Shahzad Mehmood"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Field 2: Client Phone */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">2. Client Phone Number</label>
              <input
                type="text"
                value={dutyClientPhone}
                onChange={e => setDutyClientPhone(e.target.value)}
                placeholder="e.g. 03058304908"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Field 3: Event Type */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">3. Event Type</label>
              <select
                value={dutyEventType}
                onChange={e => setDutyEventType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              >
                <option value="Baraat">Baraat</option>
                <option value="Walima">Walima</option>
                <option value="Mehndi">Mehndi</option>
                <option value="Nikkah">Nikkah</option>
                <option value="Corporate / Commercial">Corporate / Commercial</option>
                <option value="Pre-Wedding / Outdoor Shoot">Pre-Wedding / Outdoor Shoot</option>
              </select>
            </div>

            {/* Field 4: Event Date */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">4. Event Date *</label>
              <input
                type="date"
                value={dutyDate}
                onChange={e => setDutyDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Field 5: Venue & Location */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">5. Venue / Hall *</label>
              <input
                type="text"
                value={dutyVenue}
                onChange={e => setDutyVenue(e.target.value)}
                placeholder="e.g. Royal Palm Golf Club"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Field 6: City & Shift */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">6. City & Shift</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={dutyCity}
                  onChange={e => setDutyCity(e.target.value)}
                  placeholder="City"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
                <select
                  value={dutyShift}
                  onChange={e => setDutyShift(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>
            </div>

            {/* Field 7: Camera Gear Assigned */}
            <div className="lg:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">7. Camera Gear & Equipment Assigned</label>
              <input
                type="text"
                value={dutyCameraGear}
                onChange={e => setDutyCameraGear(e.target.value)}
                placeholder="e.g. Sony FX3 (24-70 GM), Canon R5C, DJI Mavic 3 Pro, Godox V1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Field 8: Lead Staff & Pay Rate */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">8. Pay Rate per Staff (Rs.)</label>
              <input
                type="number"
                value={dutyPayRate}
                onChange={e => setDutyPayRate(e.target.value)}
                placeholder="3000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Field 9: Staff Selection */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <label className="block text-amber-400 font-bold uppercase tracking-wider">
              9. Select Staff Members for this Event
            </label>
            {staffMembers.length === 0 ? (
              <p className="text-slate-500">No staff members registered. Please add staff in the 'Staff Accounts' tab first.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {staffMembers.map(staff => {
                  const isChecked = dutyStaffIds.includes(staff.id);
                  return (
                    <label
                      key={staff.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setDutyStaffIds([...dutyStaffIds, staff.id]);
                          } else {
                            setDutyStaffIds(dutyStaffIds.filter(id => id !== staff.id));
                          }
                        }}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <div>
                        <span className="font-bold block">{staff.name}</span>
                        <span className="text-[10px] text-slate-400">{staff.role || 'Photographer'}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Special Instructions & Guidelines</label>
            <textarea
              value={dutySpecialNotes}
              onChange={e => setDutySpecialNotes(e.target.value)}
              placeholder="e.g. Reach venue 1 hour early for couple portrait setup..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer"
          >
            DISPATCH & ASSIGN DUTY TO STAFF
          </button>
        </form>
      )}

      {/* TAB 3: STAFF DUTIES LIST & DUTY LETTERS */}
      {activeTab === 'staff_duties' && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Assigned Event Duties & Letters</span>
              </h3>
              <span className="text-slate-400">{assignedDuties.length} Active Duty Assignments</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Event Date & Type</th>
                    <th className="py-3 px-4">Client / Event Name</th>
                    <th className="py-3 px-4">Venue & City</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Camera Gear</th>
                    <th className="py-3 px-4">Pay Rate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {assignedDuties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No active duty assignments recorded.</p>
                      </td>
                    </tr>
                  ) : (
                    assignedDuties.map(d => (
                      <tr key={d.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          {d.eventDate}
                          <div className="text-[10px] text-slate-400">{d.eventType} ({d.shift})</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{d.clientName || d.eventName}</div>
                          <div className="text-[10px] text-slate-400">{d.clientPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">{d.venue}, {d.city}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-semibold">
                            {d.assignedStaff ? `${d.assignedStaff.length} Staff Member(s)` : 'General Crew'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-400 truncate max-w-[150px]">
                          {d.cameraGear || 'Standard Gear'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          Rs. {(d.payRatePerStaff || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this duty assignment?')) {
                                onDeleteDuty?.(d.id);
                                triggerAlert?.('Duty assignment removed.');
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPEN DATES & REQUESTS */}
      {activeTab === 'open_dates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Publish New Open Date Form */}
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-black text-base text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-5 h-5" />
              <span>Publish Open Booking Date</span>
            </h3>

            <form onSubmit={handleOpenDateSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Select Date</label>
                <input
                  type="date"
                  value={newOpenDate}
                  onChange={e => setNewOpenDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Available Shift</label>
                <select
                  value={newOpenShift}
                  onChange={e => setNewOpenShift(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                >
                  <option value="Both">Both Day & Night</option>
                  <option value="Day">Day Shift Only</option>
                  <option value="Night">Night Shift Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Notes / Availability</label>
                <input
                  type="text"
                  value={newOpenNotes}
                  onChange={e => setNewOpenNotes(e.target.value)}
                  placeholder="e.g. 2 slots left for Lahore"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Publish Available Date
              </button>
            </form>
          </div>

          {/* Open Dates & Booking Requests List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-white mb-3 flex items-center justify-between">
                <span>Active Published Dates ({openDates.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {openDates.map(od => (
                  <div key={od.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-extrabold text-amber-400">{od.date}</div>
                      <div className="text-[10px] text-slate-400">{od.shift} Shift • {od.notes || 'Available'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteOpenDate?.(od.id)}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Booking Requests */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-white mb-3">
                Client Open Date Booking Requests ({openDateRequests.length})
              </h4>
              {openDateRequests.length === 0 ? (
                <p className="text-slate-500">No client date booking requests currently.</p>
              ) : (
                <div className="space-y-2">
                  {openDateRequests.map(req => (
                    <div key={req.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="font-bold text-white">{req.clientName} ({req.clientPhone})</div>
                        <div className="text-xs text-amber-300">{req.requestedDate} • {req.eventType} ({req.venue})</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onApproveOpenDateRequest?.(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectOpenDateRequest?.(req.id)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF ADVANCE PAYMENT REQUESTS */}
      {activeTab === 'payment_requests' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Staff Advance Payment Requests</span>
            </h3>
            <span className="text-slate-400">{paymentRequests.length} Total Requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paymentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                      <p>No payment requests submitted by staff.</p>
                    </td>
                  </tr>
                ) : (
                  paymentRequests.map(pr => (
                    <tr key={pr.id} className="hover:bg-slate-900/50">
                      <td className="py-3.5 px-4 font-bold text-white">{pr.staffName}</td>
                      <td className="py-3.5 px-4 font-black text-amber-400">Rs. {(Number(pr.amount) || 0).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-400">{pr.reason || 'Event advance'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{pr.createdAt?.split('T')[0] || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pr.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : pr.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {pr.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pr.status === 'Pending' && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onApprovePaymentRequest?.(pr.id);
                                triggerAlert?.('Payment request approved.');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onRejectPaymentRequest?.(pr.id);
                                triggerAlert?.('Payment request rejected.');
                              }}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STAFF ACCOUNTS MANAGEMENT */}
      {activeTab === 'staff_list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Register New Staff Member Form */}
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-black text-base text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserCheck className="w-5 h-5" />
              <span>Register Staff Member</span>
            </h3>

            <form onSubmit={handleStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="e.g. Usman Ali"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  placeholder="e.g. usman.staff@hadistudio.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={e => setNewStaffPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Role / Specialty</label>
                <select
                  value={newStaffRole}
                  onChange={e => setNewStaffRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                >
                  <option value="Lead Photographer">Lead Photographer</option>
                  <option value="Cinematographer / Video">Cinematographer / Video</option>
                  <option value="Drone Pilot">Drone Pilot</option>
                  <option value="Female Photographer">Female Photographer</option>
                  <option value="Video Editor">Video Editor</option>
                  <option value="Assistant">Assistant / Lighting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Login Password</label>
                <input
                  type="password"
                  value={newStaffPass}
                  onChange={e => setNewStaffPass(e.target.value)}
                  placeholder="Staff login password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Create Staff Account
              </button>
            </form>
          </div>

          {/* Staff Members List */}
          <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="font-extrabold text-sm text-white mb-3">
              Registered Studio Staff Accounts ({staffMembers.length})
            </h4>

            <div className="space-y-2.5">
              {staffMembers.length === 0 ? (
                <p className="text-slate-500">No staff accounts registered yet.</p>
              ) : (
                staffMembers.map(st => (
                  <div key={st.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{st.name}</span>
                        {st.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            Pending Approval
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                            Active Staff
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-400 mt-0.5">{st.role} • {st.email} • {st.phone || 'No phone'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {st.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onApproveStaffMember?.(st.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete staff account for ${st.name}?`)) {
                            onDeleteStaffMember?.(st.id);
                            triggerAlert?.('Staff account deleted.');
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL INVOICE MODAL (SUPPORTS BOTH CREATE AND EDIT MODE WITH AUTO PRE-FILL & FIRESTORE UPDATE) */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoiceData(null);
        }}
        editInvoiceData={editingInvoiceData}
        onSaveBill={handleSaveOrUpdateInvoice}
        onUpdateInvoice={handleSaveOrUpdateInvoice}
        savedSuccessModal={savedSuccessModal}
        onCloseSuccessModal={() => setSavedSuccessModal(null)}
        studioSettings={studioSettings}
      />

    </div>
  );
}
