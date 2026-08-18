import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  DollarSign,
  MapPin,
  Building,
  ShieldCheck,
  Mail,
  Send,
  Download,
  Edit3,
  AlertCircle,
  Camera,
  Video,
  HardDrive,
  BookOpen,
  User,
  Phone,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  Percent,
  Lock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import SendEmailModal from './SendEmailModal';

export const DEFAULT_INVOICE_EVENTS = [
  { id: 'ev_mayoon', name: 'Mayoon', enabled: true, isDefault: true },
  { id: 'ev_nikkah', name: 'Nikkah', enabled: true, isDefault: true },
  { id: 'ev_mehndi', name: 'Mehndi', enabled: true, isDefault: true },
  { id: 'ev_barat', name: 'Barat', enabled: true, isDefault: true },
  { id: 'ev_walima', name: 'Walima', enabled: true, isDefault: true },
  { id: 'ev_other', name: 'Other Event', enabled: true, isOther: true }
];

export default function InvoiceModal({
  isOpen,
  onClose,
  currentClient,
  userRole = 'admin', // 'admin' | 'staff' | 'customer'
  onSaveBill,
  onUpdateInvoice,
  onSendToStudioTransfer,
  editInvoiceData = null,
  savedSuccessModal,
  onCloseSuccessModal,
  studioSettings = {},
  onAddAuditLog,
  triggerAlert
}) {
  const isEditMode = !!editInvoiceData;
  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';
  const isCustomer = userRole === 'customer' || userRole === 'client';

  // Config from Studio Settings
  const eventsListConfig = studioSettings.eventsList && studioSettings.eventsList.length > 0
    ? studioSettings.eventsList
    : DEFAULT_INVOICE_EVENTS;

  const defaultVideoPrice = Number(studioSettings.videoPrice ?? studioSettings.videoDefaultPrice ?? 15000);
  const videoMaxQtyConfig = Number(studioSettings.videoMaxQty ?? 3);
  const defaultPhotoPrice = Number(studioSettings.photoPrice ?? studioSettings.photoDefaultPrice ?? 10000);
  const photoMaxQtyConfig = Number(studioSettings.photoMaxQty ?? 3);
  const defaultDronePrice = Number(studioSettings.dronePrice ?? studioSettings.droneDefaultPrice ?? 7000);
  const defaultFemalePrice = Number(studioSettings.femalePhotographerPrice ?? studioSettings.femaleDefaultPrice ?? 8000);
  const defaultMemory128Price = Number(studioSettings.memory128Price ?? 15000);
  const memory128MaxQtyConfig = Number(studioSettings.memory128MaxQty ?? 10);
  const defaultIndianAlbumPrice = Number(studioSettings.indianAlbumPrice ?? 12000);
  const indianAlbumMaxQtyConfig = Number(studioSettings.indianAlbumMaxQty ?? 10);
  
  // Discount & Special Rate Configuration
  const isDiscountGloballyEnabled = studioSettings.enableDiscount !== false;
  const isSpecialRateGloballyEnabled = studioSettings.enableSpecialRate !== false;
  const canAccessDiscount = isAdmin && isDiscountGloballyEnabled;
  const canAccessSpecialRate = isAdmin && isSpecialRateGloballyEnabled;

  // 1. Customer Information
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [venueGlobal, setVenueGlobal] = useState('');
  const [cityGlobal, setCityGlobal] = useState('Lahore');
  const [outOfLahore, setOutOfLahore] = useState(false);

  // 2. Events Rows State (Array of event objects with per-item rate override capability)
  const [eventsRows, setEventsRows] = useState([]);

  // 3. Additional Services (128 GB & Indian Album)
  const [memory128Qty, setMemory128Qty] = useState(0);
  const [memory128CustomRate, setMemory128CustomRate] = useState('');
  const [indianAlbumQty, setIndianAlbumQty] = useState(0);
  const [indianAlbumCustomRate, setIndianAlbumCustomRate] = useState('');
  const [manualCameraNotes, setManualCameraNotes] = useState('');

  // 4. Special / Custom Rate Mode (Admin Only)
  const [isSpecialRateMode, setIsSpecialRateMode] = useState(false);
  const [specialRateOverallAmount, setSpecialRateOverallAmount] = useState('');
  const [specialRateReason, setSpecialRateReason] = useState('');

  // 5. Financials & Payment Status
  const [discountVal, setDiscountVal] = useState('');
  const [paymentStatusMode, setPaymentStatusMode] = useState('Unpaid'); // 'Paid' | 'Unpaid' | 'Partial'
  const [advancePay, setAdvancePay] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // 6. UI & Saving States
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [activeSuccessInvoice, setActiveSuccessInvoice] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);

  // Helper to construct initial events state
  const buildInitialEvents = (existingEvents = [], configList = eventsListConfig) => {
    return configList
      .filter(ev => ev.enabled !== false)
      .map(cfg => {
        const existing = existingEvents.find(
          e => e.eventId === cfg.id || e.eventName?.toLowerCase() === cfg.name.toLowerCase()
        );

        return {
          eventId: cfg.id,
          eventName: cfg.name,
          isOther: !!cfg.isOther,
          otherEventName: existing?.otherEventName || '',
          selected: existing ? !!existing.selected : (cfg.isDefault && (cfg.name === 'Barat' || cfg.name === 'Nikkah')),
          date: existing?.date || '',
          shift: existing?.shift || 'Night',
          videoQty: existing ? Number(existing.videoQty || 0) : (cfg.name === 'Barat' ? 1 : 0),
          videoCustomPrice: existing?.videoPrice !== undefined && existing.videoPrice !== defaultVideoPrice ? String(existing.videoPrice) : '',
          photoQty: existing ? Number(existing.photoQty || 0) : (cfg.name === 'Barat' ? 1 : 0),
          photoCustomPrice: existing?.photoPrice !== undefined && existing.photoPrice !== defaultPhotoPrice ? String(existing.photoPrice) : '',
          drone: existing ? !!existing.drone : false,
          droneCustomPrice: existing?.dronePrice !== undefined && existing.dronePrice !== defaultDronePrice ? String(existing.dronePrice) : '',
          femalePhotographer: existing ? !!existing.femalePhotographer : false,
          femaleCustomPrice: existing?.femalePrice !== undefined && existing.femalePrice !== defaultFemalePrice ? String(existing.femalePrice) : '',
          venue: existing?.venue || '',
          city: existing?.city || 'Lahore'
        };
      });
  };

  // Sync state on open/edit
  useEffect(() => {
    if (editInvoiceData) {
      setCustName(editInvoiceData.clientName || editInvoiceData.customerName || '');
      setCustPhone(editInvoiceData.clientPhone || editInvoiceData.customerPhone || '');
      setCustEmail(editInvoiceData.clientEmail || editInvoiceData.customerEmail || '');
      setCustAddress(editInvoiceData.clientAddress || editInvoiceData.customerAddress || '');
      setVenueGlobal(editInvoiceData.venue || '');
      setCityGlobal(editInvoiceData.city || 'Lahore');
      setOutOfLahore(!!editInvoiceData.outOfLahore);
      setMemory128Qty(Number(editInvoiceData.memory128Qty || editInvoiceData.memoryCard128GbQty || editInvoiceData.services?.hardDriveQty || 0));
      setMemory128CustomRate(editInvoiceData.memory128Price !== undefined && editInvoiceData.memory128Price !== defaultMemory128Price ? String(editInvoiceData.memory128Price) : '');
      setIndianAlbumQty(Number(editInvoiceData.indianAlbumQty || (editInvoiceData.services?.indianAlbum && editInvoiceData.services?.indianAlbum !== 'None' ? 1 : 0)));
      setIndianAlbumCustomRate(editInvoiceData.indianAlbumPrice !== undefined && editInvoiceData.indianAlbumPrice !== defaultIndianAlbumPrice ? String(editInvoiceData.indianAlbumPrice) : '');
      setManualCameraNotes(editInvoiceData.manualCameraNotes || editInvoiceData.manualCamera || '');
      setSpecialNotes(editInvoiceData.notes || '');
      setDiscountVal(editInvoiceData.discount !== undefined ? String(editInvoiceData.discount) : '');

      // Special Rate mode
      if (editInvoiceData.isSpecialRate) {
        setIsSpecialRateMode(true);
        setSpecialRateOverallAmount(String(editInvoiceData.specialRateAmount || ''));
        setSpecialRateReason(editInvoiceData.specialRateNotes || '');
      } else {
        setIsSpecialRateMode(false);
        setSpecialRateOverallAmount('');
        setSpecialRateReason('');
      }

      // Payment Status
      const paid = Number(editInvoiceData.advancePayment !== undefined ? editInvoiceData.advancePayment : (editInvoiceData.paidAmount || 0));
      const bal = Number(editInvoiceData.remainingBalance !== undefined ? editInvoiceData.remainingBalance : (editInvoiceData.balanceDue || 0));
      const gTotal = Number(editInvoiceData.grandTotal || 0);

      setAdvancePay(paid > 0 ? String(paid) : '');
      if (bal <= 0 && gTotal > 0) setPaymentStatusMode('Paid');
      else if (paid > 0 && bal > 0) setPaymentStatusMode('Partial');
      else setPaymentStatusMode('Unpaid');

      // Events breakdown array
      if (editInvoiceData.eventsBreakdown && Array.isArray(editInvoiceData.eventsBreakdown)) {
        setEventsRows(buildInitialEvents(editInvoiceData.eventsBreakdown, eventsListConfig));
      } else {
        const legacyEvents = [];
        if (editInvoiceData.eventType) {
          legacyEvents.push({
            eventName: editInvoiceData.eventType,
            selected: true,
            date: editInvoiceData.eventDate || '',
            shift: editInvoiceData.shift || 'Night',
            videoQty: Number(editInvoiceData.services?.videoQty || 1),
            photoQty: Number(editInvoiceData.services?.photoQty || 1),
            drone: Number(editInvoiceData.services?.droneQty || 0) > 0 || !!editInvoiceData.droneCamera,
            femalePhotographer: !!editInvoiceData.services?.femalePhotographer || !!editInvoiceData.femalePhotographer
          });
        }
        setEventsRows(buildInitialEvents(legacyEvents, eventsListConfig));
      }
    } else if (currentClient) {
      setCustName(currentClient.name || '');
      setCustPhone(currentClient.phone || '');
      setCustEmail(currentClient.email || '');
      setCustAddress(currentClient.address || '');
      setVenueGlobal('');
      setCityGlobal('Lahore');
      setOutOfLahore(false);
      setMemory128Qty(0);
      setMemory128CustomRate('');
      setIndianAlbumQty(0);
      setIndianAlbumCustomRate('');
      setManualCameraNotes('');
      setSpecialNotes('');
      setDiscountVal('');
      setIsSpecialRateMode(false);
      setSpecialRateOverallAmount('');
      setSpecialRateReason('');
      setPaymentStatusMode('Unpaid');
      setAdvancePay('');
      setEventsRows(buildInitialEvents([], eventsListConfig));
    } else {
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustAddress('');
      setVenueGlobal('');
      setCityGlobal('Lahore');
      setOutOfLahore(false);
      setMemory128Qty(0);
      setMemory128CustomRate('');
      setIndianAlbumQty(0);
      setIndianAlbumCustomRate('');
      setManualCameraNotes('');
      setSpecialNotes('');
      setDiscountVal('');
      setIsSpecialRateMode(false);
      setSpecialRateOverallAmount('');
      setSpecialRateReason('');
      setPaymentStatusMode('Unpaid');
      setAdvancePay('');
      setEventsRows(buildInitialEvents([], eventsListConfig));
    }
    setSaveErrorMessage('');
  }, [editInvoiceData, currentClient, isOpen, studioSettings]);

  // Event Row Update Handlers
  const handleToggleEvent = (idx) => {
    setEventsRows(prev => {
      const copy = [...prev];
      const target = { ...copy[idx] };
      target.selected = !target.selected;
      if (target.selected) {
        if (target.videoQty === 0 && target.photoQty === 0) {
          target.videoQty = 1;
          target.photoQty = 1;
        }
      }
      copy[idx] = target;
      return copy;
    });
  };

  const handleUpdateEventRow = (idx, field, value) => {
    setEventsRows(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Calculations for each row
  const calculatedRows = useMemo(() => {
    return eventsRows.map(row => {
      const isIncluded = row.selected;
      const vQty = isIncluded ? Number(row.videoQty || 0) : 0;
      const pQty = isIncluded ? Number(row.photoQty || 0) : 0;

      const effectiveVideoPrice = row.videoCustomPrice ? Number(row.videoCustomPrice) : defaultVideoPrice;
      const effectivePhotoPrice = row.photoCustomPrice ? Number(row.photoCustomPrice) : defaultPhotoPrice;
      const effectiveDronePrice = row.droneCustomPrice ? Number(row.droneCustomPrice) : defaultDronePrice;
      const effectiveFemalePrice = row.femaleCustomPrice ? Number(row.femaleCustomPrice) : defaultFemalePrice;

      const vAmt = vQty * effectiveVideoPrice;
      const pAmt = pQty * effectivePhotoPrice;
      const dAmt = isIncluded && row.drone ? effectiveDronePrice : 0;
      const fAmt = isIncluded && row.femalePhotographer ? effectiveFemalePrice : 0;
      const rowTotal = vAmt + pAmt + dAmt + fAmt;

      return {
        ...row,
        effectiveVideoPrice,
        effectivePhotoPrice,
        effectiveDronePrice,
        effectiveFemalePrice,
        videoAmount: vAmt,
        photoAmount: pAmt,
        droneAmount: dAmt,
        femalePhotographerAmount: fAmt,
        rowTotal
      };
    });
  }, [eventsRows, defaultVideoPrice, defaultPhotoPrice, defaultDronePrice, defaultFemalePrice]);

  // Totals Calculation
  const eventsSubtotal = useMemo(() => {
    return calculatedRows.reduce((sum, r) => sum + r.rowTotal, 0);
  }, [calculatedRows]);

  const effectiveMemory128Price = memory128CustomRate ? Number(memory128CustomRate) : defaultMemory128Price;
  const effectiveIndianAlbumPrice = indianAlbumCustomRate ? Number(indianAlbumCustomRate) : defaultIndianAlbumPrice;

  const memory128Total = memory128Qty * effectiveMemory128Price;
  const indianAlbumTotal = indianAlbumQty * effectiveIndianAlbumPrice;
  const additionalServicesTotal = memory128Total + indianAlbumTotal;

  const rawSubtotal = eventsSubtotal + additionalServicesTotal;
  const outOfLahoreSurcharge = outOfLahore ? Math.round(rawSubtotal * 0.20) : 0;
  const subtotalBeforeDiscount = rawSubtotal + outOfLahoreSurcharge;

  // Final / Grand Total calculation
  const discountNum = canAccessDiscount ? (Number(discountVal) || 0) : 0;
  
  let grandTotal = Math.max(0, subtotalBeforeDiscount - discountNum);
  if (isSpecialRateMode && specialRateOverallAmount !== '') {
    grandTotal = Number(specialRateOverallAmount) || 0;
  }

  // Payment Status & Balance Calculation
  let calculatedPaidAmount = 0;
  if (paymentStatusMode === 'Paid') {
    calculatedPaidAmount = grandTotal;
  } else if (paymentStatusMode === 'Unpaid') {
    calculatedPaidAmount = 0;
  } else {
    calculatedPaidAmount = Number(advancePay) || 0;
  }

  const remainingBalance = Math.max(0, grandTotal - calculatedPaidAmount);

  // Active selected events summary
  const activeEvents = calculatedRows.filter(r => r.selected);

  // Payment Mode Change Handler
  const handlePaymentModeChange = (mode) => {
    setPaymentStatusMode(mode);
    if (mode === 'Paid') {
      setAdvancePay(String(grandTotal));
    } else if (mode === 'Unpaid') {
      setAdvancePay('0');
    }
  };

  // SAVE / CREATE INVOICE SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveErrorMessage('');

    if (!custName.trim()) {
      alert('Please enter the Customer Name.');
      return;
    }

    if (activeEvents.length === 0) {
      alert('Please select at least one event (e.g. Mayoon, Nikkah, Mehndi, Barat, Walima, Other Event) in the table.');
      return;
    }

    // Check dates
    const missingDate = activeEvents.find(ev => !ev.date);
    if (missingDate) {
      const displayName = missingDate.isOther && missingDate.otherEventName ? missingDate.otherEventName : missingDate.eventName;
      alert(`Please select an Event Date for ${displayName}.`);
      return;
    }

    setIsSaving(true);

    try {
      const primaryEvent = activeEvents[0];
      const eventTypeSummary = activeEvents.map(e => e.isOther && e.otherEventName ? e.otherEventName : e.eventName).join(', ');
      const primaryEventDate = primaryEvent.date;

      const totalVideoCameras = activeEvents.reduce((sum, r) => sum + Number(r.videoQty || 0), 0);
      const totalPhotoCameras = activeEvents.reduce((sum, r) => sum + Number(r.photoQty || 0), 0);
      const totalDroneCount = activeEvents.filter(r => r.drone).length;
      const hasFemalePhotographer = activeEvents.some(r => r.femalePhotographer);

      // Generate unique invoice number if not already present
      const invoiceNumber = editInvoiceData?.invoiceNumber || editInvoiceData?.id || `HADI-${Date.now().toString().slice(-6)}`;
      const docId = editInvoiceData?.id || invoiceNumber;

      const billObj = {
        id: docId,
        invoiceNumber,
        clientName: custName.trim(),
        customerName: custName.trim(),
        clientPhone: custPhone.trim(),
        customerPhone: custPhone.trim(),
        clientEmail: custEmail.trim(),
        customerEmail: custEmail.trim(),
        clientAddress: custAddress.trim(),
        customerAddress: custAddress.trim(),
        venue: venueGlobal || primaryEvent.venue || 'PC Hotel / Studio Booking',
        city: cityGlobal || primaryEvent.city || 'Lahore',
        eventType: eventTypeSummary,
        eventDate: primaryEventDate,
        shift: primaryEvent.shift || 'Night',
        outOfLahore,
        outOfLahoreSurcharge,

        // Events Table Breakdown
        eventsBreakdown: calculatedRows.map(r => ({
          eventId: r.eventId,
          eventName: r.eventName,
          isOther: !!r.isOther,
          otherEventName: r.otherEventName || '',
          displayName: r.isOther && r.otherEventName ? r.otherEventName : r.eventName,
          selected: r.selected,
          date: r.date,
          shift: r.shift,
          videoQty: r.selected ? Number(r.videoQty || 0) : 0,
          videoPrice: r.effectiveVideoPrice,
          videoAmount: r.videoAmount,
          photoQty: r.selected ? Number(r.photoQty || 0) : 0,
          photoPrice: r.effectivePhotoPrice,
          photoAmount: r.photoAmount,
          drone: r.selected && r.drone,
          dronePrice: r.effectiveDronePrice,
          droneAmount: r.droneAmount,
          femalePhotographer: r.selected && r.femalePhotographer,
          femalePrice: r.effectiveFemalePrice,
          femalePhotographerAmount: r.femalePhotographerAmount,
          rowTotal: r.rowTotal
        })),

        // Additional Services
        memory128Qty,
        memory128Price: effectiveMemory128Price,
        memory128Total,
        indianAlbumQty,
        indianAlbumPrice: effectiveIndianAlbumPrice,
        indianAlbumTotal,
        manualCameraNotes,
        notes: specialNotes,

        // Special Rate & Pricing Structure
        isSpecialRate: isSpecialRateMode,
        specialRateAmount: isSpecialRateMode ? (Number(specialRateOverallAmount) || 0) : 0,
        specialRateNotes: isSpecialRateMode ? specialRateReason : '',
        originalAmount: subtotalBeforeDiscount,
        beforeDiscount: subtotalBeforeDiscount,
        subtotal: subtotalBeforeDiscount,
        discount: discountNum,
        finalAmount: grandTotal,
        grandTotal,
        afterDiscount: grandTotal,

        // Payment Details
        paymentStatus: paymentStatusMode,
        status: paymentStatusMode,
        advancePayment: calculatedPaidAmount,
        paidAmount: calculatedPaidAmount,
        remainingBalance,
        balanceDue: remainingBalance,

        // Services summary object
        services: {
          videoQty: totalVideoCameras,
          videoPrice: defaultVideoPrice,
          videoTotal: activeEvents.reduce((sum, r) => sum + r.videoAmount, 0),
          photoQty: totalPhotoCameras,
          photoPrice: defaultPhotoPrice,
          photoTotal: activeEvents.reduce((sum, r) => sum + r.photoAmount, 0),
          droneQty: totalDroneCount,
          dronePrice: defaultDronePrice,
          droneTotal: activeEvents.reduce((sum, r) => sum + r.droneAmount, 0),
          femalePhotographer: hasFemalePhotographer,
          femalePrice: defaultFemalePrice,
          femaleTotal: activeEvents.reduce((sum, r) => sum + r.femalePhotographerAmount, 0),
          hardDriveQty: memory128Qty,
          hardDrivePrice: effectiveMemory128Price,
          hardDriveTotal: memory128Total,
          indianAlbum: indianAlbumQty > 0 ? `${indianAlbumQty} Unit(s)` : 'None',
          albumTotal: indianAlbumTotal
        },

        invoiceTheme: studioSettings.invoiceTheme || 'black_gold',
        createdByRole: userRole,
        locked: !!editInvoiceData?.locked,
        sentToStudio: !!editInvoiceData?.sentToStudio,
        updatedAt: new Date().toISOString(),
        ...(!isEditMode ? { createdAt: new Date().toISOString() } : {})
      };

      let result;
      if (isEditMode && onUpdateInvoice) {
        result = await onUpdateInvoice(billObj);
      } else if (onSaveBill) {
        result = await onSaveBill(billObj);
      }

      const finalSavedObj = result || billObj;
      setActiveSuccessInvoice(finalSavedObj);
      triggerAlert?.('Invoice Saved Successfully');

      onAddAuditLog?.({
        action: isEditMode ? 'Invoice Updated' : 'Invoice Saved',
        category: 'studio',
        details: `${isEditMode ? 'Updated' : 'Created'} Invoice #${invoiceNumber} for ${custName} (Total: Rs. ${grandTotal.toLocaleString()})`,
        targetId: docId
      });

    } catch (err) {
      console.error('Invoice Save Error:', err);
      const errMsg = err?.message || 'Error saving invoice to Firestore. Please check your network and try again.';
      setSaveErrorMessage(errMsg);
      triggerAlert?.(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Generator for Saved Invoice
  const handleDownloadPDF = (inv) => {
    if (!inv) return;
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const currency = studioSettings.currency || 'Rs.';
      let y = 14;

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, y, 182, 24, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(245, 158, 11);
      pdf.text(studioSettings.name || 'HADI PHOTO STUDIO & EVENTS', 18, y + 9);

      pdf.setFontSize(8.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text('OFFICIAL EVENT BOOKING & ESTIMATE INVOICE', 18, y + 17);

      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text(`Phone: ${studioSettings.contact || '0305-8304908'}`, 130, y + 9);
      pdf.text(`Email: ${studioSettings.email || 'malikshahzadmehmood3934@gmail.com'}`, 130, y + 14);
      pdf.text(`Address: ${studioSettings.address || 'Gulgasht Colony, Multan / Lahore'}`, 130, y + 19);

      y += 28;

      // Number & Date
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      const invId = inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8).toUpperCase() : 'HADI-1001');
      pdf.text(`INVOICE #: ${invId}`, 14, y);
      pdf.text(`DATE: ${new Date(inv.createdAt || Date.now()).toLocaleDateString()}`, 140, y);
      y += 5;

      // Customer
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(14, y, 182, 22, 2, 2, 'FD');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CUSTOMER DETAILS:', 18, y + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${inv.clientName || inv.customerName || 'N/A'}`, 18, y + 12);
      pdf.text(`Phone: ${inv.clientPhone || inv.customerPhone || 'N/A'}`, 18, y + 17);
      pdf.text(`Email: ${inv.clientEmail || inv.customerEmail || 'N/A'}`, 105, y + 12);
      pdf.text(`Address: ${inv.clientAddress || inv.customerAddress || 'Lahore'}`, 105, y + 17);

      y += 26;

      // Events Table Header
      pdf.setFillColor(30, 41, 59);
      pdf.rect(14, y, 182, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT', 16, y + 5);
      pdf.text('DATE', 42, y + 5);
      pdf.text('SHIFT', 62, y + 5);
      pdf.text('VIDEO', 78, y + 5);
      pdf.text('PHOTO', 104, y + 5);
      pdf.text('DRONE', 130, y + 5);
      pdf.text('FEMALE', 154, y + 5);
      pdf.text('TOTAL', 194, y + 5, { align: 'right' });
      y += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(7);

      const eventsToRender = (inv.eventsBreakdown || []).filter(e => e.selected);
      eventsToRender.forEach((ev, idx) => {
        if (idx % 2 === 1) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(14, y, 182, 6.5, 'F');
        }
        const evName = ev.isOther && ev.otherEventName ? ev.otherEventName : ev.eventName;
        pdf.text(evName.slice(0, 14), 16, y + 4.5);
        pdf.text(ev.date || '-', 42, y + 4.5);
        pdf.text(ev.shift || 'Night', 62, y + 4.5);
        pdf.text(`${ev.videoQty} (${currency} ${(ev.videoAmount || 0).toLocaleString()})`, 78, y + 4.5);
        pdf.text(`${ev.photoQty} (${currency} ${(ev.photoAmount || 0).toLocaleString()})`, 104, y + 4.5);
        pdf.text(ev.drone ? `YES (${currency} ${(ev.droneAmount || 0).toLocaleString()})` : 'NO', 130, y + 4.5);
        pdf.text(ev.femalePhotographer ? `YES (${currency} ${(ev.femalePhotographerAmount || 0).toLocaleString()})` : 'NO', 154, y + 4.5);
        pdf.text(`${currency} ${(ev.rowTotal || 0).toLocaleString()}`, 194, y + 4.5, { align: 'right' });
        y += 6.5;
      });

      y += 3;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, y, 196, y);
      y += 4;

      // Additional Services
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('ADDITIONAL SERVICES & STORAGE:', 14, y);
      y += 5;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      const memQty = inv.memory128Qty || 0;
      const albQty = inv.indianAlbumQty || 0;

      pdf.text(`• 128 GB Storage: ${memQty} Unit(s) = ${currency} ${(inv.memory128Total || 0).toLocaleString()}`, 18, y);
      y += 4.5;
      pdf.text(`• Luxury Indian Album: ${albQty} Unit(s) = ${currency} ${(inv.indianAlbumTotal || 0).toLocaleString()}`, 18, y);
      y += 4.5;

      if (inv.manualCameraNotes) {
        pdf.text(`• Special Equipment / Camera Notes: ${inv.manualCameraNotes}`, 18, y);
        y += 4.5;
      }

      y += 3;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(14, y, 196, y);
      y += 5;

      // Financials
      pdf.setFontSize(8.5);
      pdf.text('Before Discount / Subtotal:', 135, y);
      pdf.text(`${currency} ${(inv.subtotal || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      if (inv.discount > 0) {
        pdf.setTextColor(217, 119, 6);
        pdf.text('Discount Applied:', 135, y);
        pdf.text(`-${currency} ${(inv.discount || 0).toLocaleString()}`, 194, y, { align: 'right' });
        pdf.setTextColor(15, 23, 42);
        y += 5;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.text('FINAL AMOUNT / GRAND TOTAL:', 135, y);
      pdf.text(`${currency} ${(inv.grandTotal || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 6;

      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      pdf.text('Paid / Advance Received:', 135, y);
      pdf.text(`${currency} ${(inv.advancePayment || inv.paidAmount || 0).toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('REMAINING BALANCE DUE:', 135, y);
      pdf.text(`${currency} ${(inv.remainingBalance || inv.balanceDue || 0).toLocaleString()}`, 194, y, { align: 'right' });

      pdf.save(`Hadi_Studio_Invoice_${invId}.pdf`);
      triggerAlert?.('Invoice PDF Downloaded Successfully');
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  // Clean Print View
  const handlePrintClean = () => {
    window.print();
  };

  // Lock & Transfer to Hadi Studio
  const handleTransferToStudio = async (inv) => {
    if (!inv) return;
    try {
      const lockedObj = {
        ...inv,
        locked: true,
        sentToStudio: true,
        sentToStudioAt: new Date().toISOString(),
        sentByUser: userRole === 'admin' ? 'Admin' : (currentClient?.name || 'Staff')
      };

      if (onUpdateInvoice) {
        await onUpdateInvoice(lockedObj);
      } else if (onSendToStudioTransfer) {
        await onSendToStudioTransfer(lockedObj);
      }

      setActiveSuccessInvoice(lockedObj);
      setIsTransferConfirmOpen(false);
      triggerAlert?.(`Invoice #${inv.invoiceNumber || inv.id?.slice(0, 8)} has been sent to Hadi Studio and locked.`);

      onAddAuditLog?.({
        action: 'Invoice Sent & Locked',
        category: 'studio',
        details: `Invoice #${inv.invoiceNumber || inv.id} sent to Hadi Studio and locked from further edits`,
        targetId: inv.id
      });
    } catch (e) {
      console.error('Transfer Error:', e);
      triggerAlert?.('Failed to lock invoice', 'error');
    }
  };

  const activeModalInvoice = activeSuccessInvoice || savedSuccessModal;

  return (
    <>
      {/* 1. GENERATE / EDIT EVENT INVOICE FORM MODAL */}
      {isOpen && !activeModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0b1120] border border-amber-500/40 rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-y-auto shadow-2xl text-white">
            
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-amber-500/30 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  {isEditMode ? <Edit3 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-white">
                    {isEditMode ? 'EDIT STUDIO EVENT INVOICE' : 'GENERATE HADI STUDIO EVENT INVOICE'}
                  </h2>
                  <p className="text-xs text-amber-400 font-medium">
                    {isEditMode ? `Updating Invoice #${editInvoiceData?.invoiceNumber || editInvoiceData?.id?.slice(0, 8).toUpperCase()}` : 'Select events, calendar dates, camera gear & custom rates'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCustomer && (
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                    Client Portal
                  </span>
                )}
                {isStaff && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                    Staff Portal
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    Admin Full Control
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {saveErrorMessage && (
              <div className="m-4 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{saveErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 text-xs">
              
              {/* SECTION 1: CUSTOMER INFORMATION */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <h3 className="font-extrabold text-sm uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
                  <span>CUSTOMER INFORMATION</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      value={custName}
                      onChange={e => setCustName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="text"
                      value={custPhone}
                      onChange={e => setCustPhone(e.target.value)}
                      placeholder="e.g. 03001234567"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">City / Venue Location</label>
                    <input
                      type="text"
                      value={cityGlobal}
                      onChange={e => setCityGlobal(e.target.value)}
                      placeholder="e.g. Lahore / Multan"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFESSIONAL EVENT SERVICES TABLE */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
                    <div>
                      <h3 className="font-extrabold text-sm uppercase text-amber-400 tracking-wider">
                        EVENT SELECTION & SERVICES TABLE
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Select events (Mayoon, Nikkah, Mehndi, Barat, Walima, Other Event) with calendar dates, Day/Night & camera quantities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="text-slate-400">Default Rates — Video: <strong className="text-amber-300">Rs. {defaultVideoPrice.toLocaleString()}</strong></span>
                    <span className="text-slate-400">Photo: <strong className="text-amber-300">Rs. {defaultPhotoPrice.toLocaleString()}</strong></span>
                    <span className="text-slate-400">Drone: <strong className="text-amber-300">Rs. {defaultDronePrice.toLocaleString()}</strong></span>
                    <span className="text-slate-400">Female: <strong className="text-amber-300">Rs. {defaultFemalePrice.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* THE PROFESSIONAL EVENT TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[950px]">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-300 text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3 w-10 text-center">Include</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Event</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Date (Calendar)</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Day / Night</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Video Camera</th>
                        <th className="py-2.5 px-3 text-right min-w-[90px]">Video Amount</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Photo Camera</th>
                        <th className="py-2.5 px-3 text-right min-w-[90px]">Photo Amount</th>
                        <th className="py-2.5 px-3 min-w-[90px] text-center">Drone</th>
                        <th className="py-2.5 px-3 text-right min-w-[80px]">Drone Amt</th>
                        <th className="py-2.5 px-3 min-w-[90px] text-center">Female Photo</th>
                        <th className="py-2.5 px-3 text-right min-w-[80px]">Female Amt</th>
                        <th className="py-2.5 px-3 text-right font-black text-amber-400 min-w-[100px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {calculatedRows.map((row, idx) => {
                        const isChecked = !!row.selected;

                        return (
                          <tr
                            key={row.eventId || idx}
                            className={`transition-colors ${isChecked ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'opacity-60 hover:opacity-100'}`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleEvent(idx)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                            </td>

                            {/* Event Name & Other Event Text Field */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white text-xs">
                                {row.eventName}
                              </div>
                              {row.isOther && (
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    disabled={!isChecked}
                                    value={row.otherEventName}
                                    onChange={e => handleUpdateEventRow(idx, 'otherEventName', e.target.value)}
                                    placeholder="Other Event Name..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white focus:border-amber-400 outline-none"
                                  />
                                </div>
                              )}
                            </td>

                            {/* Date Picker (Calendar) */}
                            <td className="py-2.5 px-3">
                              <input
                                type="date"
                                disabled={!isChecked}
                                value={row.date}
                                onChange={e => handleUpdateEventRow(idx, 'date', e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs focus:border-amber-400 outline-none cursor-pointer disabled:opacity-40"
                              />
                            </td>

                            {/* Day / Night Shift */}
                            <td className="py-2.5 px-3">
                              <select
                                disabled={!isChecked}
                                value={row.shift}
                                onChange={e => handleUpdateEventRow(idx, 'shift', e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-amber-400 outline-none cursor-pointer disabled:opacity-40"
                              >
                                <option value="Night">Night</option>
                                <option value="Day">Day</option>
                              </select>
                            </td>

                            {/* Video Camera Quantity */}
                            <td className="py-2.5 px-3">
                              <select
                                disabled={!isChecked}
                                value={row.videoQty}
                                onChange={e => handleUpdateEventRow(idx, 'videoQty', Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-amber-400 outline-none cursor-pointer disabled:opacity-40"
                              >
                                {Array.from({ length: videoMaxQtyConfig + 1 }, (_, i) => (
                                  <option key={i} value={i}>{i} Cam</option>
                                ))}
                              </select>
                            </td>

                            {/* Video Amount */}
                            <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                              Rs. {row.videoAmount.toLocaleString()}
                            </td>

                            {/* Photo Camera Quantity */}
                            <td className="py-2.5 px-3">
                              <select
                                disabled={!isChecked}
                                value={row.photoQty}
                                onChange={e => handleUpdateEventRow(idx, 'photoQty', Number(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-amber-400 outline-none cursor-pointer disabled:opacity-40"
                              >
                                {Array.from({ length: photoMaxQtyConfig + 1 }, (_, i) => (
                                  <option key={i} value={i}>{i} Cam</option>
                                ))}
                              </select>
                            </td>

                            {/* Photo Amount */}
                            <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                              Rs. {row.photoAmount.toLocaleString()}
                            </td>

                            {/* Drone (YES / NO) */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                disabled={!isChecked}
                                onClick={() => handleUpdateEventRow(idx, 'drone', !row.drone)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  row.drone
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {row.drone ? 'YES' : 'NO'}
                              </button>
                            </td>

                            {/* Drone Amount */}
                            <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                              Rs. {row.droneAmount.toLocaleString()}
                            </td>

                            {/* Female Photographer (YES / NO) */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                disabled={!isChecked}
                                onClick={() => handleUpdateEventRow(idx, 'femalePhotographer', !row.femalePhotographer)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  row.femalePhotographer
                                    ? 'bg-pink-600 text-white font-black'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {row.femalePhotographer ? 'YES' : 'NO'}
                              </button>
                            </td>

                            {/* Female Amount */}
                            <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                              Rs. {row.femalePhotographerAmount.toLocaleString()}
                            </td>

                            {/* Row Total */}
                            <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                              Rs. {row.rowTotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-bold text-amber-300">
                  <span>Events Subtotal: Rs. {eventsSubtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* SECTION 3: ADDITIONAL SERVICES (128 GB & INDIAN ALBUM) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">3</span>
                  <span>ADDITIONAL SERVICES & STORAGE</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 128 GB Memory Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-white text-sm">128 GB High-Speed Memory Storage</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Rate: Rs. {effectiveMemory128Price.toLocaleString()} per card (Raw/Master Data)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-400 font-bold">Qty:</label>
                        <select
                          value={memory128Qty}
                          onChange={e => setMemory128Qty(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none cursor-pointer"
                        >
                          {Array.from({ length: memory128MaxQtyConfig + 1 }, (_, i) => (
                            <option key={i} value={i}>{i} {i === 1 ? 'Unit' : 'Units'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-1 font-bold text-amber-400 text-xs">
                        Total: Rs. {memory128Total.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Indian Album */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Luxury Indian Flushmount Album</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Rate: Rs. {effectiveIndianAlbumPrice.toLocaleString()} per album (Premium Velvet Finish)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-400 font-bold">Qty:</label>
                        <select
                          value={indianAlbumQty}
                          onChange={e => setIndianAlbumQty(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none cursor-pointer"
                        >
                          {Array.from({ length: indianAlbumMaxQtyConfig + 1 }, (_, i) => (
                            <option key={i} value={i}>{i} {i === 1 ? 'Album' : 'Albums'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-1 font-bold text-amber-400 text-xs">
                        Total: Rs. {indianAlbumTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Manual Camera Notes & Out of Lahore toggle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">
                      Manual Camera Name / Special Equipment Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualCameraNotes}
                      onChange={e => setManualCameraNotes(e.target.value)}
                      placeholder="e.g. Sony FX3 Cinema Setup, 85mm F1.4 GM, DJI Ronin RS3 Gimbal"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 border border-slate-700 hover:border-amber-500/50 px-3.5 py-2 rounded-lg w-full transition-colors">
                      <input
                        type="checkbox"
                        checked={outOfLahore}
                        onChange={e => setOutOfLahore(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="font-bold text-amber-300">Out of Lahore (+20% Travel)</span>
                    </label>
                  </div>
                </div>

                {outOfLahore && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-semibold flex justify-between">
                    <span>Out of City 20% Travel Surcharge Applied:</span>
                    <span>+ Rs. {outOfLahoreSurcharge.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* SECTION 4: ADMIN SPECIAL RATE / CUSTOM RATE OPTION (ADMIN ONLY) */}
              {canAccessSpecialRate && (
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-sm">Admin Custom / Special Rate Override</span>
                    </div>

                    <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsSpecialRateMode(false)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          !isSpecialRateMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Normal Calculated Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSpecialRateMode(true)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          isSpecialRateMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Special / Custom Rate
                      </button>
                    </div>
                  </div>

                  {isSpecialRateMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Special Rate Total Amount (Rs.) *
                        </label>
                        <input
                          type="number"
                          value={specialRateOverallAmount}
                          onChange={e => setSpecialRateOverallAmount(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-amber-300 font-bold text-sm focus:border-amber-400 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Original Calculated Total: Rs. {subtotalBeforeDiscount.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Special Rate Reason / Approval Note
                        </label>
                        <input
                          type="text"
                          value={specialRateReason}
                          onChange={e => setSpecialRateReason(e.target.value)}
                          placeholder="e.g. Special Family Package / Direct Admin Approval"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: FINANCIAL SUMMARY, DISCOUNT & PAYMENT BREAKDOWN */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-extrabold text-sm uppercase text-amber-400 tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">5</span>
                    <span>TOTALS, DISCOUNT & PAYMENT STATUS</span>
                  </h3>

                  {/* Payment Status Quick Switcher */}
                  <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handlePaymentModeChange('Unpaid')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        paymentStatusMode === 'Unpaid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      UNPAID
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentModeChange('Partial')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        paymentStatusMode === 'Partial' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      PARTIAL
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentModeChange('Paid')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        paymentStatusMode === 'Paid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      PAID
                    </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${canAccessDiscount ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3`}>
                  
                  {/* Subtotal (Before Discount) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">Subtotal (Before Discount)</span>
                    <span className="text-base font-black text-slate-200">Rs. {subtotalBeforeDiscount.toLocaleString()}</span>
                  </div>

                  {/* DISCOUNT: STRICTLY ADMIN ONLY & ONLY IF ENABLED */}
                  {canAccessDiscount && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40">
                      <label className="text-[11px] text-amber-400 font-bold block mb-1">
                        Admin Discount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={discountVal}
                        onChange={e => setDiscountVal(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:border-amber-400 outline-none"
                      />
                    </div>
                  )}

                  {/* Final Amount / Grand Total (After Discount) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                    <span className="text-[11px] text-amber-400 font-bold block">Final Amount (After Discount)</span>
                    <span className="text-base font-black text-amber-400">Rs. {grandTotal.toLocaleString()}</span>
                  </div>

                  {/* Advance / Paid Amount */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                    <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                      Paid / Advance (Rs.)
                    </label>
                    <input
                      type="number"
                      value={paymentStatusMode === 'Paid' ? grandTotal : paymentStatusMode === 'Unpaid' ? 0 : advancePay}
                      disabled={paymentStatusMode === 'Paid' || paymentStatusMode === 'Unpaid' || isCustomer}
                      onChange={e => setAdvancePay(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:border-amber-400 outline-none disabled:opacity-60"
                    />
                  </div>

                  {/* Balance Due (Automatically Calculated: Grand Total - Paid) */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-red-500/30">
                    <span className="text-[11px] text-red-400 font-bold block">Remaining Balance Due</span>
                    <span className="text-base font-black text-red-400">Rs. {remainingBalance.toLocaleString()}</span>
                  </div>

                </div>
              </div>

              {/* ACTION BUTTONS (SUBMIT & CANCEL) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isEditMode ? 'SAVE & UPDATE INVOICE' : 'SAVE INVOICE'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 2. SUCCESS VIEW & 6 INVOICE ACTION BUTTONS (POST-SAVE MODAL) */}
      {activeModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-white">
            
            {/* Action Buttons Top Bar: VIEW, EDIT, SEND TO HADI STUDIO, SEND TO EMAIL, DOWNLOAD, PRINT */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-amber-500/30 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-white">INVOICE READY</h2>
                  <p className="text-xs text-amber-400 font-semibold">
                    Invoice #{activeModalInvoice.invoiceNumber || activeModalInvoice.id?.slice(0, 8).toUpperCase() || 'HADI-1001'}
                  </p>
                </div>
              </div>

              {/* THE 6 REQUIRED ACTION BUTTONS */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* 1. VIEW INVOICE */}
                <button
                  type="button"
                  onClick={() => {
                    // Open Preview in new tab or dedicated clean view
                    triggerAlert?.('Viewing full invoice details below');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  title="View Full Invoice Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW</span>
                </button>

                {/* 2. EDIT INVOICE (Locked aware) */}
                {activeModalInvoice.locked || activeModalInvoice.sentToStudio ? (
                  <button
                    type="button"
                    disabled
                    className="bg-slate-800/70 text-slate-500 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
                    title="SENT TO HADI STUDIO – INVOICE LOCKED"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>LOCKED</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onCloseSuccessModal) onCloseSuccessModal();
                      setActiveSuccessInvoice(null);
                    }}
                    className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Edit Invoice Information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </button>
                )}

                {/* 3. SEND TO HADI STUDIO */}
                {(!activeModalInvoice.locked && !activeModalInvoice.sentToStudio) && (
                  <button
                    type="button"
                    onClick={() => setIsTransferConfirmOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    title="Send to Hadi Studio & Lock"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND TO STUDIO</span>
                  </button>
                )}

                {/* 4. SEND TO EMAIL */}
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Send to Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>EMAIL</span>
                </button>

                {/* 5. DOWNLOAD INVOICE (PDF) */}
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(activeModalInvoice)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Download Invoice PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD</span>
                </button>

                {/* 6. PRINT INVOICE */}
                <button
                  type="button"
                  onClick={handlePrintClean}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Print Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onCloseSuccessModal) onCloseSuccessModal();
                    setActiveSuccessInvoice(null);
                    if (onClose) onClose();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* INVOICE VIEW CONTENT PREVIEW */}
            <div className="p-4 sm:p-6 space-y-6 text-xs print:p-0">
              
              {/* Business Header */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-amber-400">{studioSettings.name || 'HADI PHOTO STUDIO & EVENTS'}</h3>
                  <p className="text-slate-400 mt-1">{studioSettings.address || 'Gulgasht Colony, Multan / Lahore, Pakistan'}</p>
                  <p className="text-slate-400">Phone: {studioSettings.contact || '0305-8304908'} | Email: {studioSettings.email || 'malikshahzadmehmood3934@gmail.com'}</p>
                </div>
                <div className="sm:text-right">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-black uppercase inline-block mb-1">
                    OFFICIAL INVOICE
                  </span>
                  <p className="text-slate-300 font-bold">
                    Invoice #: #{activeModalInvoice.invoiceNumber || activeModalInvoice.id?.slice(0, 8).toUpperCase() || 'HADI-1001'}
                  </p>
                  <p className="text-slate-400">Date: {new Date(activeModalInvoice.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Billed To / Customer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                  <p><strong>Name:</strong> {activeModalInvoice.clientName || activeModalInvoice.customerName}</p>
                  <p><strong>Phone:</strong> {activeModalInvoice.clientPhone || activeModalInvoice.customerPhone}</p>
                  <p><strong>Email:</strong> {activeModalInvoice.clientEmail || activeModalInvoice.customerEmail || 'N/A'}</p>
                </div>
              </div>

              {/* Events Breakdown Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold">
                      <th className="py-2.5 px-3">Event</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3">Video Camera</th>
                      <th className="py-2.5 px-3">Photo Camera</th>
                      <th className="py-2.5 px-3 text-center">Drone</th>
                      <th className="py-2.5 px-3 text-center">Female</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(activeModalInvoice.eventsBreakdown || []).filter(e => e.selected).map((ev, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-white">{ev.isOther && ev.otherEventName ? ev.otherEventName : ev.eventName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{ev.date || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-300">{ev.shift || 'Night'}</td>
                        <td className="py-2.5 px-3 text-slate-300">{ev.videoQty} (Rs. {(ev.videoAmount || 0).toLocaleString()})</td>
                        <td className="py-2.5 px-3 text-slate-300">{ev.photoQty} (Rs. {(ev.photoAmount || 0).toLocaleString()})</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{ev.drone ? 'YES' : 'NO'}</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{ev.femalePhotographer ? 'YES' : 'NO'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-400">Rs. {(ev.rowTotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Additional Services Info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Additional Services</h4>
                <p>• 128 GB Storage: {activeModalInvoice.memory128Qty || 0} Unit(s) — Rs. {(activeModalInvoice.memory128Total || 0).toLocaleString()}</p>
                <p>• Indian Album: {activeModalInvoice.indianAlbumQty || 0} Unit(s) — Rs. {(activeModalInvoice.indianAlbumTotal || 0).toLocaleString()}</p>
                {activeModalInvoice.manualCameraNotes && (
                  <p>• Equipment Notes: {activeModalInvoice.manualCameraNotes}</p>
                )}
              </div>

              {/* Totals Summary (Before Discount, Discount, Grand Total, Paid, Balance) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal / Before Discount:</span>
                  <span className="font-bold text-white">Rs. {(activeModalInvoice.subtotal || activeModalInvoice.beforeDiscount || 0).toLocaleString()}</span>
                </div>
                {activeModalInvoice.discount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount Applied:</span>
                    <span>-Rs. {(activeModalInvoice.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-slate-800 pt-2 text-white">
                  <span>FINAL AMOUNT / GRAND TOTAL:</span>
                  <span className="text-amber-400">Rs. {(activeModalInvoice.grandTotal || activeModalInvoice.finalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Paid / Advance Received:</span>
                  <span>Rs. {(activeModalInvoice.advancePayment || activeModalInvoice.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-400 font-black text-sm">
                  <span>REMAINING BALANCE DUE:</span>
                  <span>Rs. {(activeModalInvoice.remainingBalance || activeModalInvoice.balanceDue || 0).toLocaleString()}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. SEND EMAIL MODAL */}
      {isEmailModalOpen && activeModalInvoice && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          invoice={activeModalInvoice}
          settings={studioSettings}
          triggerAlert={triggerAlert}
          onSuccess={() => {
            onAddAuditLog?.({
              action: 'Invoice Email Sent',
              category: 'studio',
              details: `Invoice #${activeModalInvoice.invoiceNumber || activeModalInvoice.id} sent to email`,
              targetId: activeModalInvoice.id
            });
          }}
        />
      )}

      {/* 4. SEND TO HADI STUDIO CONFIRMATION POPUP */}
      {isTransferConfirmOpen && activeModalInvoice && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Send this invoice to Hadi Studio?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                After sending, this invoice will be <strong>locked</strong> and cannot be edited.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Invoice #:</span>
                <span className="font-bold text-white">#{activeModalInvoice.invoiceNumber || activeModalInvoice.id?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="font-bold text-amber-400">{activeModalInvoice.clientName || activeModalInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Grand Total:</span>
                <span className="font-black text-emerald-400">Rs. {(activeModalInvoice.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTransferConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handleTransferToStudio(activeModalInvoice)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM & SEND</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
