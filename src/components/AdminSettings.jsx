import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  FileText,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Layers,
  Palette,
  Eye,
  Sliders,
  Bell,
  CreditCard,
  Download,
  Upload,
  RefreshCw,
  QrCode,
  Package,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Percent,
  Camera,
  Video,
  HardDrive,
  BookOpen,
  Zap
} from 'lucide-react';
import { INVOICE_THEMES, SOFTWARE_THEMES } from '../utils/themePresets';
import InvoiceThemeRenderer from './InvoiceThemeRenderer';
import { DEFAULT_INVOICE_EVENTS } from './InvoiceModal';

export default function AdminSettings({
  settings = {},
  onSaveSettings,
  onExportAllData,
  onImportAllData,
  onAddAuditLog,
  onNavigateTab,
  triggerAlert
}) {
  const [activeTab, setActiveTab] = useState('invoice_events'); // 'invoice_events' | 'themes' | 'general' | 'invoice_fields' | 'payment_bank' | 'shop' | 'security'

  // Software & Invoice Themes
  const [softwareTheme, setSoftwareTheme] = useState('dark_blue_gold');
  const [invoiceTheme, setInvoiceTheme] = useState('black_gold');

  // General Settings
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('Rs.');
  const [logoUrl, setLogoUrl] = useState('');

  // 1. INVOICE EVENTS CONFIGURATION
  const [eventsList, setEventsList] = useState(DEFAULT_INVOICE_EVENTS);
  const [newEventName, setNewEventName] = useState('');

  // 2. PRICING & QUANTITY LIMITS
  const [videoPrice, setVideoPrice] = useState('15000');
  const [videoMinQty, setVideoMinQty] = useState('0');
  const [videoMaxQty, setVideoMaxQty] = useState('3');

  const [photoPrice, setPhotoPrice] = useState('10000');
  const [photoMinQty, setPhotoMinQty] = useState('0');
  const [photoMaxQty, setPhotoMaxQty] = useState('3');

  const [dronePrice, setDronePrice] = useState('7000');
  const [femalePrice, setFemalePrice] = useState('8000');

  const [memory128Price, setMemory128Price] = useState('15000');
  const [memory128MinQty, setMemory128MinQty] = useState('0');
  const [memory128MaxQty, setMemory128MaxQty] = useState('10');

  const [indianAlbumPrice, setIndianAlbumPrice] = useState('12000');
  const [indianAlbumMinQty, setIndianAlbumMinQty] = useState('0');
  const [indianAlbumMaxQty, setIndianAlbumMaxQty] = useState('10');

  // 3. DISCOUNT FEATURE TOGGLE
  const [enableDiscount, setEnableDiscount] = useState(true);

  // Invoice Fields Visibility Toggles & Custom Labels
  const [showSku, setShowSku] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [showShipping, setShowShipping] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [showSignatureLine, setShowSignatureLine] = useState(true);
  const [showTerms, setShowTerms] = useState(true);

  // Custom Field Labels
  const [customInvoiceTitle, setCustomInvoiceTitle] = useState('OFFICIAL INVOICE');
  const [customClientDetailsLabel, setCustomClientDetailsLabel] = useState('Billed To / Customer Details');

  // Bank & Payment Details
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [mobileAccount, setMobileAccount] = useState('');

  // Shop Settings & Low Stock Threshold
  const [taxRate, setTaxRate] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [shopInvoicePrefix, setShopInvoicePrefix] = useState('SHP-');
  const [productCategories, setProductCategories] = useState('');
  const [shopTerms, setShopTerms] = useState('');

  // Studio Settings
  const [studioInvoicePrefix, setStudioInvoicePrefix] = useState('HADI-');
  const [studioTerms, setStudioTerms] = useState('');

  // Admin Account Settings
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    setSoftwareTheme(settings.softwareTheme || 'dark_blue_gold');
    setInvoiceTheme(settings.invoiceTheme || 'black_gold');

    setName(settings.name || 'Hadi Photo Studio & Events');
    setShopName(settings.shopName || 'Hadi Shop & Equipment');
    setContact(settings.contact || '0305-8304908');
    setEmail(settings.email || 'malikshahzadmehmood3934@gmail.com');
    setNotificationEmail(settings.notificationEmail || settings.email || 'malikshahzadmehmood3934@gmail.com');
    setAddress(settings.address || 'Gulgasht Colony, Multan / Lahore, Pakistan');
    setCurrency(settings.currency || 'Rs.');
    setLogoUrl(settings.logoUrl || '');

    // Events List
    if (settings.eventsList && Array.isArray(settings.eventsList) && settings.eventsList.length > 0) {
      setEventsList(settings.eventsList);
    } else {
      setEventsList(DEFAULT_INVOICE_EVENTS);
    }

    // Pricing & Quantities
    setVideoPrice(String(settings.videoPrice ?? settings.videoDefaultPrice ?? 15000));
    setVideoMinQty(String(settings.videoMinQty ?? 0));
    setVideoMaxQty(String(settings.videoMaxQty ?? 3));

    setPhotoPrice(String(settings.photoPrice ?? settings.photoDefaultPrice ?? 10000));
    setPhotoMinQty(String(settings.photoMinQty ?? 0));
    setPhotoMaxQty(String(settings.photoMaxQty ?? 3));

    setDronePrice(String(settings.dronePrice ?? settings.droneDefaultPrice ?? 7000));
    setFemalePrice(String(settings.femalePhotographerPrice ?? settings.femaleDefaultPrice ?? 8000));

    setMemory128Price(String(settings.memory128Price ?? 15000));
    setMemory128MinQty(String(settings.memory128MinQty ?? 0));
    setMemory128MaxQty(String(settings.memory128MaxQty ?? 10));

    setIndianAlbumPrice(String(settings.indianAlbumPrice ?? 12000));
    setIndianAlbumMinQty(String(settings.indianAlbumMinQty ?? 0));
    setIndianAlbumMaxQty(String(settings.indianAlbumMaxQty ?? 10));

    // Discount Toggle
    setEnableDiscount(settings.enableDiscount !== undefined ? settings.enableDiscount : (settings.showDiscount !== undefined ? settings.showDiscount : true));

    // Fields Visibility
    setShowSku(settings.showSku !== undefined ? settings.showSku : true);
    setShowTax(settings.showTax !== undefined ? settings.showTax : true);
    setShowShipping(settings.showShipping !== undefined ? settings.showShipping : true);
    setShowBankDetails(settings.showBankDetails !== undefined ? settings.showBankDetails : true);
    setShowQrCode(settings.showQrCode !== undefined ? settings.showQrCode : true);
    setShowSignatureLine(settings.showSignatureLine !== undefined ? settings.showSignatureLine : true);
    setShowTerms(settings.showTerms !== undefined ? settings.showTerms : true);

    // Custom Labels
    setCustomInvoiceTitle(settings.invoiceCustomLabels?.invoiceTitle || 'OFFICIAL INVOICE');
    setCustomClientDetailsLabel(settings.invoiceCustomLabels?.clientDetails || 'Billed To / Customer Details');

    // Bank Details
    setBankName(settings.bankName || 'Meezan Bank Ltd');
    setAccountTitle(settings.accountTitle || 'Malik Shahzad Mehmood');
    setAccountNumber(settings.accountNumber || '02910105830490');
    setIban(settings.iban || 'PK92MEZN0002910105830490');
    setMobileAccount(settings.mobileAccount || '0305-8304908 (JazzCash / EasyPaisa)');

    // Shop Settings
    setTaxRate(settings.taxRate !== undefined ? String(settings.taxRate) : '0');
    setLowStockThreshold(settings.lowStockThreshold !== undefined ? String(settings.lowStockThreshold) : '5');
    setShopInvoicePrefix(settings.shopInvoicePrefix || 'SHP-');
    setProductCategories(settings.productCategories || 'Cameras & Lenses, Lighting & Flash, Memory & Storage, Accessories, Frames & Albums, Printing Services');
    setShopTerms(settings.shopTerms || 'Goods once sold are non-refundable without official receipt.');

    // Studio Settings
    setStudioInvoicePrefix(settings.studioInvoicePrefix || 'HADI-');
    setStudioTerms(settings.studioTerms || `1. 50% advance is mandatory on booking day.\n2. 80% payment must be cleared before the last day of the event.\n3. If you need Master Data / Raw Data you must inform at the time of booking.\n4. Please inform in advance for events outside Lahore.\n5. In outdoor shoots, if the bride and groom do not attend, the payment will still be required in full.\n6. All footage will be deleted 10 days after the final video delivery.`);

    // Admin Credentials
    setAdminEmail(settings.adminEmail || 'malikshahzadmehmood3934@gmail.com');
    setAdminPass(settings.adminPass || 'admin@123');
  }, [settings]);

  // Event Order Handlers
  const handleMoveEvent = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= eventsList.length) return;
    const copy = [...eventsList];
    const item = copy[index];
    copy.splice(index, 1);
    copy.splice(targetIdx, 0, item);
    setEventsList(copy);
  };

  const handleToggleEventEnable = (index) => {
    const copy = [...eventsList];
    copy[index] = { ...copy[index], enabled: !copy[index].enabled };
    setEventsList(copy);
  };

  const handleEditEventName = (index, newName) => {
    const copy = [...eventsList];
    copy[index] = { ...copy[index], name: newName };
    setEventsList(copy);
  };

  const handleAddEvent = () => {
    if (!newEventName.trim()) return;
    const newId = `ev_custom_${Date.now()}`;
    const newEv = {
      id: newId,
      name: newEventName.trim(),
      enabled: true,
      isCustom: true
    };
    setEventsList([...eventsList, newEv]);
    setNewEventName('');
  };

  const handleDeleteEvent = (index) => {
    const ev = eventsList[index];
    if (ev.isDefault) {
      if (!window.confirm(`"${ev.name}" is a standard wedding event. Disable it instead of deleting?`)) {
        return;
      }
      handleToggleEventEnable(index);
      return;
    }
    const copy = [...eventsList];
    copy.splice(index, 1);
    setEventsList(copy);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const updated = {
      ...settings,
      softwareTheme,
      invoiceTheme,
      name,
      shopName,
      contact,
      email,
      notificationEmail,
      address,
      currency,
      logoUrl,

      // Events List
      eventsList,

      // Pricing & Quantities
      videoPrice: Number(videoPrice) || 15000,
      videoMinQty: Number(videoMinQty) || 0,
      videoMaxQty: Number(videoMaxQty) || 3,

      photoPrice: Number(photoPrice) || 10000,
      photoMinQty: Number(photoMinQty) || 0,
      photoMaxQty: Number(photoMaxQty) || 3,

      dronePrice: Number(dronePrice) || 7000,
      femalePhotographerPrice: Number(femalePrice) || 8000,

      memory128Price: Number(memory128Price) || 15000,
      memory128MinQty: Number(memory128MinQty) || 0,
      memory128MaxQty: Number(memory128MaxQty) || 10,

      indianAlbumPrice: Number(indianAlbumPrice) || 12000,
      indianAlbumMinQty: Number(indianAlbumMinQty) || 0,
      indianAlbumMaxQty: Number(indianAlbumMaxQty) || 10,

      // Discount Toggle
      enableDiscount,
      showDiscount: enableDiscount,

      // Visibility & Labels
      showSku,
      showTax,
      showShipping,
      showBankDetails,
      showQrCode,
      showSignatureLine,
      showTerms,
      invoiceCustomLabels: {
        ...(settings.invoiceCustomLabels || {}),
        invoiceTitle: customInvoiceTitle,
        clientDetails: customClientDetailsLabel
      },

      // Bank Details
      bankName,
      accountTitle,
      accountNumber,
      iban,
      mobileAccount,

      // Shop
      taxRate: Number(taxRate) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      shopInvoicePrefix,
      productCategories,
      shopTerms,

      // Studio
      studioInvoicePrefix,
      videoDefaultPrice: Number(videoPrice) || 15000,
      photoDefaultPrice: Number(photoPrice) || 10000,
      droneDefaultPrice: Number(dronePrice) || 7000,
      femaleDefaultPrice: Number(femalePrice) || 8000,
      studioTerms,

      // Security
      adminEmail,
      adminPass,
      updatedAt: new Date().toISOString()
    };

    onSaveSettings?.(updated);
    onAddAuditLog?.({
      action: 'Invoice & Studio Settings Configured',
      category: 'settings',
      user: 'Admin',
      details: `Admin updated events & service pricing: Video (Rs. ${videoPrice}), Photo (Rs. ${photoPrice}), Drone (Rs. ${dronePrice}), 128GB (Rs. ${memory128Price}), Indian Album (Rs. ${indianAlbumPrice}), Discount Enabled: ${enableDiscount}`,
      targetId: 'settings'
    });
    triggerAlert?.('Invoice & Event Settings saved and synced to Firestore successfully!');
  };

  // Generate Real-Time Live Preview Object
  const livePreviewInvoice = {
    invoiceNumber: 'HADI-SAMPLE-2026',
    date: new Date().toISOString().split('T')[0],
    customerName: 'Muhammad Bilal Khan (Live Preview)',
    customerPhone: '0300-1234567',
    customerEmail: 'customer.preview@example.com',
    customerAddress: 'Gulberg III, Lahore, Pakistan',
    venue: 'Pearl Continental Hotel, Grand Ballroom',
    city: 'Lahore',
    eventType: 'Barat Ceremony & Walima Reception',
    shift: 'Night',
    outOfLahore: false,
    
    // Breakdowns reflecting current state
    eventsBreakdown: eventsList
      .filter(e => e.enabled !== false)
      .slice(0, 3)
      .map((ev, i) => {
        const vQ = i === 0 ? 2 : 1;
        const pQ = 1;
        const dr = i === 0;
        const fp = i === 1;
        const vA = vQ * (Number(videoPrice) || 15000);
        const pA = pQ * (Number(photoPrice) || 10000);
        const dA = dr ? (Number(dronePrice) || 7000) : 0;
        const fA = fp ? (Number(femalePrice) || 8000) : 0;
        return {
          eventId: ev.id,
          eventName: ev.name,
          displayName: ev.name,
          selected: true,
          date: `2026-11-0${i + 4}`,
          shift: i % 2 === 0 ? 'Night' : 'Day',
          videoQty: vQ,
          videoAmount: vA,
          photoQty: pQ,
          photoAmount: pA,
          drone: dr,
          droneAmount: dA,
          femalePhotographer: fp,
          femalePhotographerAmount: fA,
          rowTotal: vA + pA + dA + fA
        };
      }),

    memory128Qty: 1,
    memory128Price: Number(memory128Price) || 15000,
    memory128Total: Number(memory128Price) || 15000,
    
    indianAlbumQty: 1,
    indianAlbumPrice: Number(indianAlbumPrice) || 12000,
    indianAlbumTotal: Number(indianAlbumPrice) || 12000,

    subtotal: 82000,
    discount: enableDiscount ? 2000 : 0,
    grandTotal: enableDiscount ? 80000 : 82000,
    advancePayment: 40000,
    paidAmount: 40000,
    remainingBalance: enableDiscount ? 40000 : 42000,
    balanceDue: enableDiscount ? 40000 : 42000,
    status: 'Partial',
    manualCameraNotes: 'Sony FX3 Cinema Setup with 35mm GM + 85mm GM Lenses'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-white">
      
      {/* HEADER & TOP CONTROLS */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>ADMIN SETTINGS & SYSTEM CONFIGURATION</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage Event Options, Live Service Pricing, Quantity Limits, Discount Permissions & Invoice Themes
          </p>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl cursor-pointer text-xs shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>SAVE ALL CHANGES</span>
        </button>
      </div>

      {/* TABS BAR */}
      <div className="flex bg-[#0f172a] border border-slate-800 p-1.5 rounded-xl gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onNavigateTab ? onNavigateTab('smart_dashboard') : setActiveTab('invoice_events')}
          className="px-4 py-2.5 rounded-lg font-black text-xs transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>SMART DASHBOARD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoice_events')}
          className={`px-4 py-2.5 rounded-lg font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoice_events' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>INVOICE & EVENT SETTINGS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'themes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>THEMES & LAYOUTS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'general' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>STUDIO & SHOP PROFILE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoice_fields')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoice_fields' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>FIELDS & VISIBILITY</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment_bank')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'payment_bank' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>BANK & ACCOUNTS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shop' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>SHOP CATALOG & ALERTS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'security' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>SECURITY & LOGIN</span>
        </button>
      </div>

      {/* TAB 1: INVOICE & EVENT SETTINGS (THE COMPREHENSIVE CONTROL HUB) */}
      {activeTab === 'invoice_events' && (
        <div className="space-y-6">
          
          {/* SECTION A: EVENT OPTIONS MANAGEMENT */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>1. Event Options in Invoice (Add, Edit, Reorder, Enable/Disable)</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Default Order: 1. Mayoon, 2. Nikkah, 3. Mehndi, 4. Barat, 5. Walima, 6. Other Event
                </p>
              </div>

              {/* Add New Event Input */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  placeholder="New Event Name (e.g. Qawwali Night)"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none w-full sm:w-60"
                />
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Events List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center">Order</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Event Name</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status</th>
                    <th className="py-2.5 px-3 w-36 text-center">Reorder</th>
                    <th className="py-2.5 px-3 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {eventsList.map((ev, idx) => (
                    <tr key={ev.id || idx} className={`transition-colors ${ev.enabled ? 'bg-slate-900/60' : 'bg-slate-950/40 opacity-50'}`}>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ev.name}
                          onChange={e => handleEditEventName(idx, e.target.value)}
                          className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1 text-white font-bold text-xs w-full max-w-sm outline-none"
                        />
                        {ev.isOther && (
                          <span className="ml-2 text-[10px] text-amber-400 italic">(Includes custom name field)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleEventEnable(idx)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            ev.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {ev.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveEvent(idx, -1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === eventsList.length - 1}
                            onClick={() => handleMoveEvent(idx, 1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(idx)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Delete / Disable Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION B: PRICING & QUANTITY LIMITS CONFIGURATION */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>2. Service Pricing & Quantity Limit Controls</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Video Camera */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Video Camera Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Default Price / Unit (Rs.)</label>
                  <input
                    type="number"
                    value={videoPrice}
                    onChange={e => setVideoPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">Min Qty</label>
                    <input
                      type="number"
                      value={videoMinQty}
                      onChange={e => setVideoMinQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Max Qty (e.g. 3)</label>
                    <input
                      type="number"
                      value={videoMaxQty}
                      onChange={e => setVideoMaxQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Camera */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Camera className="w-4 h-4 text-sky-400" />
                  <span>Photo Camera Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Default Price / Unit (Rs.)</label>
                  <input
                    type="number"
                    value={photoPrice}
                    onChange={e => setPhotoPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">Min Qty</label>
                    <input
                      type="number"
                      value={photoMinQty}
                      onChange={e => setPhotoMinQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Max Qty (e.g. 3)</label>
                    <input
                      type="number"
                      value={photoMaxQty}
                      onChange={e => setPhotoMaxQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Drone Camera */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Drone Camera Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Drone Price / Event (Rs.)</label>
                  <input
                    type="number"
                    value={dronePrice}
                    onChange={e => setDronePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Selector Mode: YES (Adds Rs. {dronePrice}) / NO (Adds Rs. 0)
                </p>
              </div>

              {/* Female Photographer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Female Photographer Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Female Photographer Price (Rs.)</label>
                  <input
                    type="number"
                    value={femalePrice}
                    onChange={e => setFemalePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Selector Mode: YES (Adds Rs. {femalePrice}) / NO (Adds Rs. 0)
                </p>
              </div>

              {/* 128 GB Memory Storage */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>128 GB Storage Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Price per 128 GB Card (Rs.)</label>
                  <input
                    type="number"
                    value={memory128Price}
                    onChange={e => setMemory128Price(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">Min Qty</label>
                    <input
                      type="number"
                      value={memory128MinQty}
                      onChange={e => setMemory128MinQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Max Qty (e.g. 10)</label>
                    <input
                      type="number"
                      value={memory128MaxQty}
                      onChange={e => setMemory128MaxQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Indian Album */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Indian Album Settings</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Price per Indian Album (Rs.)</label>
                  <input
                    type="number"
                    value={indianAlbumPrice}
                    onChange={e => setIndianAlbumPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">Min Qty</label>
                    <input
                      type="number"
                      value={indianAlbumMinQty}
                      onChange={e => setIndianAlbumMinQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Max Qty (e.g. 10)</label>
                    <input
                      type="number"
                      value={indianAlbumMaxQty}
                      onChange={e => setIndianAlbumMaxQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION C: GLOBAL DISCOUNT RULE & PERMISSION CONTROL */}
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  <span>3. Global Discount Feature Control & Strict Permissions</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>Security Directive:</strong> Customer and Staff invoice creation screens NEVER show the discount field or allow discount modification. Only Admin can enter discounts when this feature is enabled.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-700 shrink-0">
                <input
                  type="checkbox"
                  checked={enableDiscount}
                  onChange={e => setEnableDiscount(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-bold text-xs text-white">
                  {enableDiscount ? 'Discount Feature: ENABLED (Admin Only)' : 'Discount Feature: DISABLED GLOBALLY'}
                </span>
              </label>
            </div>
          </div>

          {/* SECTION D: REAL-TIME LIVE INVOICE PREVIEW */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>4. Real-Time Live Invoice Preview</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  See changes to event names, pricing, theme, and discount calculations update live
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                Live Interactive Mode
              </span>
            </div>

            <div className="bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <InvoiceThemeRenderer
                invoice={livePreviewInvoice}
                themeId={invoiceTheme}
                settings={{
                  ...settings,
                  name,
                  shopName,
                  contact,
                  email,
                  address,
                  currency,
                  studioTerms,
                  enableDiscount,
                  showDiscount: enableDiscount,
                  invoiceCustomLabels: {
                    invoiceTitle: customInvoiceTitle,
                    clientDetails: customClientDetailsLabel
                  }
                }}
                showActions={false}
                isLivePreview={true}
              />
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: THEMES & LAYOUTS */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {/* Software Global Theme */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
              Application UI Software Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {SOFTWARE_THEMES.map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSoftwareTheme(th.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    softwareTheme === th.id
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white text-xs">{th.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{th.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Document Layout Theme */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
              Invoice Document Style & Color Scheme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {INVOICE_THEMES.map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setInvoiceTheme(th.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    invoiceTheme === th.id
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white text-xs">{th.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{th.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDIO & SHOP PROFILE */}
      {activeTab === 'general' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
            Studio & Shop Official Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Official Event Studio Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Official Equipment Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Official Mobile / WhatsApp Number</label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Official Studio Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>Auto-Email Invoice Dispatch Address (Hadi Studio Recipient)</span>
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                placeholder="malikshahzadmehmood3934@gmail.com"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                placeholder="Rs."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Studio & Shop Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 4: FIELDS & VISIBILITY */}
      {activeTab === 'invoice_fields' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
            Invoice Field Labels & Optional Elements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Invoice Document Heading</label>
              <input
                type="text"
                value={customInvoiceTitle}
                onChange={e => setCustomInvoiceTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Customer Section Label</label>
              <input
                type="text"
                value={customClientDetailsLabel}
                onChange={e => setCustomClientDetailsLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input type="checkbox" checked={showBankDetails} onChange={e => setShowBankDetails(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-xs font-bold text-slate-300">Bank Details</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input type="checkbox" checked={showSignatureLine} onChange={e => setShowSignatureLine(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-xs font-bold text-slate-300">Signature Line</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input type="checkbox" checked={showTerms} onChange={e => setShowTerms(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-xs font-bold text-slate-300">Terms & Policy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
              <input type="checkbox" checked={showQrCode} onChange={e => setShowQrCode(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-xs font-bold text-slate-300">Payment QR Code</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: BANK & ACCOUNTS */}
      {activeTab === 'payment_bank' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
            Official Bank & Mobile Money Accounts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Official Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Account Title</label>
              <input
                type="text"
                value={accountTitle}
                onChange={e => setAccountTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">IBAN Number</label>
              <input
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Mobile Accounts (JazzCash / EasyPaisa)</label>
              <input
                type="text"
                value={mobileAccount}
                onChange={e => setMobileAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SHOP CATALOG & LOW STOCK ALERTS */}
      {activeTab === 'shop' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2">
            Shop Catalog & Low Stock Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Shop Invoice Number Prefix</label>
              <input
                type="text"
                value={shopInvoicePrefix}
                onChange={e => setShopInvoicePrefix(e.target.value)}
                placeholder="SHP-"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-bold mb-1">Low Stock Warning Threshold (Units)</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Product Categories (Comma-separated)</label>
            <input
              type="text"
              value={productCategories}
              onChange={e => setProductCategories(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Shop Invoice Terms / Return Policy</label>
            <textarea
              value={shopTerms}
              onChange={e => setShopTerms(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 7: ADMIN SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Admin Authentication Credentials (Email & Password)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Admin Login Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Admin Login Password</label>
              <input
                type="password"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
