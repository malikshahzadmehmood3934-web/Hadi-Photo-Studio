import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Camera,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function ReportsSection({
  shopInvoices = [],
  shopProducts = [],
  shopCustomers = [],
  studioInvoices = [],
  studioDuties = [],
  triggerAlert
}) {
  const [reportType, setReportType] = useState('shop'); // 'shop' | 'studio'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Date filtering helper
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return true;
    if (dateFilter === 'all') return true;

    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo && itemDate <= now;
    }
    if (dateFilter === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom') {
      if (startDate && new Date(dateStr) < new Date(startDate)) return false;
      if (endDate && new Date(dateStr) > new Date(endDate + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  // Filtered Shop Invoices
  const filteredShopInvoices = useMemo(() => {
    return shopInvoices.filter(inv => isWithinDateRange(inv.date || inv.createdAt));
  }, [shopInvoices, dateFilter, startDate, endDate]);

  // Filtered Studio Invoices
  const filteredStudioInvoices = useMemo(() => {
    return studioInvoices.filter(inv => isWithinDateRange(inv.eventDate || inv.createdAt));
  }, [studioInvoices, dateFilter, startDate, endDate]);

  // Shop Financial Calculations
  const shopStats = useMemo(() => {
    let totalSales = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalCost = 0;

    filteredShopInvoices.forEach(inv => {
      totalSales += Number(inv.grandTotal) || 0;
      totalPaid += Number(inv.paidAmount) || 0;
      totalPending += Number(inv.balanceDue) || 0;

      // Estimate item costs
      if (inv.items) {
        inv.items.forEach(it => {
          const prod = shopProducts.find(p => p.id === it.productId);
          const cost = prod ? (Number(prod.purchasePrice) || 0) : ((Number(it.price) || 0) * 0.7);
          totalCost += cost * (Number(it.qty) || 1);
        });
      }
    });

    const grossProfit = totalSales - totalCost;
    const totalInventoryValue = shopProducts.reduce((sum, p) => sum + ((Number(p.salePrice) || 0) * (Number(p.stock) || 0)), 0);
    const totalStockUnits = shopProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

    return {
      totalSales,
      totalPaid,
      totalPending,
      totalCost,
      grossProfit,
      totalInventoryValue,
      totalStockUnits,
      invoiceCount: filteredShopInvoices.length
    };
  }, [filteredShopInvoices, shopProducts]);

  // Studio Financial Calculations
  const studioStats = useMemo(() => {
    let totalBookingsAmount = 0;
    let totalAdvance = 0;
    let totalRemaining = 0;
    let completedCount = 0;
    let pendingCount = 0;

    filteredStudioInvoices.forEach(inv => {
      totalBookingsAmount += Number(inv.grandTotal) || 0;
      totalAdvance += Number(inv.advancePayment) || 0;
      totalRemaining += Number(inv.remainingBalance) || 0;

      if (inv.status === 'Paid') completedCount++;
      else pendingCount++;
    });

    return {
      totalBookingsAmount,
      totalAdvance,
      totalRemaining,
      totalEvents: filteredStudioInvoices.length,
      completedCount,
      pendingCount
    };
  }, [filteredStudioInvoices]);

  // CSV Export
  const exportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      if (reportType === 'shop') {
        csvContent += "Invoice #,Customer,Date,Subtotal,Discount,Grand Total,Paid,Balance Due,Status\n";
        filteredShopInvoices.forEach(inv => {
          csvContent += `"${inv.invoiceNumber || inv.id}","${inv.customerName || 'Walk-in'}","${inv.date || ''}",${inv.subtotal || 0},${inv.discountAmount || 0},${inv.grandTotal || 0},${inv.paidAmount || 0},${inv.balanceDue || 0},"${inv.status || 'Pending'}"\n`;
        });
      } else {
        csvContent += "Invoice ID,Customer,Event Type,Event Date,Venue,City,Grand Total,Advance Paid,Remaining Due,Status\n";
        filteredStudioInvoices.forEach(inv => {
          csvContent += `"${inv.id}","${inv.clientName || 'N/A'}","${inv.eventType || 'N/A'}","${inv.eventDate || ''}","${inv.venue || 'N/A'}","${inv.city || 'Lahore'}",${inv.grandTotal || 0},${inv.advancePayment || 0},${inv.remainingBalance || 0},"${inv.status || 'Pending'}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Hadi_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerAlert?.('Report exported to CSV successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* HEADER & PORTAL SELECTOR */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>ANALYTICS & FINANCIAL REPORTS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit sales revenue, gross profits, advance collections, pending receivables & inventory</p>
        </div>

        {/* Portal Switcher & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setReportType('shop')}
              className={`px-3.5 py-1.5 rounded-lg font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
                reportType === 'shop' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Reports</span>
            </button>
            <button
              type="button"
              onClick={() => setReportType('studio')}
              className={`px-3.5 py-1.5 rounded-lg font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
                reportType === 'studio' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Studio Reports</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* DATE FILTERS BAR */}
      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Period:</span>
          </span>
          {['all', 'today', 'week', 'month', 'custom'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                dateFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'week' ? 'Last 7 Days' : f === 'month' ? 'This Month' : 'Custom'}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white outline-none"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white outline-none"
            />
          </div>
        )}
      </div>

      {/* 1. SHOP REPORTS DASHBOARD */}
      {reportType === 'shop' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#0f172a] border border-amber-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Total Shop Sales</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">Rs. {shopStats.totalSales.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">{shopStats.invoiceCount} Invoices generated</span>
            </div>

            <div className="bg-[#0f172a] border border-emerald-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Paid Revenue</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">Rs. {shopStats.totalPaid.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-300/80 mt-1 block">Received into accounts</span>
            </div>

            <div className="bg-[#0f172a] border border-red-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Pending Receivables</span>
              <span className="text-xl font-black text-red-400 mt-1 block">Rs. {shopStats.totalPending.toLocaleString()}</span>
              <span className="text-[10px] text-red-300/80 mt-1 block">Uncollected balances</span>
            </div>

            <div className="bg-[#0f172a] border border-blue-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Gross Estimated Profit</span>
              <span className="text-xl font-black text-blue-400 mt-1 block">Rs. {shopStats.grossProfit.toLocaleString()}</span>
              <span className="text-[10px] text-blue-300/80 mt-1 block">Sales minus product costs</span>
            </div>
          </div>

          {/* Shop Invoices Breakdown Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white">Sales & Invoices Detail</h3>
              <span className="text-slate-400">{filteredShopInvoices.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Subtotal</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredShopInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-bold text-amber-400">#{inv.invoiceNumber || inv.id?.slice(0, 8)}</td>
                      <td className="py-3 px-4">{inv.date || 'N/A'}</td>
                      <td className="py-3 px-4 text-white font-medium">{inv.customerName}</td>
                      <td className="py-3 px-4">Rs. {(inv.subtotal || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-400">Rs. {(inv.discountAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-white">Rs. {(inv.grandTotal || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">Rs. {(inv.paidAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-red-400">Rs. {(inv.balanceDue || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {inv.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. HADI STUDIO REPORTS DASHBOARD */}
      {reportType === 'studio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#0f172a] border border-amber-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Total Event Bookings</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">Rs. {studioStats.totalBookingsAmount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">{studioStats.totalEvents} Events booked</span>
            </div>

            <div className="bg-[#0f172a] border border-emerald-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Total Advance Collected</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">Rs. {studioStats.totalAdvance.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-300/80 mt-1 block">Booking advances in hand</span>
            </div>

            <div className="bg-[#0f172a] border border-red-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Pending Event Receivables</span>
              <span className="text-xl font-black text-red-400 mt-1 block">Rs. {studioStats.totalRemaining.toLocaleString()}</span>
              <span className="text-[10px] text-red-300/80 mt-1 block">Due on event dates</span>
            </div>

            <div className="bg-[#0f172a] border border-purple-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-slate-400 font-bold block text-[11px]">Completed Shoot Events</span>
              <span className="text-xl font-black text-purple-400 mt-1 block">{studioStats.completedCount}</span>
              <span className="text-[10px] text-purple-300/80 mt-1 block">{studioStats.pendingCount} in progress</span>
            </div>
          </div>

          {/* Studio Invoices Detail */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white">Event Bookings & Financial Breakdown</h3>
              <span className="text-slate-400">{filteredStudioInvoices.length} Events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Venue & City</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Advance Paid</th>
                    <th className="py-3 px-4">Remaining Due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredStudioInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-bold text-amber-400">{inv.eventDate || 'N/A'}</td>
                      <td className="py-3 px-4 text-white font-medium">{inv.clientName}</td>
                      <td className="py-3 px-4">{inv.eventType} ({inv.shift || 'Night'})</td>
                      <td className="py-3 px-4 text-slate-400">{inv.venue}, {inv.city}</td>
                      <td className="py-3 px-4 font-black text-white">Rs. {(inv.grandTotal || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">Rs. {(inv.advancePayment || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-red-400">Rs. {(inv.remainingBalance || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {inv.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
