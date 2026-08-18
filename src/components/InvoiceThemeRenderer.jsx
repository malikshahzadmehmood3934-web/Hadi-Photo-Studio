import React, { useRef } from 'react';
import {
  Printer,
  Download,
  Mail,
  Building,
  Phone,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  FileText,
  User,
  Hash,
  Clock,
  Sparkles,
  ShieldCheck,
  Percent,
  DollarSign,
  HardDrive,
  BookOpen
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { INVOICE_THEMES } from '../utils/themePresets';

export default function InvoiceThemeRenderer({
  invoice,
  themeId = 'black_gold',
  settings = {},
  onClose,
  showActions = true,
  onSendToEmail,
  isLivePreview = false,
  customStyles = {}
}) {
  const printRef = useRef(null);

  if (!invoice) return null;

  // Selected Theme
  const currentTheme = INVOICE_THEMES.find(t => t.id === themeId) || INVOICE_THEMES[3]; // default black_gold

  // Field Visibility & Custom Labels from settings
  const customLabels = settings.invoiceCustomLabels || {};
  const fieldVisibility = settings.invoiceFieldVisibility || {};

  const getLabel = (key, fallback) => customLabels[key] || fallback;
  const isVisible = (key, fallback = true) => fieldVisibility[key] !== undefined ? fieldVisibility[key] : fallback;

  // Determine if it's a Studio invoice or a Shop invoice
  const isStudio = invoice.eventType !== undefined || invoice.services !== undefined || (invoice.eventsBreakdown && invoice.eventsBreakdown.length > 0);

  const businessName = isStudio ? (settings.name || 'HADI PHOTO STUDIO & EVENTS') : (settings.shopName || settings.name || 'HADI SHOP & EQUIPMENT');
  const businessContact = settings.contact || '0305-8304908';
  const businessEmail = settings.email || 'malikshahzadmehmood3934@gmail.com';
  const businessAddress = settings.address || 'Gulgasht Colony, Multan / Lahore, Pakistan';
  const currency = settings.currency || 'Rs.';

  const invoiceNumber = invoice.invoiceNumber || invoice.id || 'HADI-1001';
  const invoiceDate = invoice.date || invoice.eventDate || new Date().toISOString().split('T')[0];
  const customerName = invoice.customerName || invoice.clientName || 'Valued Customer';
  const customerPhone = invoice.customerPhone || invoice.clientPhone || 'N/A';
  const customerEmail = invoice.customerEmail || invoice.clientEmail || '';
  const customerAddress = invoice.customerAddress || invoice.clientAddress || '';

  const grandTotal = Number(invoice.grandTotal || invoice.total || 0);
  const paidAmount = Number(invoice.paidAmount !== undefined ? invoice.paidAmount : (invoice.advancePayment || 0));
  const balanceDue = Number(invoice.balanceDue !== undefined ? invoice.balanceDue : (invoice.remainingBalance || 0));
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const subtotal = Number(invoice.subtotal || (grandTotal + discount - tax));

  const activeEvents = (invoice.eventsBreakdown || []).filter(e => e.selected);

  // PDF Download Handler - Clean, Structured & Consistent
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let y = 14;

      // 1. Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(14, y, 182, 24, 'F');

      doc.setTextColor(245, 158, 11); // Amber Gold
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(businessName.toUpperCase(), 18, y + 9);

      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(isStudio ? 'EVENT BOOKING & EQUIPMENT ESTIMATE INVOICE' : 'COMMERCIAL SALES INVOICE', 18, y + 17);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Phone: ${businessContact}`, 130, y + 9);
      doc.text(`Email: ${businessEmail}`, 130, y + 14);
      doc.text(`Address: ${businessAddress}`, 130, y + 19);

      y += 28;

      // Invoice ID & Date line
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`INVOICE #: ${invoiceNumber}`, 14, y);
      doc.text(`DATE: ${invoiceDate}`, 140, y);
      y += 5;

      // 2. Client Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS:', 18, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${customerName}`, 18, y + 12);
      doc.text(`Phone: ${customerPhone}`, 18, y + 17);
      doc.text(`Email: ${customerEmail || 'N/A'}`, 105, y + 12);
      doc.text(`Address: ${customerAddress || 'Lahore'}`, 105, y + 17);

      y += 26;

      // 3. Event Table or Items Table
      if (isStudio && activeEvents.length > 0) {
        // Table Header
        doc.setFillColor(30, 41, 59);
        doc.rect(14, y, 182, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');

        doc.text('EVENT', 16, y + 5);
        doc.text('DATE', 42, y + 5);
        doc.text('SHIFT', 62, y + 5);
        doc.text('VIDEO', 78, y + 5);
        doc.text('PHOTO', 104, y + 5);
        doc.text('DRONE', 130, y + 5);
        doc.text('FEMALE', 154, y + 5);
        doc.text('TOTAL', 194, y + 5, { align: 'right' });

        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(7);

        activeEvents.forEach((ev, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, 182, 6.5, 'F');
          }
          const evName = ev.isOther && ev.otherEventName ? ev.otherEventName : (ev.displayName || ev.eventName || 'Event');
          doc.text(evName.slice(0, 14), 16, y + 4.5);
          doc.text(ev.date || '-', 42, y + 4.5);
          doc.text(ev.shift || 'Night', 62, y + 4.5);
          doc.text(`${ev.videoQty || 0} (${currency} ${(ev.videoAmount || 0).toLocaleString()})`, 78, y + 4.5);
          doc.text(`${ev.photoQty || 0} (${currency} ${(ev.photoAmount || 0).toLocaleString()})`, 104, y + 4.5);
          doc.text(ev.drone ? `YES (${currency} ${(ev.droneAmount || 0).toLocaleString()})` : 'NO', 130, y + 4.5);
          doc.text(ev.femalePhotographer ? `YES (${currency} ${(ev.femalePhotographerAmount || 0).toLocaleString()})` : 'NO', 154, y + 4.5);
          doc.text(`${currency} ${(ev.rowTotal || 0).toLocaleString()}`, 194, y + 4.5, { align: 'right' });
          y += 6.5;
        });

        y += 3;

        // Additional Services section in PDF
        doc.setDrawColor(226, 232, 240);
        doc.line(14, y, 196, y);
        y += 4;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('ADDITIONAL SERVICES & STORAGE:', 14, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const memQty = invoice.memory128Qty || invoice.memoryCard128GbQty || invoice.services?.hardDriveQty || 0;
        const albQty = invoice.indianAlbumQty || (invoice.services?.indianAlbum && invoice.services?.indianAlbum !== 'None' ? 1 : 0);

        doc.text(`• 128 GB High-Speed Memory Storage: ${memQty} Unit(s) × ${currency} ${(invoice.memory128Price || 15000).toLocaleString()} = ${currency} ${(invoice.memory128Total || (memQty * 15000)).toLocaleString()}`, 18, y);
        y += 4.5;
        doc.text(`• Luxury Indian Flushmount Album: ${albQty} Unit(s) × ${currency} ${(invoice.indianAlbumPrice || 12000).toLocaleString()} = ${currency} ${(invoice.indianAlbumTotal || (albQty * 12000)).toLocaleString()}`, 18, y);
        y += 4.5;

        if (invoice.manualCameraNotes) {
          doc.text(`• Special Equipment / Manual Camera Notes: ${invoice.manualCameraNotes}`, 18, y);
          y += 4.5;
        }
        if (invoice.outOfLahore) {
          doc.text(`• Out of Lahore Surcharge (+20%): Applied`, 18, y);
          y += 4.5;
        }

      } else {
        // Generic/Shop Items Header
        doc.setFillColor(30, 41, 59);
        doc.rect(14, y, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ITEM / SERVICE DESCRIPTION', 18, y + 5.5);
        doc.text('QTY', 125, y + 5.5, { align: 'center' });
        doc.text('RATE', 155, y + 5.5, { align: 'right' });
        doc.text('TOTAL', 192, y + 5.5, { align: 'right' });

        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);

        const itemsList = invoice.items || [
          { name: invoice.eventType || 'Studio Shoot Booking', qty: 1, price: subtotal, total: subtotal }
        ];

        itemsList.forEach((it, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, 182, 7, 'F');
          }
          doc.text(it.name || 'Item', 18, y + 5);
          doc.text(String(it.qty || 1), 125, y + 5, { align: 'center' });
          doc.text(`${currency} ${Number(it.price || 0).toLocaleString()}`, 155, y + 5, { align: 'right' });
          doc.text(`${currency} ${Number(it.total || 0).toLocaleString()}`, 192, y + 5, { align: 'right' });
          y += 7;
        });
      }

      // Financials Summary Box
      y += 4;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 196, y);
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text('Subtotal:', 135, y);
      doc.text(`${currency} ${subtotal.toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      if (discount > 0) {
        doc.setTextColor(217, 119, 6);
        doc.text('Discount Applied:', 135, y);
        doc.text(`-${currency} ${discount.toLocaleString()}`, 194, y, { align: 'right' });
        doc.setTextColor(15, 23, 42);
        y += 5;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('GRAND TOTAL:', 135, y);
      doc.text(`${currency} ${grandTotal.toLocaleString()}`, 194, y, { align: 'right' });
      y += 6;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(16, 185, 129);
      doc.text('Paid / Advance Received:', 135, y);
      doc.text(`${currency} ${paidAmount.toLocaleString()}`, 194, y, { align: 'right' });
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('REMAINING BALANCE DUE:', 135, y);
      doc.text(`${currency} ${balanceDue.toLocaleString()}`, 194, y, { align: 'right' });
      y += 8;

      // Terms & Conditions
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('TERMS & CONDITIONS:', 14, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const termsText = isStudio
        ? (settings.studioTerms || '1. 50% advance is mandatory on booking day.\n2. 80% payment must be cleared before the last day of the event.\n3. Raw Data must be requested at booking.\n4. Inform in advance for outside Lahore events.\n5. Footage kept for 10 days after delivery.')
        : (settings.shopTerms || 'Goods once sold are non-refundable without official receipt.');

      const splitTerms = doc.splitTextToSize(termsText, 182);
      doc.text(splitTerms, 14, y);

      // Footer Signatures
      y = 276;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 196, y);
      y += 5;

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Generated by Hadi Photo Studio & Events Management Software', 14, y);
      doc.text('Authorized Signatory ___________________', 194, y, { align: 'right' });

      doc.save(`Hadi_Invoice_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${isLivePreview ? 'p-1' : 'p-2 sm:p-4'}`}>
      
      {/* Top Action Bar */}
      {showActions && !isLivePreview && (
        <div className="mb-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xl print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Theme:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentTheme.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              type="button"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            {onSendToEmail && (
              <button
                onClick={() => onSendToEmail(invoice)}
                type="button"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* INVOICE CARD */}
      <div
        ref={printRef}
        id="printable-invoice-container"
        className={`rounded-2xl overflow-hidden ${currentTheme.cardBorder} ${
          themeId === 'black_gold' || themeId === 'studio' ? 'bg-[#090d16] text-slate-100' : 'bg-white text-slate-900'
        } shadow-2xl transition-all print:border-none print:shadow-none print:m-0`}
      >
        {/* 1. Header Banner */}
        <div className={currentTheme.headerBanner}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div>
              {isVisible('showLogo', true) && settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-10 mb-2 object-contain" referrerPolicy="no-referrer" />
              ) : null}
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{businessName}</h2>
              <div className="mt-1 space-y-0.5 text-xs opacity-90">
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-amber-400" /> {businessContact}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-amber-400" /> {businessEmail}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-400" /> {businessAddress}</p>
              </div>
            </div>

            <div className="text-left sm:text-right sm:self-center">
              <div className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider mb-2 ${currentTheme.badgeClass}`}>
                {getLabel('invoiceTitle', 'OFFICIAL INVOICE')}
              </div>
              {isVisible('invoiceNumber', true) && (
                <p className="text-sm font-bold opacity-90">
                  <span className="opacity-70">{getLabel('invoiceNumber', 'Invoice #')}:</span> {invoiceNumber}
                </p>
              )}
              {isVisible('invoiceDate', true) && (
                <p className="text-xs opacity-80 mt-0.5">
                  <span className="opacity-70">{getLabel('invoiceDate', 'Date')}:</span> {invoiceDate}
                </p>
              )}
              {invoice.status && (
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 text-slate-950'
                }`}>
                  {invoice.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Customer Information Section */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{getLabel('clientDetails', 'Billed To / Customer Details')}</span>
            </h4>
            <div className="space-y-1 text-xs">
              {isVisible('customerName', true) && (
                <p><strong className="opacity-70">{getLabel('customerName', 'Name')}:</strong> <span className="font-bold">{customerName}</span></p>
              )}
              {isVisible('customerPhone', true) && (
                <p><strong className="opacity-70">{getLabel('customerPhone', 'Phone')}:</strong> {customerPhone}</p>
              )}
              {isVisible('customerEmail', true) && customerEmail && (
                <p><strong className="opacity-70">{getLabel('customerEmail', 'Email')}:</strong> {customerEmail}</p>
              )}
              {isVisible('customerAddress', true) && customerAddress && (
                <p><strong className="opacity-70">{getLabel('customerAddress', 'Address')}:</strong> {customerAddress}</p>
              )}
            </div>
          </div>

          {isStudio && (
            <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{getLabel('eventDetails', 'Event Schedule & Location')}</span>
              </h4>
              <div className="space-y-1 text-xs">
                {isVisible('eventType', true) && (
                  <p><strong className="opacity-70">{getLabel('eventType', 'Event')}:</strong> <span className="font-bold text-amber-400">{invoice.eventType || 'Wedding Event'}</span> ({invoice.shift || 'Night'})</p>
                )}
                {isVisible('eventDate', true) && (
                  <p><strong className="opacity-70">{getLabel('eventDate', 'Date')}:</strong> {invoice.eventDate || invoiceDate}</p>
                )}
                {isVisible('venue', true) && invoice.venue && (
                  <p><strong className="opacity-70">{getLabel('venue', 'Venue')}:</strong> {invoice.venue}, {invoice.city || 'Lahore'}</p>
                )}
                {invoice.outOfLahore && (
                  <p className="text-amber-400 font-bold">Out of City Shoot: YES (+20% travel surcharge)</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. EVENT TABLE OR SHOP SERVICES TABLE */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          {isStudio && activeEvents.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Event Services Breakdown Table</h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className={`border-b ${currentTheme.tableHeaderBg} font-bold`}>
                    <th className="p-2.5 rounded-l-lg">Event</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Shift</th>
                    <th className="p-2.5">Video Camera</th>
                    <th className="p-2.5">Photo Camera</th>
                    <th className="p-2.5 text-center">Drone</th>
                    <th className="p-2.5 text-center">Female</th>
                    <th className="p-2.5 text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/15">
                  {activeEvents.map((ev, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold">{ev.isOther && ev.otherEventName ? ev.otherEventName : (ev.displayName || ev.eventName)}</td>
                      <td className="p-2.5">{ev.date || 'N/A'}</td>
                      <td className="p-2.5">{ev.shift || 'Night'}</td>
                      <td className="p-2.5">{ev.videoQty || 0} ({currency} {(ev.videoAmount || 0).toLocaleString()})</td>
                      <td className="p-2.5">{ev.photoQty || 0} ({currency} {(ev.photoAmount || 0).toLocaleString()})</td>
                      <td className="p-2.5 text-center">{ev.drone ? 'YES' : 'NO'}</td>
                      <td className="p-2.5 text-center">{ev.femalePhotographer ? 'YES' : 'NO'}</td>
                      <td className="p-2.5 text-right font-bold text-amber-400">{currency} {(ev.rowTotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Additional Services row */}
              <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1 text-xs">
                <span className="font-bold text-amber-500 block">Additional Services & Storage:</span>
                <p>• 128 GB Memory Card: {invoice.memory128Qty || invoice.memoryCard128GbQty || 0} Unit(s) — {currency} {(invoice.memory128Total || ((invoice.memory128Qty || 0) * 15000)).toLocaleString()}</p>
                <p>• Indian Album: {invoice.indianAlbumQty || 0} Unit(s) — {currency} {(invoice.indianAlbumTotal || ((invoice.indianAlbumQty || 0) * 12000)).toLocaleString()}</p>
                {invoice.manualCameraNotes && (
                  <p>• Equipment Notes: {invoice.manualCameraNotes}</p>
                )}
              </div>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b ${currentTheme.tableHeaderBg} font-bold`}>
                  <th className="p-2.5 rounded-l-lg">{getLabel('itemDescription', 'Item / Service Description')}</th>
                  <th className="p-2.5 text-center">{getLabel('qty', 'Qty')}</th>
                  <th className="p-2.5 text-right">{getLabel('rate', 'Unit Rate')}</th>
                  <th className="p-2.5 text-right rounded-r-lg">{getLabel('amount', 'Amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-500/15">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5">
                      <div className="font-bold">{item.name}</div>
                      {item.sku && <span className="text-[10px] opacity-70">SKU: {item.sku}</span>}
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.qty || 1}</td>
                    <td className="p-2.5 text-right">{currency} {Number(item.price || 0).toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold">{currency} {Number(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. FINANCIAL SUMMARY & TOTALS */}
        <div className="p-4 sm:p-6 bg-slate-500/5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h5 className="text-xs font-black uppercase text-amber-500 mb-2">Studio Terms & Conditions</h5>
            <p className="text-[11px] leading-relaxed opacity-80 whitespace-pre-line">
              {isStudio
                ? (settings.studioTerms || '1. 50% advance is mandatory on booking day.\n2. 80% payment must be cleared before the last day of the event.\n3. If you need Master Data inform at booking.\n4. Inform in advance for events outside Lahore.\n5. Footage kept for 10 days.')
                : (settings.shopTerms || 'Goods once sold are non-refundable without official receipt.')}
            </p>

            {invoice.notes && (
              <div className="mt-3 text-xs">
                <strong className="opacity-70">Special Instructions:</strong>
                <p className="italic opacity-80">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-500/10">
              <span className="opacity-70">{getLabel('subtotal', 'Subtotal')}:</span>
              <span className="font-bold">{currency} {subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-500/10 text-amber-500">
                <span>{getLabel('discount', 'Discount')}:</span>
                <span className="font-bold">-{currency} {discount.toLocaleString()}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-500/10">
                <span className="opacity-70">{getLabel('tax', 'Tax')}:</span>
                <span className="font-bold">+{currency} {tax.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b-2 border-amber-500/30 text-sm font-black">
              <span>{getLabel('grandTotal', 'GRAND TOTAL')}:</span>
              <span className="text-amber-400">{currency} {grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1 text-emerald-500 font-bold">
              <span>{getLabel('paidAmount', 'Paid / Advance')}:</span>
              <span>{currency} {paidAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1.5 text-sm font-black text-red-500 bg-red-500/10 px-2.5 rounded-lg border border-red-500/20">
              <span>{getLabel('balanceDue', 'BALANCE DUE')}:</span>
              <span>{currency} {balanceDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 5. Footer & Authorized Signatory */}
        {isVisible('showSignature', true) && (
          <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75">
            <div>
              <p className="font-bold">{businessName}</p>
              <p className="text-[10px] opacity-70">Computer Generated Official Invoice</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="w-40 border-b border-slate-400 dark:border-slate-600 mb-1"></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">{getLabel('authSignature', 'Authorized Signatory')}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
