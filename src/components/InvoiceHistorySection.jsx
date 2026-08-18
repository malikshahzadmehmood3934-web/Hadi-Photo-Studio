import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit3,
  Send,
  Mail,
  Download,
  Printer,
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  Percent,
  Layers,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import InvoiceThemeRenderer from './InvoiceThemeRenderer';
import SendEmailModal from './SendEmailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function InvoiceHistorySection({
  invoices = [],
  shopInvoices = [],
  userRole = 'admin', // 'admin' | 'staff' | 'customer'
  currentClient = null,
  currentStaff = null,
  settings = {},
  onOpenCreateInvoice,
  onOpenEditInvoice,
  onSendToStudio,
  onDeleteInvoice,
  onUpdateInvoice,
  onAddAuditLog,
  triggerAlert
}) {
  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';
  const isCustomer = userRole === 'customer' || userRole === 'client';

  // Selected Tab: 'studio' | 'shop' | 'all'
  const [invoiceTypeTab, setInvoiceTypeTab] = useState('studio');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All'); // 'All' | 'Paid' | 'Unpaid' | 'Partial'
  const [discountFilter, setDiscountFilter] = useState('All'); // 'All' | 'Before Discount' | 'After Discount' | 'With Discount' | 'Without Discount'
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'Admin' | 'Staff' | 'Customer'
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Active Modals
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);
  const [transferConfirmInvoice, setTransferConfirmInvoice] = useState(null);
  const [deleteConfirmInvoice, setDeleteConfirmInvoice] = useState(null);

  // Combine invoices based on scope & role
  const allRawInvoices = useMemo(() => {
    let combined = [];

    if (invoiceTypeTab === 'studio' || invoiceTypeTab === 'all') {
      const formattedStudio = (invoices || []).map(inv => ({
        ...inv,
        invoiceType: 'Studio',
        formattedDate: inv.eventDate || inv.date || inv.createdAt?.split('T')[0] || 'N/A'
      }));
      combined = [...combined, ...formattedStudio];
    }

    if (isAdmin && (invoiceTypeTab === 'shop' || invoiceTypeTab === 'all')) {
      const formattedShop = (shopInvoices || []).map(inv => ({
        ...inv,
        invoiceType: 'Shop',
        formattedDate: inv.date || inv.createdAt?.split('T')[0] || 'N/A'
      }));
      combined = [...combined, ...formattedShop];
    }

    // Role-based restrictions
    if (isCustomer) {
      combined = combined.filter(inv =>
        inv.clientID === currentClient?.id ||
        (inv.clientEmail && currentClient?.email && inv.clientEmail.toLowerCase() === currentClient.email.toLowerCase()) ||
        (inv.customerEmail && currentClient?.email && inv.customerEmail.toLowerCase() === currentClient.email.toLowerCase()) ||
        (inv.clientPhone && currentClient?.phone && inv.clientPhone === currentClient.phone) ||
        (inv.customerPhone && currentClient?.phone && inv.customerPhone === currentClient.phone)
      );
    } else if (isStaff) {
      // Staff can view studio invoices or assigned duties
      combined = combined.filter(inv => inv.invoiceType === 'Studio');
    }

    return combined;
  }, [invoices, shopInvoices, invoiceTypeTab, userRole, currentClient, isCustomer, isStaff, isAdmin]);

  // Apply filters
  const filteredInvoices = useMemo(() => {
    return allRawInvoices.filter(inv => {
      // 1. Live Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        (inv.invoiceNumber || inv.id || '').toLowerCase().includes(search) ||
        (inv.clientName || inv.customerName || '').toLowerCase().includes(search) ||
        (inv.clientPhone || inv.customerPhone || '').toLowerCase().includes(search) ||
        (inv.clientEmail || inv.customerEmail || '').toLowerCase().includes(search) ||
        (inv.eventType || inv.name || '').toLowerCase().includes(search) ||
        (inv.venue || inv.city || '').toLowerCase().includes(search);

      if (!matchSearch) return false;

      // 2. Payment Status Filter
      const grandTotal = Number(inv.grandTotal || inv.total || 0);
      const paid = Number(inv.advancePayment || inv.paidAmount || 0);
      const balance = Number(inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.balanceDue !== undefined ? inv.balanceDue : (grandTotal - paid)));

      let computedStatus = inv.status || 'Pending';
      if (balance <= 0 && grandTotal > 0) computedStatus = 'Paid';
      else if (paid > 0 && balance > 0) computedStatus = 'Partial';
      else if (paid === 0) computedStatus = 'Unpaid';

      if (paymentFilter !== 'All') {
        if (paymentFilter === 'Paid' && computedStatus !== 'Paid') return false;
        if (paymentFilter === 'Unpaid' && computedStatus !== 'Unpaid' && computedStatus !== 'Pending') return false;
        if (paymentFilter === 'Partial' && computedStatus !== 'Partial') return false;
      }

      // 3. Discount Filter
      const discount = Number(inv.discount || 0);
      if (discountFilter === 'With Discount' && discount <= 0) return false;
      if (discountFilter === 'Without Discount' && discount > 0) return false;

      // 4. Role Filter
      if (roleFilter !== 'All') {
        const creatorRole = (inv.createdByRole || inv.createdBy || 'admin').toLowerCase();
        if (roleFilter === 'Admin' && creatorRole !== 'admin') return false;
        if (roleFilter === 'Staff' && creatorRole !== 'staff') return false;
        if (roleFilter === 'Customer' && creatorRole !== 'customer' && creatorRole !== 'client') return false;
      }

      // 5. Date Filter
      if (dateFilter !== 'All') {
        const invDateStr = inv.formattedDate;
        if (!invDateStr || invDateStr === 'N/A') return false;
        const invDateObj = new Date(invDateStr);
        const now = new Date();

        if (dateFilter === 'Today') {
          const todayStr = now.toISOString().split('T')[0];
          if (invDateStr !== todayStr) return false;
        } else if (dateFilter === 'This Week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (invDateObj < sevenDaysAgo) return false;
        } else if (dateFilter === 'This Month') {
          if (invDateObj.getMonth() !== now.getMonth() || invDateObj.getFullYear() !== now.getFullYear()) return false;
        } else if (dateFilter === 'Custom') {
          if (customStartDate && new Date(invDateStr) < new Date(customStartDate)) return false;
          if (customEndDate && new Date(invDateStr) > new Date(customEndDate)) return false;
        }
      }

      return true;
    });
  }, [allRawInvoices, searchTerm, paymentFilter, discountFilter, roleFilter, dateFilter, customStartDate, customEndDate]);

  // Statistics & Totals
  const statistics = useMemo(() => {
    let totalInvoices = filteredInvoices.length;
    let totalBeforeDiscount = 0;
    let totalDiscounts = 0;
    let totalAfterDiscount = 0;
    let totalPaid = 0;
    let totalBalanceDue = 0;

    filteredInvoices.forEach(inv => {
      const gTotal = Number(inv.grandTotal || inv.total || 0);
      const disc = Number(inv.discount || 0);
      const sub = Number(inv.subtotal || (gTotal + disc));
      const paid = Number(inv.advancePayment || inv.paidAmount || 0);
      const bal = Number(inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.balanceDue !== undefined ? inv.balanceDue : (gTotal - paid)));

      totalBeforeDiscount += sub;
      totalDiscounts += disc;
      totalAfterDiscount += gTotal;
      totalPaid += paid;
      totalBalanceDue += Math.max(0, bal);
    });

    return {
      totalInvoices,
      totalBeforeDiscount,
      totalDiscounts,
      totalAfterDiscount,
      totalPaid,
      totalBalanceDue
    };
  }, [filteredInvoices]);

  // Print Handler
  const handlePrintInvoice = (inv) => {
    setPreviewInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // PDF Generation Handler
  const handleDownloadInvoicePDF = (inv) => {
    if (!inv) return;
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const currency = settings.currency || 'Rs.';
      let y = 14;

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, y, 182, 24, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(245, 158, 11);
      pdf.text(settings.name || 'HADI PHOTO STUDIO & EVENTS', 18, y + 9);

      pdf.setFontSize(8.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text('OFFICIAL BOOKING & EQUIPMENT INVOICE', 18, y + 17);

      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(`Phone: ${settings.contact || '0305-8304908'}`, 130, y + 9);
      pdf.text(`Email: ${settings.email || 'malikshahzadmehmood3934@gmail.com'}`, 130, y + 14);
      pdf.text(`Address: ${settings.address || 'Gulgasht Colony, Multan / Lahore'}`, 130, y + 19);

      y += 28;

      // Number & Date
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      const invId = inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8).toUpperCase() : 'HADI-1001');
      pdf.text(`INVOICE #: ${invId}`, 14, y);
      pdf.text(`DATE: ${inv.formattedDate || new Date().toLocaleDateString()}`, 140, y);
      y += 5;

      // Customer
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(14, y, 182, 22, 2, 2, 'FD');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CUSTOMER DETAILS:', 18, y + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${inv.clientName || inv.customerName || 'Valued Customer'}`, 18, y + 12);
      pdf.text(`Phone: ${inv.clientPhone || inv.customerPhone || 'N/A'}`, 18, y + 17);
      pdf.text(`Email: ${inv.clientEmail || inv.customerEmail || 'N/A'}`, 105, y + 12);
      pdf.text(`Address: ${inv.clientAddress || inv.customerAddress || 'Lahore'}`, 105, y + 17);

      y += 26;

      // Events / Items
      pdf.setFillColor(30, 41, 59);
      pdf.rect(14, y, 182, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT / ITEM', 16, y + 5);
      pdf.text('DATE', 50, y + 5);
      pdf.text('SHIFT', 75, y + 5);
      pdf.text('GEAR / QUANTITY', 95, y + 5);
      pdf.text('TOTAL', 194, y + 5, { align: 'right' });
      y += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(7.5);

      const eventsList = (inv.eventsBreakdown || []).filter(e => e.selected);
      if (eventsList.length > 0) {
        eventsList.forEach((ev, idx) => {
          if (idx % 2 === 1) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(14, y, 182, 6.5, 'F');
          }
          const evName = ev.isOther && ev.otherEventName ? ev.otherEventName : ev.eventName;
          pdf.text(evName, 16, y + 4.5);
          pdf.text(ev.date || '-', 50, y + 4.5);
          pdf.text(ev.shift || 'Night', 75, y + 4.5);
          pdf.text(`Video ${ev.videoQty || 0}, Photo ${ev.photoQty || 0}${ev.drone ? ', Drone' : ''}${ev.femalePhotographer ? ', Female' : ''}`, 95, y + 4.5);
          pdf.text(`${currency} ${(ev.rowTotal || 0).toLocaleString()}`, 194, y + 4.5, { align: 'right' });
          y += 6.5;
        });
      } else {
        pdf.text(inv.eventType || 'Event Coverage', 16, y + 4.5);
        pdf.text(inv.eventDate || inv.date || '-', 50, y + 4.5);
        pdf.text(inv.shift || 'Night', 75, y + 4.5);
        pdf.text(inv.manualCameraNotes || 'Studio Gear', 95, y + 4.5);
        pdf.text(`${currency} ${(inv.grandTotal || 0).toLocaleString()}`, 194, y + 4.5, { align: 'right' });
        y += 6.5;
      }

      y += 4;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(14, y, 196, y);
      y += 5;

      // Totals
      pdf.setFontSize(8.5);
      pdf.text('Before Discount / Subtotal:', 130, y);
      pdf.text(`${currency} ${(inv.subtotal || inv.grandTotal || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      if (Number(inv.discount || 0) > 0) {
        pdf.setTextColor(217, 119, 6);
        pdf.text('Discount Applied:', 130, y);
        pdf.text(`-${currency} ${(Number(inv.discount || 0)).toLocaleString()}`, 194, y, { align: 'right' });
        pdf.setTextColor(15, 23, 42);
        y += 5;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.text('FINAL AMOUNT / GRAND TOTAL:', 130, y);
      pdf.text(`${currency} ${(inv.grandTotal || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 6;

      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      pdf.text('Paid / Advance Received:', 130, y);
      pdf.text(`${currency} ${(inv.advancePayment || inv.paidAmount || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('REMAINING BALANCE DUE:', 130, y);
      pdf.text(`${currency} ${(inv.remainingBalance || inv.balanceDue || 0).toLocaleString()}`, 194, y, { align: 'right' });

      pdf.save(`Hadi_Invoice_${invId}.pdf`);
      triggerAlert?.('Invoice PDF generated successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      triggerAlert?.('Error generating PDF', 'error');
    }
  };

  // Transfer to Hadi Studio Lock Handler
  const handleConfirmTransfer = async () => {
    if (!transferConfirmInvoice) return;
    try {
      const updated = {
        ...transferConfirmInvoice,
        sentToStudio: true,
        locked: true,
        sentToStudioAt: new Date().toISOString(),
        sentByUser: userRole === 'admin' ? 'Admin' : (currentStaff?.name || 'Authorized Staff')
      };

      if (onUpdateInvoice) {
        await onUpdateInvoice(updated);
      } else if (onSendToStudio) {
        await onSendToStudio(updated);
      }

      onAddAuditLog?.({
        action: 'Invoice Sent & Locked',
        category: 'studio',
        details: `Invoice #${transferConfirmInvoice.invoiceNumber || transferConfirmInvoice.id} sent to Hadi Studio and locked from further edits`,
        targetId: transferConfirmInvoice.id
      });

      triggerAlert?.(`Invoice #${transferConfirmInvoice.invoiceNumber || transferConfirmInvoice.id?.slice(0, 8)} sent to Hadi Studio and locked!`);
    } catch (e) {
      console.error('Error locking invoice:', e);
      triggerAlert?.('Failed to transfer invoice', 'error');
    } finally {
      setTransferConfirmInvoice(null);
    }
  };

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* 1. HEADER & TOP CONTROL BAR */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Official Invoice System</span>
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">
            {isCustomer ? 'MY INVOICE HISTORY & BILLS' : isStaff ? 'STAFF INVOICE RECORDS & DUTIES' : 'ADMIN INVOICE MANAGEMENT & AUDIT'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete records with Before & After Discount breakdown, payment statuses, PDF download, email dispatch & secure locking
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Create Invoice Button */}
          {onOpenCreateInvoice && (
            <button
              type="button"
              onClick={onOpenCreateInvoice}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          )}

          {/* Type Switcher (Admin Only) */}
          {isAdmin && (
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setInvoiceTypeTab('studio')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  invoiceTypeTab === 'studio'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Studio Events
              </button>
              <button
                type="button"
                onClick={() => setInvoiceTypeTab('shop')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  invoiceTypeTab === 'shop'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Shop Sales
              </button>
              <button
                type="button"
                onClick={() => setInvoiceTypeTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  invoiceTypeTab === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Records
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. STATISTICAL SUMMARY CARDS (BEFORE / AFTER DISCOUNT & PAYMENT BREAKDOWN) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Invoices */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Invoices</span>
          <span className="text-lg font-black text-white">{statistics.totalInvoices}</span>
        </div>

        {/* Before Discount */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Before Discount</span>
          <span className="text-lg font-black text-slate-200">Rs. {statistics.totalBeforeDiscount.toLocaleString()}</span>
        </div>

        {/* Total Discounts */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-xl">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Total Discounts</span>
          <span className="text-lg font-black text-amber-400">-Rs. {statistics.totalDiscounts.toLocaleString()}</span>
        </div>

        {/* After Discount (Grand Total) */}
        <div className="bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-xl">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">After Discount Total</span>
          <span className="text-lg font-black text-amber-300">Rs. {statistics.totalAfterDiscount.toLocaleString()}</span>
        </div>

        {/* Paid / Advance */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-xl">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Paid / Advance</span>
          <span className="text-lg font-black text-emerald-400">Rs. {statistics.totalPaid.toLocaleString()}</span>
        </div>

        {/* Remaining Balance Due */}
        <div className="bg-slate-900/90 border border-red-500/30 p-3.5 rounded-xl">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Balance Due</span>
          <span className="text-lg font-black text-red-400">Rs. {statistics.totalBalanceDue.toLocaleString()}</span>
        </div>

      </div>

      {/* 3. COMPREHENSIVE FILTERING TOOLBAR */}
      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer name, phone, email, event..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Payment Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-bold">Payment:</span>
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer py-1"
              >
                <option value="All" className="bg-slate-900">All</option>
                <option value="Paid" className="bg-slate-900">Paid (Zero Balance)</option>
                <option value="Partial" className="bg-slate-900">Partial Advance</option>
                <option value="Unpaid" className="bg-slate-900">Unpaid</option>
              </select>
            </div>

            {/* Discount Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-bold">Discount:</span>
              <select
                value={discountFilter}
                onChange={e => setDiscountFilter(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer py-1"
              >
                <option value="All" className="bg-slate-900">All</option>
                <option value="With Discount" className="bg-slate-900">With Discount</option>
                <option value="Without Discount" className="bg-slate-900">Without Discount</option>
              </select>
            </div>

            {/* Role Filter (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-slate-400 font-bold">Created By:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer py-1"
                >
                  <option value="All" className="bg-slate-900">All Roles</option>
                  <option value="Admin" className="bg-slate-900">Admin</option>
                  <option value="Staff" className="bg-slate-900">Staff</option>
                  <option value="Customer" className="bg-slate-900">Customer</option>
                </select>
              </div>
            )}

            {/* Date Filter */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-bold">Date:</span>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer py-1"
              >
                <option value="All" className="bg-slate-900">All Time</option>
                <option value="Today" className="bg-slate-900">Today</option>
                <option value="This Week" className="bg-slate-900">This Week</option>
                <option value="This Month" className="bg-slate-900">This Month</option>
                <option value="Custom" className="bg-slate-900">Custom Date Range</option>
              </select>
            </div>

          </div>
        </div>

        {/* Custom Date Range Row */}
        {dateFilter === 'Custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-bold">Custom Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-bold text-xs outline-none focus:border-amber-400"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-bold text-xs outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* 4. INVOICES TABLE & ACTION BUTTONS */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Event / Shift</th>
                <th className="py-3 px-4">Before Discount</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Final Amount</th>
                <th className="py-3 px-4">Paid / Due</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="w-9 h-9 mx-auto mb-2 text-slate-600 opacity-40" />
                    <p className="text-sm font-semibold">No invoices match your selected filters.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const invId = inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8).toUpperCase() : 'INV-1001');
                  const gTotal = Number(inv.grandTotal || inv.total || 0);
                  const disc = Number(inv.discount || 0);
                  const sub = Number(inv.subtotal || (gTotal + disc));
                  const paid = Number(inv.advancePayment || inv.paidAmount || 0);
                  const bal = Number(inv.remainingBalance !== undefined ? inv.remainingBalance : (inv.balanceDue !== undefined ? inv.balanceDue : (gTotal - paid)));
                  const isLocked = !!inv.locked || !!inv.sentToStudio;

                  let statusText = inv.status || 'Pending';
                  if (bal <= 0 && gTotal > 0) statusText = 'Paid';
                  else if (paid > 0 && bal > 0) statusText = 'Partial';
                  else if (paid === 0) statusText = 'Unpaid';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Invoice ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-amber-400">#{invId}</span>
                          {isLocked && (
                            <span title="Locked - Sent to Hadi Studio" className="p-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{inv.formattedDate}</div>
                        {inv.invoiceType && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
                            {inv.invoiceType}
                          </span>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{inv.clientName || inv.customerName || 'Valued Customer'}</div>
                        <div className="text-[11px] text-slate-400">{inv.clientPhone || inv.customerPhone}</div>
                        {inv.clientEmail && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{inv.clientEmail}</div>
                        )}
                      </td>

                      {/* Event / Shift */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-amber-300">
                          {inv.eventType || inv.name || 'Event Booking'}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {inv.venue || inv.city || 'Lahore'} ({inv.shift || 'Night'})
                        </div>
                      </td>

                      {/* Before Discount */}
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        Rs. {sub.toLocaleString()}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4">
                        {disc > 0 ? (
                          <span className="font-bold text-amber-400">-Rs. {disc.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-500">Rs. 0</span>
                        )}
                      </td>

                      {/* Final Amount (After Discount) */}
                      <td className="py-3.5 px-4 font-black text-amber-400 text-sm">
                        Rs. {gTotal.toLocaleString()}
                      </td>

                      {/* Paid / Due */}
                      <td className="py-3.5 px-4">
                        <div className="text-emerald-400 font-bold">Adv: Rs. {paid.toLocaleString()}</div>
                        <div className="text-red-400 font-bold">Due: Rs. {bal.toLocaleString()}</div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          statusText === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : statusText === 'Partial'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {statusText}
                        </span>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          
                          {/* 1. VIEW INVOICE */}
                          <button
                            type="button"
                            onClick={() => setPreviewInvoice(inv)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                            title="View Invoice Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>VIEW</span>
                          </button>

                          {/* 2. EDIT INVOICE (Locked aware) */}
                          {onOpenEditInvoice && (
                            isLocked ? (
                              <button
                                type="button"
                                disabled
                                className="px-2 py-1 bg-slate-800/60 text-slate-500 border border-slate-700 rounded-lg font-bold flex items-center gap-1 cursor-not-allowed text-[11px]"
                                title="SENT TO HADI STUDIO – INVOICE LOCKED"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                                <span>LOCKED</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onOpenEditInvoice(inv)}
                                className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer border border-blue-500/30 text-[11px]"
                                title="Edit Full Invoice"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>EDIT</span>
                              </button>
                            )
                          )}

                          {/* 3. SEND TO HADI STUDIO (Transfer & Lock) */}
                          {!isLocked && (isAdmin || isStaff) && (
                            <button
                              type="button"
                              onClick={() => setTransferConfirmInvoice(inv)}
                              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer border border-emerald-500/30 text-[11px]"
                              title="Send to Hadi Studio & Lock"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>STUDIO</span>
                            </button>
                          )}

                          {/* 4. SEND TO EMAIL */}
                          <button
                            type="button"
                            onClick={() => setEmailModalInvoice(inv)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                            title="Send Invoice via Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>EMAIL</span>
                          </button>

                          {/* 5. DOWNLOAD PDF */}
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoicePDF(inv)}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          {/* 6. PRINT INVOICE */}
                          <button
                            type="button"
                            onClick={() => handlePrintInvoice(inv)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                            title="Print Clean Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PRINT</span>
                          </button>

                          {/* 7. ADMIN DELETE CONTROL */}
                          {isAdmin && onDeleteInvoice && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmInvoice(inv)}
                              className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. VIEW INVOICE PREVIEW MODAL */}
      {previewInvoice && (
        <InvoiceThemeRenderer
          invoice={previewInvoice}
          themeId={previewInvoice.invoiceTheme || settings.invoiceTheme || 'black_gold'}
          settings={settings}
          onClose={() => setPreviewInvoice(null)}
          onSendToEmail={(inv) => setEmailModalInvoice(inv)}
        />
      )}

      {/* 6. SEND EMAIL MODAL */}
      {emailModalInvoice && (
        <SendEmailModal
          isOpen={!!emailModalInvoice}
          onClose={() => setEmailModalInvoice(null)}
          invoice={emailModalInvoice}
          settings={settings}
          triggerAlert={triggerAlert}
          onSuccess={() => {
            onAddAuditLog?.({
              action: 'Invoice Email Dispatched',
              category: 'invoices',
              details: `Invoice #${emailModalInvoice.invoiceNumber || emailModalInvoice.id} sent via email`,
              targetId: emailModalInvoice.id
            });
          }}
        />
      )}

      {/* 7. SEND TO HADI STUDIO CONFIRMATION MODAL */}
      {transferConfirmInvoice && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Send Invoice to Hadi Studio?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                After sending, this invoice will be <strong>locked</strong> and cannot be edited by normal users.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Invoice #:</span>
                <span className="font-bold text-white">#{transferConfirmInvoice.invoiceNumber || transferConfirmInvoice.id?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="font-bold text-amber-400">{transferConfirmInvoice.clientName || transferConfirmInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Grand Total:</span>
                <span className="font-black text-emerald-400">Rs. {(transferConfirmInvoice.grandTotal || transferConfirmInvoice.total || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransferConfirmInvoice(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM & SEND</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deleteConfirmInvoice && (
        <DeleteConfirmationModal
          isOpen={!!deleteConfirmInvoice}
          onClose={() => setDeleteConfirmInvoice(null)}
          title="Delete Invoice"
          itemName={`Invoice #${deleteConfirmInvoice.invoiceNumber || deleteConfirmInvoice.id} (${deleteConfirmInvoice.clientName || deleteConfirmInvoice.customerName})`}
          itemType="Invoice Record"
          message="Are you sure you want to delete this invoice? This action will permanently remove the record from Firebase Firestore."
          onConfirm={async () => {
            if (onDeleteInvoice) {
              await onDeleteInvoice(deleteConfirmInvoice.id);
              triggerAlert?.('Invoice successfully deleted from Firestore.');
            }
          }}
        />
      )}

    </div>
  );
}
