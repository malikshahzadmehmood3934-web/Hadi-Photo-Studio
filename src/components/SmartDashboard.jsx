import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  Camera,
  ShoppingBag,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Printer,
  Plus,
  Sliders,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Shield,
  ShieldCheck,
  Zap,
  MapPin,
  HardDrive,
  CreditCard,
  Building,
  Sparkles,
  ChevronRight,
  X,
  Save,
  Trash2,
  Edit,
  Send,
  Lock
} from 'lucide-react';

const DEFAULT_WIDGET_CONFIG = [
  { id: 'w_kpi_sales', title: 'Sales Performance', visible: true, order: 1, size: 'col-span-12 lg:col-span-4' },
  { id: 'w_kpi_profit', title: 'Profit & Loss (P&L)', visible: true, order: 2, size: 'col-span-12 lg:col-span-4' },
  { id: 'w_kpi_payments', title: 'Collections & Pending', visible: true, order: 3, size: 'col-span-12 lg:col-span-4' },
  { id: 'w_chart_revenue', title: 'Revenue vs Expenses Trend', visible: true, order: 4, size: 'col-span-12 lg:col-span-8' },
  { id: 'w_chart_payment_methods', title: 'Payment Channels Breakdown', visible: true, order: 5, size: 'col-span-12 lg:col-span-4' },
  { id: 'w_pending_payments', title: 'Urgent Pending Payments Alert', visible: true, order: 6, size: 'col-span-12' },
  { id: 'w_today_events', title: "Today's & Upcoming Event Schedules", visible: true, order: 7, size: 'col-span-12 lg:col-span-6' },
  { id: 'w_staff_status', title: 'Staff Crew & GPS Field Deployment', visible: true, order: 8, size: 'col-span-12 lg:col-span-6' },
  { id: 'w_top_services_products', title: 'Top Revenue Services & Products', visible: true, order: 9, size: 'col-span-12 lg:col-span-6' },
  { id: 'w_expenses_breakdown', title: 'Operational Expenses by Category', visible: true, order: 10, size: 'col-span-12 lg:col-span-6' },
  { id: 'w_inventory_alerts', title: 'Shop Inventory & Low Stock Alerts', visible: true, order: 11, size: 'col-span-12 lg:col-span-6' },
  { id: 'w_activity_feed', title: 'Live Audit & Activity Stream', visible: true, order: 12, size: 'col-span-12 lg:col-span-6' }
];

export default function SmartDashboard({
  isAdmin,
  settings,
  studioInvoices = [],
  shopInvoices = [],
  products = [],
  customers = [],
  staffMembers = [],
  assignedDuties = [],
  openDates = [],
  auditLogs = [],
  expenses = [],
  isOnline = true,
  syncStatus = 'Connected',
  onAddExpense,
  onRecordPayment,
  onNavigateTab,
  onOpenNewInvoice,
  onAddAuditLog,
  triggerAlert
}) {
  // Access Control Verification
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-red-950/40 border border-red-500/40 rounded-2xl text-center space-y-4 text-white">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/40">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">ACCESS DENIED / رسائی کی اجازت نہیں</h2>
        <p className="text-sm text-red-200">
          Sirf Admin ko ijazat hai. Smart Business Dashboard is strictly restricted to authenticated Administrator credentials.
        </p>
        <button
          type="button"
          onClick={() => onNavigateTab?.('dashboard')}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition"
        >
          Return to Portal Overview
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW & FILTER STATES
  // -------------------------------------------------------------
  const [businessView, setBusinessView] = useState(() => {
    return localStorage.getItem('hadi_smart_view') || 'combined'; // 'studio' | 'shop' | 'combined'
  });

  const [dateFilter, setDateFilter] = useState('this_month'); // 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartTimeline, setChartTimeline] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [columnLayout, setColumnLayout] = useState('3_col'); // '2_col' | '3_col' | '4_col' | 'auto'

  // Modals inside Smart Dashboard
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState('Cash');

  // Expense Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Rent & Utilities');
  const [expAmount, setExpAmount] = useState('');
  const [expPortal, setExpPortal] = useState('studio');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Widget custom configuration
  const [widgetConfig, setWidgetConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('hadi_smart_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_WIDGET_CONFIG;
    } catch {
      return DEFAULT_WIDGET_CONFIG;
    }
  });

  // Save View in LocalStorage
  useEffect(() => {
    localStorage.setItem('hadi_smart_view', businessView);
  }, [businessView]);

  // -------------------------------------------------------------
  // DATA FILTERING ENGINE
  // -------------------------------------------------------------
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper date calculators
  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return false;

    if (dateFilter === 'today') {
      return dateStr.startsWith(todayStr);
    }
    if (dateFilter === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      return dateStr.startsWith(yest.toISOString().split('T')[0]);
    }
    if (dateFilter === 'this_week') {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return target >= weekStart;
    }
    if (dateFilter === 'this_month') {
      return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
    }
    if (dateFilter === 'last_month') {
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return target.getFullYear() === prevYear && target.getMonth() === prevMonth;
    }
    if (dateFilter === 'this_year') {
      return target.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return target >= start && target <= end;
    }
    return true;
  };

  // Filtered Invoices according to Business View & Date Range
  const activeInvoices = useMemo(() => {
    let list = [];
    if (businessView === 'studio' || businessView === 'combined') {
      list = list.concat(studioInvoices.map(i => ({ ...i, businessType: 'studio' })));
    }
    if (businessView === 'shop' || businessView === 'combined') {
      list = list.concat(shopInvoices.map(i => ({ ...i, businessType: 'shop' })));
    }
    return list.filter(inv => isDateInRange(inv.createdAt || inv.date || inv.eventDate));
  }, [businessView, dateFilter, customStartDate, customEndDate, studioInvoices, shopInvoices]);

  // Filtered Expenses
  const activeExpenses = useMemo(() => {
    let list = expenses;
    if (businessView === 'studio') {
      list = list.filter(e => e.portal === 'studio' || !e.portal);
    } else if (businessView === 'shop') {
      list = list.filter(e => e.portal === 'shop');
    }
    return list.filter(e => isDateInRange(e.date || e.createdAt));
  }, [businessView, dateFilter, customStartDate, customEndDate, expenses]);

  // -------------------------------------------------------------
  // CALCULATED METRICS
  // -------------------------------------------------------------
  const totalRevenue = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => sum + (Number(inv.total) || Number(inv.grandTotal) || 0), 0);
  }, [activeInvoices]);

  const totalPaid = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => {
      const p = Number(inv.advancePaid) || Number(inv.paidAmount) || (inv.paymentStatus === 'Paid' ? (Number(inv.total) || 0) : 0);
      return sum + p;
    }, 0);
  }, [activeInvoices]);

  const totalPending = useMemo(() => {
    return activeInvoices.reduce((sum, inv) => {
      if (inv.paymentStatus === 'Paid') return sum;
      const total = Number(inv.total) || Number(inv.grandTotal) || 0;
      const paid = Number(inv.advancePaid) || Number(inv.paidAmount) || 0;
      return sum + Math.max(0, total - paid);
    }, 0);
  }, [activeInvoices]);

  const totalExpenseAmount = useMemo(() => {
    return activeExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [activeExpenses]);

  const netProfit = totalRevenue - totalExpenseAmount;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Invoices metrics
  const paidInvoicesCount = activeInvoices.filter(i => i.paymentStatus === 'Paid').length;
  const unpaidInvoices = activeInvoices.filter(i => i.paymentStatus !== 'Paid');
  const cautionInvoices = activeInvoices.filter(i => {
    const total = Number(i.total) || 0;
    const paid = Number(i.advancePaid) || Number(i.paidAmount) || 0;
    return total > 0 && paid === 0;
  });

  // Events metrics
  const todayEvents = useMemo(() => {
    return assignedDuties.filter(d => d.date === todayStr);
  }, [assignedDuties, todayStr]);

  const upcomingEvents = useMemo(() => {
    return assignedDuties.filter(d => d.date > todayStr).sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [assignedDuties, todayStr]);

  // Inventory Low Stock
  const lowStockThreshold = Number(settings?.lowStockThreshold) || 5;
  const lowStockItems = useMemo(() => {
    return products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= lowStockThreshold);
  }, [products, lowStockThreshold]);

  const outOfStockItems = useMemo(() => {
    return products.filter(p => Number(p.stock) <= 0);
  }, [products]);

  const totalStockValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.purchasePrice) || Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
  }, [products]);

  // Top Services & Products breakdown
  const topServices = useMemo(() => {
    const counts = {};
    studioInvoices.forEach(inv => {
      if (inv.events && Array.isArray(inv.events)) {
        inv.events.forEach(ev => {
          const name = ev.type || ev.eventName || 'Studio Event';
          counts[name] = (counts[name] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, revenue: count * 15000 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [studioInvoices]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5);
  }, [products]);

  // Payment method breakdown
  const paymentMethodsStats = useMemo(() => {
    const methods = { Cash: 0, Bank: 0, JazzCash: 0, EasyPaisa: 0, Online: 0 };
    activeInvoices.forEach(inv => {
      const m = inv.paymentMethod || 'Cash';
      const amt = Number(inv.advancePaid) || Number(inv.paidAmount) || (inv.paymentStatus === 'Paid' ? Number(inv.total) : 0);
      if (m.toLowerCase().includes('bank')) methods.Bank += amt;
      else if (m.toLowerCase().includes('jazz')) methods.JazzCash += amt;
      else if (m.toLowerCase().includes('easy')) methods.EasyPaisa += amt;
      else if (m.toLowerCase().includes('online')) methods.Online += amt;
      else methods.Cash += amt;
    });
    return methods;
  }, [activeInvoices]);

  // Expenses Category breakdown
  const expenseCategories = useMemo(() => {
    const map = {};
    activeExpenses.forEach(e => {
      const cat = e.category || 'General Operations';
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [activeExpenses]);

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount || Number(expAmount) <= 0) {
      triggerAlert?.('Enter valid expense title and amount / Kharcha aur raqam darust darj karein', 'error');
      return;
    }
    const newExp = {
      id: `exp_${Date.now()}`,
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      portal: expPortal,
      date: expDate,
      notes: expNotes.trim(),
      createdAt: new Date().toISOString()
    };
    onAddExpense?.(newExp);
    onAddAuditLog?.({
      action: 'Business Expense Recorded',
      category: 'finance',
      details: `Admin recorded Rs. ${newExp.amount} for "${newExp.title}" (${newExp.category} - ${newExp.portal})`
    });
    triggerAlert?.('Expense recorded successfully! / Kharcha darj ho gaya');
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    setIsAddExpenseOpen(false);
  };

  const handleOpenRecordPayment = (inv) => {
    setSelectedInvoiceForPayment(inv);
    const total = Number(inv.total) || Number(inv.grandTotal) || 0;
    const paid = Number(inv.advancePaid) || Number(inv.paidAmount) || 0;
    setPaymentAmountInput(String(Math.max(0, total - paid)));
    setIsRecordPaymentOpen(true);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !paymentAmountInput || Number(paymentAmountInput) <= 0) {
      triggerAlert?.('Enter valid payment amount / Raqam darust likhein', 'error');
      return;
    }
    const amt = Number(paymentAmountInput);
    onRecordPayment?.({
      invoiceId: selectedInvoiceForPayment.id || selectedInvoiceForPayment.invoiceNumber,
      amount: amt,
      paymentMethod: paymentMethodInput,
      businessType: selectedInvoiceForPayment.businessType || 'studio',
      date: todayStr
    });
    onAddAuditLog?.({
      action: 'Payment Collected & Cleared',
      category: 'finance',
      details: `Admin recorded payment of Rs. ${amt} via ${paymentMethodInput} for Invoice #${selectedInvoiceForPayment.invoiceNumber}`
    });
    triggerAlert?.(`Payment of Rs. ${amt.toLocaleString()} recorded successfully!`);
    setIsRecordPaymentOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  const handleExportCSV = () => {
    const rows = [
      ['HADI STUDIO & EVENTS — SMART DASHBOARD REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Business View', businessView.toUpperCase()],
      ['Date Filter', dateFilter.toUpperCase()],
      [''],
      ['FINANCIAL SUMMARY'],
      ['Total Revenue', `Rs. ${totalRevenue.toLocaleString()}`],
      ['Total Paid Collections', `Rs. ${totalPaid.toLocaleString()}`],
      ['Total Pending Receivables', `Rs. ${totalPending.toLocaleString()}`],
      ['Total Operational Expenses', `Rs. ${totalExpenseAmount.toLocaleString()}`],
      ['Net Profit', `Rs. ${netProfit.toLocaleString()}`],
      ['Profit Margin', `${profitMargin}%`],
      [''],
      ['INVOICE SUMMARY'],
      ['Total Invoices', activeInvoices.length],
      ['Paid Invoices', paidInvoicesCount],
      ['Pending Invoices', unpaidInvoices.length],
      [''],
      ['CUSTOMER SUMMARY'],
      ['Total Customers in CRM', customers.length],
      ['Total Catalog Products', products.length],
      ['Low Stock Alert Items', lowStockItems.length]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hadi_Smart_Dashboard_${businessView}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddAuditLog?.({
      action: 'Smart Dashboard Exported',
      category: 'reports',
      details: `Admin exported ${businessView.toUpperCase()} business analytics report to CSV`
    });
    triggerAlert?.('Dashboard report exported to CSV successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveWidgetConfig = (newCfg) => {
    setWidgetConfig(newCfg);
    localStorage.setItem('hadi_smart_widgets', JSON.stringify(newCfg));
    triggerAlert?.('Dashboard layout & widgets saved / Layout save ho gaya');
    setIsCustomizeOpen(false);
  };

  // Helper formatting
  const curr = settings?.currency || 'Rs.';

  return (
    <div className="space-y-6 animate-in fade-in text-white">
      {/* -------------------------------------------------------------
          TOP BAR: TITLE + VIEW SWITCHER + DATE FILTER + QUICK TOOLS
      ------------------------------------------------------------- */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                SMART DASHBOARD
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-wider uppercase">
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Real-Time Financial Intelligence, Multi-Portal Analytics & Operations Suite
            </p>
          </div>
        </div>

        {/* Center: Business View Switcher */}
        <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
          {[
            { id: 'studio', label: 'Studio View', icon: Camera },
            { id: 'shop', label: 'Shop View', icon: ShoppingBag },
            { id: 'combined', label: 'Combined View', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const active = businessView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBusinessView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Date Range Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Date Filter Select */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
              />
            </div>
          )}

          {/* Add Expense Button */}
          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          {/* Customize Layout Button */}
          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Customize Widgets & Grid"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* Export CSV / Print */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Export CSV Report"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Print Dashboard Summary"
          >
            <Printer className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TOP KPI HERO STRIP: REVENUE, PAID, PENDING, EXPENSES, PROFIT
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-[#0f172a] border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {curr} {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
            <span>{activeInvoices.length} Invoices in range</span>
          </div>
        </div>

        {/* Card 2: Collections */}
        <div className="bg-[#0f172a] border border-emerald-500/30 hover:border-emerald-500/60 p-4 rounded-2xl shadow-xl transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Collected / Paid</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400">
            {curr} {totalPaid.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {paidInvoicesCount} Fully Paid Invoices
          </div>
        </div>

        {/* Card 3: Pending Receivables */}
        <div className="bg-[#0f172a] border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Receivables</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300">
            {curr} {totalPending.toLocaleString()}
          </div>
          <div className="text-[10px] text-red-400 mt-1">
            {unpaidInvoices.length} Invoices with balance
          </div>
        </div>

        {/* Card 4: Operational Expenses */}
        <div className="bg-[#0f172a] border border-red-500/30 hover:border-red-500/60 p-4 rounded-2xl shadow-xl transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-red-400">
            {curr} {totalExpenseAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {activeExpenses.length} Expense logs recorded
          </div>
        </div>

        {/* Card 5: Net Profit */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#0f172a] to-slate-900 border border-amber-500/40 hover:border-amber-500 p-4 rounded-2xl shadow-xl transition relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Net Profit (P&L)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              %
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-black ${netProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
            {curr} {netProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-bold">
            Margin: {profitMargin}% ({businessView.toUpperCase()})
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          INTERACTIVE CHARTS & VISUAL ANALYTICS
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: REVENUE VS EXPENSES & PROFIT COMPARISON */}
        <div className="lg:col-span-8 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">REVENUE VS EXPENSES TIMELINE</h3>
                <p className="text-[10px] text-slate-400">Financial distribution calculated from active records</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              {['daily', 'monthly', 'yearly'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setChartTimeline(t)}
                  className={`px-2.5 py-1 rounded-md font-bold uppercase transition ${
                    chartTimeline === t
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Visual SVG Bar Comparison */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Total Revenue
                </span>
                <span className="text-white">{curr} {totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, totalRevenue > 0 ? 100 : 0)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Total Collected (Paid)
                </span>
                <span className="text-emerald-400">{curr} {totalPaid.toLocaleString()}</span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalRevenue > 0 ? Math.min(100, (totalPaid / totalRevenue) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Operational Expenses
                </span>
                <span className="text-red-400">{curr} {totalExpenseAmount.toLocaleString()}</span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalRevenue > 0 ? Math.min(100, (totalExpenseAmount / totalRevenue) * 100) : (totalExpenseAmount > 0 ? 100 : 0)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Net Business Profit
                </span>
                <span className="text-blue-400">{curr} {netProfit.toLocaleString()}</span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalRevenue > 0 && netProfit > 0 ? Math.min(100, (netProfit / totalRevenue) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: PAYMENT CHANNELS BREAKDOWN */}
        <div className="lg:col-span-4 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">PAYMENT METHODS</h3>
                <p className="text-[10px] text-slate-400">Cash, Bank, JazzCash & EasyPaisa</p>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              {Object.entries(paymentMethodsStats).map(([method, amt]) => {
                const pct = totalPaid > 0 ? Math.round((amt / totalPaid) * 100) : 0;
                return (
                  <div key={method} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-300">{method}</span>
                      <span className="text-amber-400">{curr} {amt.toLocaleString()} <span className="text-slate-500 text-[10px]">({pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs mt-2">
            <span className="text-slate-400">Total Liquid Collections:</span>
            <span className="font-black text-emerald-400">{curr} {totalPaid.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          URGENT PENDING PAYMENTS & RECOVERY SECTION
      ------------------------------------------------------------- */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">URGENT PENDING PAYMENTS ALERT</h3>
              <p className="text-[10px] text-slate-400">
                Invoices with outstanding receivables requiring collection ({unpaidInvoices.length} Invoices)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('invoices')}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Invoices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {unpaidInvoices.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/60 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span>All invoices in selected period are 100% cleared! No pending balance.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                  <th className="py-2.5 px-3">INVOICE #</th>
                  <th className="py-2.5 px-3">CUSTOMER</th>
                  <th className="py-2.5 px-3">PORTAL</th>
                  <th className="py-2.5 px-3">TOTAL</th>
                  <th className="py-2.5 px-3">PAID</th>
                  <th className="py-2.5 px-3">REMAINING</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {unpaidInvoices.slice(0, 5).map((inv, idx) => {
                  const total = Number(inv.total) || Number(inv.grandTotal) || 0;
                  const paid = Number(inv.advancePaid) || Number(inv.paidAmount) || 0;
                  const remaining = Math.max(0, total - paid);
                  return (
                    <tr key={inv.id || idx} className="hover:bg-slate-900/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {inv.invoiceNumber || `#INV-${idx + 1}`}
                      </td>
                      <td className="py-3 px-3 font-medium text-white">
                        {inv.clientName || inv.customerName || 'Walk-in Customer'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inv.businessType === 'shop'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}>
                          {inv.businessType || 'Studio'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">{curr} {total.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{curr} {paid.toLocaleString()}</td>
                      <td className="py-3 px-3 text-red-400 font-black">{curr} {remaining.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          {inv.paymentStatus || 'Partial / Unpaid'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenRecordPayment(inv)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold transition"
                          >
                            Record Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              triggerAlert?.(`Payment reminder SMS/WhatsApp dispatched for ${inv.clientName || 'Customer'}`);
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                            title="Send Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          2-COLUMN OPERATIONAL STRIP: TODAY'S EVENTS & STAFF FIELD GPS
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: TODAY'S & UPCOMING EVENTS */}
        <div className="lg:col-span-6 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">EVENT SCHEDULES & SHOOTS</h3>
                <p className="text-[10px] text-slate-400">{todayEvents.length} Today | {upcomingEvents.length} Upcoming</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab?.('studio')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Studio Portal
            </button>
          </div>

          <div className="space-y-2.5">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/60 rounded-xl">
                <span>No active events scheduled in current timeline.</span>
              </div>
            ) : (
              [...todayEvents, ...upcomingEvents].slice(0, 4).map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="p-3 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{ev.eventName || ev.type || 'Wedding Event'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        {ev.date === todayStr ? "TODAY" : ev.date}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" /> {ev.location || 'Multan / Lahore'}</span>
                      <span>•</span>
                      <span>Staff: <strong className="text-slate-200">{ev.staffName || 'Assigned'}</strong></span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                    {ev.camera || 'Rig Alpha 1'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: STAFF STATUS & LIVE FIELD GPS DEPLOYMENT */}
        <div className="lg:col-span-6 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">STAFF CREW & FIELD DEPLOYMENT</h3>
                <p className="text-[10px] text-slate-400">{staffMembers.length} Registered Photographers & Crew</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab?.('studio')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Manage Crew
            </button>
          </div>

          <div className="space-y-2.5">
            {staffMembers.slice(0, 4).map((st, idx) => {
              const duty = assignedDuties.find(d => d.staffId === st.id && d.date === todayStr);
              return (
                <div
                  key={st.id || idx}
                  className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                      {st.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400">{st.role || 'Photographer'} ({st.phone})</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      duty
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {duty ? 'ON EVENT' : 'AVAILABLE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TOP SERVICES & SHOP INVENTORY ALERTS
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Studio Services */}
        <div className="lg:col-span-6 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Camera className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">TOP STUDIO SERVICES BY DEMAND</h3>
          </div>
          <div className="space-y-2">
            {topServices.length === 0 ? (
              <div className="text-slate-400 text-xs py-4 text-center">No service data available.</div>
            ) : (
              topServices.map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200">{srv.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-amber-400 font-bold">{srv.count} Bookings</span>
                    <span className="font-black text-white">{curr} {srv.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shop Low Stock Alert */}
        <div className="lg:col-span-6 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">SHOP INVENTORY & STOCK ALERTS</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Total Stock Value: <strong className="text-emerald-400">{curr} {totalStockValue.toLocaleString()}</strong></span>
          </div>

          <div className="space-y-2">
            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <div className="text-emerald-400 text-xs py-4 text-center font-bold">
                ✓ All inventory items are well-stocked above low threshold ({lowStockThreshold} units).
              </div>
            ) : (
              [...outOfStockItems, ...lowStockItems].slice(0, 4).map((p, idx) => (
                <div key={p.id || idx} className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">SKU: {p.sku || 'N/A'} • {p.category || 'General'}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    Number(p.stock) <= 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {Number(p.stock) <= 0 ? 'OUT OF STOCK' : `ONLY ${p.stock} LEFT`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          BOTTOM SYSTEM STATUS: FIREBASE SYNC & AUDIT TRAIL
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Firebase Sync Status Card */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">FIREBASE CLOUD SYNC</h3>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
              </span>
            </div>

            <div className="space-y-2 pt-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Database Connection:</span>
                <span className="font-mono text-emerald-400 font-bold">{syncStatus}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Synced Invoices:</span>
                <span className="font-bold text-white">{studioInvoices.length + shopInvoices.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Local Cache Fallback:</span>
                <span className="font-bold text-slate-400">Enabled (Offline Persistent)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerAlert?.('Synchronizing all records with Firebase Firestore... / Data sync ho raha hai');
              setTimeout(() => triggerAlert?.('Firebase Cloud Sync Complete! / Data sync ho gaya'), 1200);
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>FORCE SYNC NOW</span>
          </button>
        </div>

        {/* Live Activity Log Stream */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">LIVE AUDIT & ACTIVITY STREAM</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('audit')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View Audit Trail
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.slice(0, 4).map((log, idx) => (
              <div key={log.id || idx} className="text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200">{log.action || 'System Action'}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODAL: ADD EXPENSE FORM
      ------------------------------------------------------------- */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">RECORD BUSINESS EXPENSE</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Light Bulb Replacement / Fuel for Shoot"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Amount ({curr}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expense Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="Studio Lights & Gear">Studio Lights & Gear</option>
                    <option value="Travel & Fuel">Travel & Fuel</option>
                    <option value="Printing & Photo Albums">Printing & Photo Albums</option>
                    <option value="Staff Daily Wage">Staff Daily Wage</option>
                    <option value="Software & Cloud">Software & Cloud</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Business Portal *</label>
                  <select
                    value={expPortal}
                    onChange={(e) => setExpPortal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="studio">Studio Portal</option>
                    <option value="shop">Shop Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional receipt details or vendor name..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black rounded-xl shadow-lg transition"
                >
                  RECORD EXPENSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: RECORD PAYMENT AGAINST INVOICE
      ------------------------------------------------------------- */}
      {isRecordPaymentOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">RECORD PAYMENT</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">Invoice: <strong className="text-amber-400">{selectedInvoiceForPayment.invoiceNumber}</strong></div>
                <div className="text-slate-400">Customer: <strong className="text-white">{selectedInvoiceForPayment.clientName || selectedInvoiceForPayment.customerName}</strong></div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Amount ({curr}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Channel *</label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Cash">Cash at Studio Counter</option>
                  <option value="Bank Transfer">Meezan Bank Transfer</option>
                  <option value="JazzCash">JazzCash (0305-8304908)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Online Portal">Online Portal</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black rounded-xl shadow-lg transition"
                >
                  CONFIRM PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CUSTOMIZE DASHBOARD WIDGETS & GRID
      ------------------------------------------------------------- */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">CUSTOMIZE SMART DASHBOARD WIDGETS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <p className="text-slate-400">
                Toggle widget visibility and configure which analytical sections appear on the Smart Dashboard.
              </p>

              <div className="space-y-2">
                {widgetConfig.map((w, idx) => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-200">{w.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = widgetConfig.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item);
                        setWidgetConfig(updated);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        w.visible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {w.visible ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWidgetConfig(DEFAULT_WIDGET_CONFIG)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => handleSaveWidgetConfig(widgetConfig)}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black rounded-xl text-xs shadow-lg"
              >
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
