import React, { useState, useMemo } from 'react';
import {
  Package,
  Users,
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  DollarSign,
  Tag,
  ShoppingBag,
  ArrowUpDown,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Save,
  Check,
  Percent,
  Send,
  Lock,
  Unlock,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import InvoiceThemeRenderer from './InvoiceThemeRenderer';
import SendEmailModal from './SendEmailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ShopManagement({
  products = [],
  customers = [],
  invoices = [],
  settings = {},
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSaveInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onSendToStudioTransfer,
  onAddAuditLog,
  triggerAlert
}) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'products' | 'customers' | 'stock_report' | 'create_invoice'

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All'); // 'All' | 'Low' | 'Out' | 'In'

  // Modals & Editing states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Send to Studio Transfer Modal
  const [transferConfirmInvoice, setTransferConfirmInvoice] = useState(null);

  // Send to Email Modal
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);

  // Delete Confirmation Modal
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, type: '', item: null, name: '' });

  // Admin Override Modal for Locked Invoices
  const [overrideModalInvoice, setOverrideModalInvoice] = useState(null);
  const [overrideCustName, setOverrideCustName] = useState('');
  const [overrideCustPhone, setOverrideCustPhone] = useState('');
  const [overrideCustEmail, setOverrideCustEmail] = useState('');
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideGrandTotal, setOverrideGrandTotal] = useState('');
  const [overridePaidAmount, setOverridePaidAmount] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');

  // Product Form state
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState('Cameras & Lenses');
  const [pPurchasePrice, setPPurchasePrice] = useState('');
  const [pSalePrice, setPSalePrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pUnit, setPUnit] = useState('Pcs');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');

  // Customer Form state
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cNotes, setCNotes] = useState('');

  // Create / Edit Invoice State
  const [invCustomer, setInvCustomer] = useState('');
  const [invCustName, setInvCustName] = useState('');
  const [invCustPhone, setInvCustPhone] = useState('');
  const [invCustEmail, setInvCustEmail] = useState('');
  const [invCustAddress, setInvCustAddress] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invItems, setInvItems] = useState([
    { id: 'item_1', productId: '', name: '', sku: '', qty: 1, price: 0, total: 0 }
  ]);
  const [invDiscountType, setInvDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [invDiscountVal, setInvDiscountVal] = useState(0);
  const [invTaxPercent, setInvTaxPercent] = useState(0);
  const [invShipping, setInvShipping] = useState(0);
  const [invPaid, setInvPaid] = useState(0);
  const [invNotes, setInvNotes] = useState('');
  const [invStatus, setInvStatus] = useState('Pending');

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = ['All', 'Cameras & Lenses', 'Lighting & Flash', 'Memory & Storage', 'Accessories', 'Frames & Albums', 'Printing Services', 'Electronics', 'General'];
    const customCats = settings.productCategories ? settings.productCategories.split(',').map(c => c.trim()).filter(Boolean) : [];
    return Array.from(new Set([...defaultCats, ...customCats]));
  }, [settings.productCategories]);

  // Low stock threshold from settings (default: 5)
  const lowStockThreshold = Number(settings.lowStockThreshold) || 5;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.category || '').toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      return (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
             (c.phone || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
             (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
             (c.address || '').toLowerCase().includes(customerSearch.toLowerCase());
    });
  }, [customers, customerSearch]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = (inv.invoiceNumber || inv.id || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.customerName || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.customerPhone || '').toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          (inv.date || '').toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  // Real-time Stock Report Calculations (Calculates sold units from all invoices)
  const stockReportData = useMemo(() => {
    // Map sold qty for each product id or name
    const soldMap = {};
    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const pKey = item.productId || item.name;
        if (pKey) {
          soldMap[pKey] = (soldMap[pKey] || 0) + (Number(item.qty) || 0);
        }
      });
    });

    return products.map(prod => {
      const initialStock = Number(prod.stock) || 0;
      const soldQty = soldMap[prod.id] || soldMap[prod.name] || 0;
      const remainingStock = Math.max(0, initialStock - soldQty);
      const purchasePrice = Number(prod.purchasePrice) || 0;
      const salePrice = Number(prod.salePrice) || 0;
      const totalStockValuation = remainingStock * salePrice;

      let status = 'In Stock';
      if (remainingStock <= 0) status = 'Out of Stock';
      else if (remainingStock <= lowStockThreshold) status = 'Low Stock';

      return {
        ...prod,
        initialStock,
        soldQty,
        remainingStock,
        purchasePrice,
        salePrice,
        totalStockValuation,
        stockStatus: status
      };
    });
  }, [products, invoices, lowStockThreshold]);

  // Filtered Stock Report
  const filteredStockReport = useMemo(() => {
    return stockReportData.filter(item => {
      const matchSearch = (item.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (item.sku || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                          (item.category || '').toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCategoryFilter === 'All' || item.category === productCategoryFilter;
      
      let matchStockStatus = true;
      if (stockStatusFilter === 'Low') matchStockStatus = item.stockStatus === 'Low Stock';
      else if (stockStatusFilter === 'Out') matchStockStatus = item.stockStatus === 'Out of Stock';
      else if (stockStatusFilter === 'In') matchStockStatus = item.stockStatus === 'In Stock';

      return matchSearch && matchCat && matchStockStatus;
    });
  }, [stockReportData, productSearch, productCategoryFilter, stockStatusFilter]);

  // Calculations for Create Invoice
  const itemsSubtotal = useMemo(() => {
    return invItems.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [invItems]);

  const discountAmount = useMemo(() => {
    const val = Number(invDiscountVal) || 0;
    if (invDiscountType === 'percent') {
      return Math.round((itemsSubtotal * val) / 100);
    }
    return val;
  }, [itemsSubtotal, invDiscountVal, invDiscountType]);

  const taxAmount = useMemo(() => {
    const taxRate = Number(invTaxPercent) || 0;
    const taxable = Math.max(0, itemsSubtotal - discountAmount);
    return Math.round((taxable * taxRate) / 100);
  }, [itemsSubtotal, discountAmount, invTaxPercent]);

  const grandTotal = useMemo(() => {
    const shipping = Number(invShipping) || 0;
    return Math.max(0, itemsSubtotal - discountAmount + taxAmount + shipping);
  }, [itemsSubtotal, discountAmount, taxAmount, invShipping]);

  const balanceDue = useMemo(() => {
    const paid = Number(invPaid) || 0;
    return Math.max(0, grandTotal - paid);
  }, [grandTotal, invPaid]);

  // Handlers for Products
  const openAddProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setPCategory('Cameras & Lenses');
    setPPurchasePrice('');
    setPSalePrice('');
    setPStock('10');
    setPUnit('Pcs');
    setPDesc('');
    setPImage('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setPName(prod.name || '');
    setPSku(prod.sku || '');
    setPCategory(prod.category || 'General');
    setPPurchasePrice(prod.purchasePrice !== undefined ? String(prod.purchasePrice) : '');
    setPSalePrice(prod.salePrice !== undefined ? String(prod.salePrice) : '');
    setPStock(prod.stock !== undefined ? String(prod.stock) : '0');
    setPUnit(prod.unit || 'Pcs');
    setPDesc(prod.description || '');
    setPImage(prod.image || '');
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!pName) {
      triggerAlert?.('Product name is required', 'error');
      return;
    }

    const prodData = {
      name: pName,
      sku: pSku || `SKU-${Date.now().toString().slice(-4)}`,
      category: pCategory,
      purchasePrice: Number(pPurchasePrice) || 0,
      salePrice: Number(pSalePrice) || 0,
      stock: Number(pStock) || 0,
      unit: pUnit,
      description: pDesc,
      image: pImage,
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      onUpdateProduct?.(editingProduct.id, prodData);
      onAddAuditLog?.({
        action: 'Product Updated',
        category: 'product',
        user: 'Admin',
        details: `Product "${pName}" (${prodData.sku}) updated. Stock: ${prodData.stock}, Price: Rs. ${prodData.salePrice}`,
        targetId: editingProduct.id
      });
      triggerAlert?.('Product updated successfully!');
    } else {
      onAddProduct?.(prodData);
      onAddAuditLog?.({
        action: 'Product Added',
        category: 'product',
        user: 'Admin',
        details: `New Product "${pName}" (${prodData.sku}) created with stock ${prodData.stock}`,
        targetId: prodData.sku
      });
      triggerAlert?.('Product added successfully!');
    }
    setIsProductModalOpen(false);
  };

  // Handlers for Customers
  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setCName('');
    setCEmail('');
    setCPhone('');
    setCAddress('');
    setCNotes('');
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (cust) => {
    setEditingCustomer(cust);
    setCName(cust.name || '');
    setCEmail(cust.email || '');
    setCPhone(cust.phone || '');
    setCAddress(cust.address || '');
    setCNotes(cust.notes || '');
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!cName) {
      triggerAlert?.('Customer name is required', 'error');
      return;
    }

    const custData = {
      name: cName,
      email: cEmail,
      phone: cPhone,
      address: cAddress,
      notes: cNotes,
      updatedAt: new Date().toISOString()
    };

    if (editingCustomer) {
      onUpdateCustomer?.(editingCustomer.id, custData);
      onAddAuditLog?.({
        action: 'Customer Updated',
        category: 'customer',
        user: 'Admin',
        details: `Customer details updated for "${cName}" (${cPhone})`,
        targetId: editingCustomer.id
      });
      triggerAlert?.('Customer updated successfully!');
    } else {
      onAddCustomer?.(custData);
      onAddAuditLog?.({
        action: 'Customer Added',
        category: 'customer',
        user: 'Admin',
        details: `New customer "${cName}" (${cPhone}) enrolled into database`,
        targetId: cPhone
      });
      triggerAlert?.('Customer added successfully!');
    }
    setIsCustomerModalOpen(false);
  };

  // Invoice Items Management
  const handleAddItem = () => {
    setInvItems(prev => [
      ...prev,
      { id: `item_${Date.now()}_${Math.random()}`, productId: '', name: '', sku: '', qty: 1, price: 0, total: 0 }
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (invItems.length <= 1) {
      triggerAlert?.('Invoice must have at least one line item', 'error');
      return;
    }
    setInvItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemProductSelect = (idx, prodId) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setInvItems(prev => {
      const copy = [...prev];
      const qty = copy[idx]?.qty || 1;
      const price = prod.salePrice || 0;
      copy[idx] = {
        ...copy[idx],
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        price: price,
        qty: qty,
        total: qty * price
      };
      return copy;
    });
  };

  const handleItemFieldChange = (idx, field, val) => {
    setInvItems(prev => {
      const copy = [...prev];
      const current = { ...copy[idx], [field]: val };
      const qty = Number(current.qty) || 0;
      const price = Number(current.price) || 0;
      current.total = qty * price;
      copy[idx] = current;
      return copy;
    });
  };

  const handleCustomerSelectForInvoice = (custId) => {
    setInvCustomer(custId);
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setInvCustName(cust.name || '');
      setInvCustPhone(cust.phone || '');
      setInvCustEmail(cust.email || '');
      setInvCustAddress(cust.address || '');
    }
  };

  const openCreateInvoiceTab = () => {
    setEditingInvoice(null);
    setInvCustomer('');
    setInvCustName('');
    setInvCustPhone('');
    setInvCustEmail('');
    setInvCustAddress('');
    setInvDate(new Date().toISOString().split('T')[0]);
    setInvItems([{ id: 'item_1', productId: '', name: '', sku: '', qty: 1, price: 0, total: 0 }]);
    setInvDiscountType('fixed');
    setInvDiscountVal(0);
    setInvTaxPercent(0);
    setInvShipping(0);
    setInvPaid(0);
    setInvNotes('');
    setInvStatus('Pending');
    setActiveTab('create_invoice');
  };

  const openEditInvoiceTab = (inv) => {
    if (inv.locked || inv.status === 'SENT TO HADI STUDIO – LOCKED') {
      triggerAlert?.('This invoice is locked and was transferred to Hadi Studio. Use Admin Override to modify.', 'error');
      openOverrideModal(inv);
      return;
    }

    setEditingInvoice(inv);
    setInvCustomer(inv.customerId || '');
    setInvCustName(inv.customerName || '');
    setInvCustPhone(inv.customerPhone || '');
    setInvCustEmail(inv.customerEmail || '');
    setInvCustAddress(inv.customerAddress || '');
    setInvDate(inv.date || new Date().toISOString().split('T')[0]);
    setInvItems(inv.items && inv.items.length > 0 ? inv.items : [{ id: 'item_1', productId: '', name: '', sku: '', qty: 1, price: 0, total: 0 }]);
    setInvDiscountType(inv.discountType || 'fixed');
    setInvDiscountVal(inv.discountValue || 0);
    setInvTaxPercent(inv.taxPercent || 0);
    setInvShipping(inv.shipping || 0);
    setInvPaid(inv.paidAmount || 0);
    setInvNotes(inv.notes || '');
    setInvStatus(inv.status || 'Pending');
    setActiveTab('create_invoice');
  };

  const handleDuplicateInvoice = (inv) => {
    setEditingInvoice(null);
    setInvCustomer(inv.customerId || '');
    setInvCustName(inv.customerName || '');
    setInvCustPhone(inv.customerPhone || '');
    setInvCustEmail(inv.customerEmail || '');
    setInvCustAddress(inv.customerAddress || '');
    setInvDate(new Date().toISOString().split('T')[0]);
    setInvItems(inv.items ? inv.items.map(i => ({ ...i, id: `copy_${Math.random()}` })) : []);
    setInvDiscountType(inv.discountType || 'fixed');
    setInvDiscountVal(inv.discountValue || 0);
    setInvTaxPercent(inv.taxPercent || 0);
    setInvShipping(inv.shipping || 0);
    setInvPaid(0);
    setInvNotes(`Duplicated from #${inv.invoiceNumber || inv.id}`);
    setInvStatus('Pending');
    setActiveTab('create_invoice');
    triggerAlert?.('Invoice duplicated into draft!');
  };

  const handleSaveShopInvoice = (e) => {
    e.preventDefault();
    if (!invCustName) {
      triggerAlert?.('Customer name is required', 'error');
      return;
    }
    if (invItems.length === 0 || !invItems[0].name) {
      triggerAlert?.('Add at least one item with a valid name', 'error');
      return;
    }

    const calculatedStatus = balanceDue <= 0 && grandTotal > 0 ? 'Paid' : (Number(invPaid) > 0 ? 'Partial' : 'Pending');

    const invoiceData = {
      invoiceNumber: editingInvoice?.invoiceNumber || `${settings.shopInvoicePrefix || 'SHP-'}${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: invCustomer,
      customerName: invCustName,
      customerPhone: invCustPhone,
      customerEmail: invCustEmail,
      customerAddress: invCustAddress,
      date: invDate,
      items: invItems,
      subtotal: itemsSubtotal,
      discountType: invDiscountType,
      discountValue: Number(invDiscountVal) || 0,
      discountAmount: discountAmount,
      taxPercent: Number(invTaxPercent) || 0,
      taxAmount: taxAmount,
      shipping: Number(invShipping) || 0,
      grandTotal: grandTotal,
      paidAmount: Number(invPaid) || 0,
      balanceDue: balanceDue,
      notes: invNotes,
      status: calculatedStatus,
      updatedAt: new Date().toISOString(),
      ...(!editingInvoice ? { createdAt: new Date().toISOString() } : {})
    };

    if (editingInvoice) {
      onUpdateInvoice?.(editingInvoice.id, invoiceData);
      onAddAuditLog?.({
        action: 'Shop Invoice Updated',
        category: 'invoice',
        user: 'Admin',
        details: `Shop Invoice #${invoiceData.invoiceNumber} updated for ${invoiceData.customerName}. Total: Rs. ${grandTotal}`,
        targetId: editingInvoice.id
      });
      triggerAlert?.('Shop Invoice updated successfully!');
    } else {
      onSaveInvoice?.(invoiceData);
      onAddAuditLog?.({
        action: 'Shop Invoice Created',
        category: 'invoice',
        user: 'Admin',
        details: `Shop Invoice #${invoiceData.invoiceNumber} created for ${invoiceData.customerName}. Total: Rs. ${grandTotal}`,
        targetId: invoiceData.invoiceNumber
      });
      triggerAlert?.('Shop Invoice created successfully!');
    }

    setActiveTab('invoices');
  };

  // -------------------------------------------------------------
  // SEND TO HADI STUDIO & LOCKING WORKFLOW
  // -------------------------------------------------------------
  const handleConfirmSendToStudio = () => {
    if (!transferConfirmInvoice) return;
    const inv = transferConfirmInvoice;

    onSendToStudioTransfer?.(inv);
    setTransferConfirmInvoice(null);
  };

  // -------------------------------------------------------------
  // ADMIN OVERRIDE CONTROLS FOR TRANSFERRED/LOCKED INVOICES
  // -------------------------------------------------------------
  const openOverrideModal = (inv) => {
    setOverrideModalInvoice(inv);
    setOverrideCustName(inv.customerName || inv.clientName || '');
    setOverrideCustPhone(inv.customerPhone || inv.clientPhone || '');
    setOverrideCustEmail(inv.customerEmail || inv.clientEmail || '');
    setOverrideDate(inv.date || inv.eventDate || new Date().toISOString().split('T')[0]);
    setOverrideGrandTotal(String(inv.grandTotal || inv.total || '0'));
    setOverridePaidAmount(String(inv.paidAmount !== undefined ? inv.paidAmount : (inv.advancePayment || '0')));
    setOverrideNotes(inv.notes || '');
  };

  const handleSaveAdminOverride = (e) => {
    e.preventDefault();
    if (!overrideModalInvoice) return;

    const totalNum = Number(overrideGrandTotal) || 0;
    const paidNum = Number(overridePaidAmount) || 0;
    const balanceNum = Math.max(0, totalNum - paidNum);

    const updated = {
      ...overrideModalInvoice,
      customerName: overrideCustName,
      customerPhone: overrideCustPhone,
      customerEmail: overrideCustEmail,
      date: overrideDate,
      grandTotal: totalNum,
      paidAmount: paidNum,
      balanceDue: balanceNum,
      notes: overrideNotes,
      status: balanceNum <= 0 && totalNum > 0 ? 'Paid' : (paidNum > 0 ? 'Partial' : 'Pending'),
      overrideAt: new Date().toISOString(),
      overrideBy: 'Admin (Malik Shahzad)'
    };

    onUpdateInvoice?.(overrideModalInvoice.id, updated);
    onAddAuditLog?.({
      action: 'Admin Override Executed',
      category: 'override',
      user: 'Admin (Malik Shahzad)',
      details: `Admin modified locked Invoice #${overrideModalInvoice.invoiceNumber || overrideModalInvoice.id}: Customer: "${overrideCustName}", Total: Rs. ${totalNum}, Balance: Rs. ${balanceNum}`,
      targetId: overrideModalInvoice.id
    });

    triggerAlert?.('Admin override successfully saved!');
    setOverrideModalInvoice(null);
  };

  const handleUnlockInvoice = (inv) => {
    const updated = {
      ...inv,
      locked: false,
      status: inv.paidAmount >= inv.grandTotal ? 'Paid' : 'Pending',
      unlockedAt: new Date().toISOString(),
      unlockedBy: 'Admin (Malik Shahzad)'
    };
    onUpdateInvoice?.(inv.id, updated);
    onAddAuditLog?.({
      action: 'Invoice Unlocked & Restored',
      category: 'override',
      user: 'Admin',
      details: `Invoice #${inv.invoiceNumber || inv.id} unlocked by Admin and restored to editable Shop status.`,
      targetId: inv.id
    });
    triggerAlert?.('Invoice unlocked and restored to Shop Management!');
    setOverrideModalInvoice(null);
  };

  // -------------------------------------------------------------
  // STOCK REPORT EXPORT (PDF & CSV)
  // -------------------------------------------------------------
  const handleExportStockCSV = () => {
    if (filteredStockReport.length === 0) {
      triggerAlert?.('No stock records to export', 'error');
      return;
    }

    const headers = ['Product Name', 'SKU', 'Category', 'Initial Stock', 'Sold Qty', 'Remaining Stock', 'Purchase Price (Rs)', 'Sale Price (Rs)', 'Valuation (Rs)', 'Status'];
    const rows = filteredStockReport.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      p.initialStock,
      p.soldQty,
      p.remainingStock,
      p.purchasePrice,
      p.salePrice,
      p.totalStockValuation,
      `"${p.stockStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hadi_shop_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerAlert?.('Stock report exported to CSV successfully!');
  };

  const handleExportStockPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    let y = 14;

    // Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 269, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.text(settings.shopName || settings.name || 'HADI SHOP & STUDIO', 20, y + 9);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL INVENTORY & STOCK VALUATION REPORT', 20, y + 15);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated: ${new Date().toLocaleString()} | Filter: ${productCategoryFilter} (${stockStatusFilter})`, 280, y + 12, { align: 'right' });

    y += 26;

    // Table Header
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 269, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('PRODUCT NAME', 18, y + 5);
    doc.text('SKU', 85, y + 5);
    doc.text('CATEGORY', 125, y + 5);
    doc.text('INITIAL', 165, y + 5, { align: 'center' });
    doc.text('SOLD', 185, y + 5, { align: 'center' });
    doc.text('REMAINING', 210, y + 5, { align: 'center' });
    doc.text('SALE PRICE', 240, y + 5, { align: 'right' });
    doc.text('VALUATION', 280, y + 5, { align: 'right' });

    y += 7.5;
    doc.setFont('helvetica', 'normal');

    let totalValuation = 0;
    let totalRemainingUnits = 0;

    filteredStockReport.forEach((p, idx) => {
      totalValuation += p.totalStockValuation;
      totalRemainingUnits += p.remainingStock;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 269, 6.5, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.text(String(p.name).slice(0, 36), 18, y + 4.5);
      doc.text(String(p.sku), 85, y + 4.5);
      doc.text(String(p.category || 'General').slice(0, 20), 125, y + 4.5);
      doc.text(String(p.initialStock), 165, y + 4.5, { align: 'center' });
      doc.text(String(p.soldQty), 185, y + 4.5, { align: 'center' });

      // Highlight low stock or out of stock
      if (p.remainingStock <= 0) {
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
      } else if (p.remainingStock <= lowStockThreshold) {
        doc.setTextColor(217, 119, 6);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(16, 185, 129);
      }

      doc.text(`${p.remainingStock} ${p.unit || 'Pcs'}`, 210, y + 4.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`Rs. ${p.salePrice.toLocaleString()}`, 240, y + 4.5, { align: 'right' });
      doc.text(`Rs. ${p.totalStockValuation.toLocaleString()}`, 280, y + 4.5, { align: 'right' });

      y += 6.5;

      if (y > 185) {
        doc.addPage('l', 'mm', 'a4');
        y = 15;
      }
    });

    // Summary Total
    y += 5;
    doc.setFillColor(15, 23, 42);
    doc.rect(170, y, 113, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Total Remaining Units: ${totalRemainingUnits}`, 175, y + 6);
    doc.text(`Total Stock Valuation: Rs. ${totalValuation.toLocaleString()}`, 175, y + 11);

    doc.save(`Hadi_Shop_Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    triggerAlert?.('Stock report PDF downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* SHOP MANAGEMENT TOP BAR */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>SHOP & INVENTORY MANAGEMENT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage Commercial Inventory, Invoices, Customers & Real-time Stock Valuation</p>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stock_report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stock_report'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Stock Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            type="button"
            onClick={openCreateInvoiceTab}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE INVOICE</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVOICES LIST (WITH 6 ACTION BUTTONS) */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                placeholder="Search invoices by invoice #, customer name, phone, date..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={invoiceStatusFilter}
                onChange={e => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
                <option value="SENT TO HADI STUDIO – LOCKED">Transferred & Locked</option>
              </select>

              <button
                type="button"
                onClick={openCreateInvoiceTab}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice # & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Paid / Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action Buttons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No shop invoices found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isLocked = inv.locked || inv.status === 'SENT TO HADI STUDIO – LOCKED';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                              <span>#{inv.invoiceNumber || inv.id?.slice(0, 8)}</span>
                              {isLocked && <Lock className="w-3 h-3 text-purple-400" title="Locked (Transferred to Studio)" />}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{inv.date || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{inv.customerName || 'Walk-in Customer'}</div>
                            <div className="text-[11px] text-slate-400">{inv.customerPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-300">
                              {inv.items ? `${inv.items.length} item(s)` : '0 items'}
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {inv.items?.map(i => i.name).filter(Boolean).join(', ') || '-'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-black text-white text-sm">
                            Rs. {(inv.grandTotal || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-emerald-400 font-bold">Paid: Rs. {(inv.paidAmount || 0).toLocaleString()}</div>
                            <div className="text-amber-400 font-bold">Due: Rs. {(inv.balanceDue || 0).toLocaleString()}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isLocked ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Transferred & Locked
                              </span>
                            ) : (
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                inv.status === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : inv.status === 'Partial'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {inv.status || 'Pending'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {/* 6 ACTION BUTTONS: VIEW, EDIT, SEND TO STUDIO, SEND TO EMAIL, DOWNLOAD, PRINT */}
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              
                              {/* 1. VIEW INVOICE */}
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                                title="1. View Invoice"
                              >
                                <Eye className="w-3 h-3 text-sky-400" />
                                <span className="hidden xl:inline">View</span>
                              </button>

                              {/* 2. EDIT INVOICE (or Admin Override if locked) */}
                              <button
                                type="button"
                                onClick={() => openEditInvoiceTab(inv)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                  isLocked
                                    ? 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-500/30'
                                    : 'bg-slate-800 hover:bg-blue-600/30 text-blue-400 border-slate-700'
                                }`}
                                title={isLocked ? "Invoice Locked (Click for Admin Override)" : "2. Edit Invoice"}
                              >
                                {isLocked ? <Lock className="w-3 h-3 text-purple-400" /> : <Edit2 className="w-3 h-3" />}
                                <span className="hidden xl:inline">{isLocked ? 'Override' : 'Edit'}</span>
                              </button>

                              {/* 3. SEND TO HADI STUDIO */}
                              {!isLocked ? (
                                <button
                                  type="button"
                                  onClick={() => setTransferConfirmInvoice(inv)}
                                  className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                  title="3. Send to Hadi Studio (Locks invoice in Shop)"
                                >
                                  <Send className="w-3 h-3 text-purple-400" />
                                  <span className="hidden xl:inline">Send Studio</span>
                                </button>
                              ) : (
                                <span className="px-2 py-1 bg-slate-900 text-slate-500 border border-slate-800 rounded-lg text-[10px] font-bold">
                                  In Studio
                                </span>
                              )}

                              {/* 4. SEND TO EMAIL */}
                              <button
                                type="button"
                                onClick={() => setEmailModalInvoice(inv)}
                                className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="4. Send to Email"
                              >
                                <Mail className="w-3 h-3 text-emerald-400" />
                                <span className="hidden xl:inline">Email</span>
                              </button>

                              {/* 5. DOWNLOAD INVOICE */}
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1.5 bg-slate-800 hover:bg-amber-600/20 text-amber-400 rounded-lg transition-colors cursor-pointer border border-slate-700"
                                title="5. Download Invoice PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* 6. PRINT INVOICE */}
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1.5 bg-slate-800 hover:bg-sky-600/20 text-sky-400 rounded-lg transition-colors cursor-pointer border border-slate-700"
                                title="6. Print Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Control */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteModalState({
                                    isOpen: true,
                                    type: 'Invoice',
                                    item: inv,
                                    name: `Invoice #${inv.invoiceNumber || inv.id} (${inv.customerName})`
                                  });
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-slate-700"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

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
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Controls */}
          <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by name, SKU, category..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-amber-400 outline-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={openAddProductModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Products Grid / Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Purchase Price</th>
                    <th className="py-3 px-4">Sale Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No products found in catalog.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5">{p.sku}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
                          Rs. {(p.purchasePrice || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-black text-amber-400 text-sm">
                          Rs. {(p.salePrice || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            (p.stock || 0) <= 2
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : (p.stock || 0) <= lowStockThreshold
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {p.stock || 0} {p.unit || 'Pcs'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteModalState({
                                  isOpen: true,
                                  type: 'Product',
                                  item: p,
                                  name: `${p.name} (${p.sku})`
                                });
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
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

      {/* TAB 3: REAL-TIME STOCK REPORT & VALUATION */}
      {activeTab === 'stock_report' && (
        <div className="space-y-4">
          
          {/* Stock Report Header Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Automated Stock & Valuation Report</h3>
                <p className="text-xs text-slate-400">Live reconciliation of initial stock vs invoiced sales with threshold alerts</p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportStockCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Excel / CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportStockPDF}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Sheet</span>
              </button>
            </div>
          </div>

          {/* Filters & Status Pills */}
          <div className="bg-[#0f172a] border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold mr-1">Status Filter:</span>
              {[
                { id: 'All', label: 'All Products' },
                { id: 'Low', label: `Low Stock (≤ ${lowStockThreshold})` },
                { id: 'Out', label: 'Out of Stock' },
                { id: 'In', label: 'In Stock' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStockStatusFilter(s.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    stockStatusFilter === s.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-amber-400 outline-none text-xs"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Initial Stock</th>
                    <th className="py-3 px-4 text-center">Total Sold</th>
                    <th className="py-3 px-4 text-center">Remaining Stock</th>
                    <th className="py-3 px-4 text-right">Sale Price</th>
                    <th className="py-3 px-4 text-right">Stock Valuation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredStockReport.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No products match the selected stock criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStockReport.map(item => (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-amber-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{item.category}</td>
                        <td className="py-3.5 px-4 text-center font-bold">{item.initialStock} {item.unit}</td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-bold">{item.soldQty} {item.unit}</td>
                        <td className="py-3.5 px-4 text-center font-black text-sm">
                          {item.remainingStock} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">Rs. {item.salePrice.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-black text-amber-400">
                          Rs. {item.totalStockValuation.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.stockStatus === 'In Stock'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.stockStatus === 'Low Stock'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {item.stockStatus}
                          </span>
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

      {/* TAB 4: CUSTOMERS LIST */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, phone, email, address..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={openAddCustomerModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Physical Address</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
                        <p>No customer profiles found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white text-sm">{c.name}</td>
                        <td className="py-3.5 px-4 text-amber-400 font-medium">{c.phone || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-400">{c.email || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-400">{c.address || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCustomerModal(c)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Customer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteModalState({
                                  isOpen: true,
                                  type: 'Customer',
                                  item: c,
                                  name: `${c.name} (${c.phone})`
                                });
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Customer"
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

      {/* TAB 5: CREATE / EDIT INVOICE FORM */}
      {activeTab === 'create_invoice' && (
        <form onSubmit={handleSaveShopInvoice} className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white">
                {editingInvoice ? `Edit Shop Invoice #${editingInvoice.invoiceNumber || editingInvoice.id}` : 'Create Commercial Shop Invoice'}
              </h3>
              <p className="text-xs text-slate-400">Point of Sale commercial billing & receipt generation</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel & Return
            </button>
          </div>

          {/* Customer Selection & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Quick Select Saved Customer</label>
              <select
                value={invCustomer}
                onChange={e => handleCustomerSelectForInvoice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- Or enter new customer below --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={invCustName}
                onChange={e => setInvCustName(e.target.value)}
                placeholder="e.g. Malik Shahzad"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={invCustPhone}
                onChange={e => setInvCustPhone(e.target.value)}
                placeholder="0305-8304908"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Invoice Date</label>
              <input
                type="date"
                value={invDate}
                onChange={e => setInvDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Invoice Items & Products</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Catalog Product</th>
                    <th className="p-2.5">Description / Name</th>
                    <th className="p-2.5 w-24 text-center">Qty</th>
                    <th className="p-2.5 w-32 text-right">Unit Price</th>
                    <th className="p-2.5 w-32 text-right">Total</th>
                    <th className="p-2.5 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {invItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-2.5">
                        <select
                          value={item.productId || ''}
                          onChange={e => handleItemProductSelect(idx, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                        >
                          <option value="">-- Custom item --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Rs. {p.salePrice})</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={e => handleItemFieldChange(idx, 'name', e.target.value)}
                          placeholder="Item name / model"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={e => handleItemFieldChange(idx, 'qty', Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-bold"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemFieldChange(idx, 'price', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-right font-bold"
                        />
                      </td>
                      <td className="p-2.5 text-right font-black text-amber-400">
                        Rs. {(item.total || 0).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
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

          {/* Totals and Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Special Notes / Customer Remarks</label>
                <textarea
                  rows={3}
                  value={invNotes}
                  onChange={e => setInvNotes(e.target.value)}
                  placeholder="Warranty notes, serial numbers, delivery details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-bold text-white">Rs. {itemsSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Discount:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={invDiscountVal}
                    onChange={e => setInvDiscountVal(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right"
                  />
                  <select
                    value={invDiscountType}
                    onChange={e => setInvDiscountType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="fixed">Rs.</option>
                    <option value="percent">%</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b-2 border-amber-500/30 text-sm font-black">
                <span className="text-white">GRAND TOTAL:</span>
                <span className="text-amber-400">Rs. {grandTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-emerald-400 font-bold">Paid / Received:</span>
                <input
                  type="number"
                  value={invPaid}
                  onChange={e => setInvPaid(e.target.value)}
                  className="w-32 bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-emerald-300 font-bold text-right"
                />
              </div>

              <div className="flex justify-between py-1 text-sm font-black text-red-400">
                <span>Balance Due:</span>
                <span>Rs. {balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingInvoice ? 'Update Shop Invoice' : 'Save & Issue Invoice'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: VIEW INVOICE (IN ACTIVE THEME WITH PDF & PRINT) */}
      {/* ------------------------------------------------------------- */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <InvoiceThemeRenderer
              invoice={viewingInvoice}
              themeId={settings.invoiceTheme || 'black_gold'}
              settings={settings}
              onClose={() => setViewingInvoice(null)}
              onSendToEmail={(inv) => {
                setViewingInvoice(null);
                setEmailModalInvoice(inv);
              }}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: SEND TO HADI STUDIO CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {transferConfirmInvoice && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-purple-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-purple-950/90 to-slate-900 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Send Invoice to Hadi Studio</h3>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Enterprise Invoice Transfer</span>
                </div>
              </div>
              <button
                onClick={() => setTransferConfirmInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-slate-200 leading-relaxed font-medium">
                "Send this invoice to Hadi Studio? After sending, this invoice will be locked and cannot be edited from Shop Management."
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <p>Invoice Number: <strong className="text-amber-400">#{transferConfirmInvoice.invoiceNumber || transferConfirmInvoice.id}</strong></p>
                <p>Customer: <strong className="text-white">{transferConfirmInvoice.customerName}</strong></p>
                <p>Grand Total: <strong className="text-emerald-400">Rs. {(transferConfirmInvoice.grandTotal || 0).toLocaleString()}</strong></p>
              </div>

              <p className="text-[11px] text-slate-400">
                This transfer will create an official studio booking invoice in Hadi Studio repository and notify the Admin.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferConfirmInvoice(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendToStudio}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Send to Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SEND TO EMAIL MODAL */}
      {/* ------------------------------------------------------------- */}
      <SendEmailModal
        isOpen={!!emailModalInvoice}
        onClose={() => setEmailModalInvoice(null)}
        invoice={emailModalInvoice}
        settings={settings}
        triggerAlert={triggerAlert}
        onSuccess={(info) => {
          onAddAuditLog?.({
            action: 'Invoice Sent via Email',
            category: 'invoice',
            user: 'Admin',
            details: `Invoice #${info.invoiceNumber} dispatched to ${info.recipient} (Customer: ${info.customerName})`,
            targetId: info.invoiceNumber
          });
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADMIN OVERRIDE MODAL FOR LOCKED INVOICES */}
      {/* ------------------------------------------------------------- */}
      {overrideModalInvoice && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-amber-950/80 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Admin Override & Correction</h3>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Locked Invoice Access</span>
                </div>
              </div>
              <button
                onClick={() => setOverrideModalInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminOverride} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-[11px] flex items-center justify-between">
                <span>Status: <strong>SENT TO HADI STUDIO – LOCKED</strong></span>
                <button
                  type="button"
                  onClick={() => handleUnlockInvoice(overrideModalInvoice)}
                  className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Unlock & Restore</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={overrideCustName}
                    onChange={e => setOverrideCustName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={overrideCustPhone}
                    onChange={e => setOverrideCustPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={overrideDate}
                    onChange={e => setOverrideDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={overrideCustEmail}
                    onChange={e => setOverrideCustEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Grand Total (Rs.)</label>
                  <input
                    type="number"
                    value={overrideGrandTotal}
                    onChange={e => setOverrideGrandTotal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Paid Amount (Rs.)</label>
                  <input
                    type="number"
                    value={overridePaidAmount}
                    onChange={e => setOverridePaidAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Admin Override Reason / Notes</label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  placeholder="State reason for overriding locked invoice data..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOverrideModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  Save Override Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: PRODUCT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Product Name *</label>
                <input type="text" required value={pName} onChange={e => setPName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">SKU / Code</label>
                  <input type="text" value={pSku} onChange={e => setPSku(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Purchase Price</label>
                  <input type="number" value={pPurchasePrice} onChange={e => setPPurchasePrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Sale Price *</label>
                  <input type="number" required value={pSalePrice} onChange={e => setPSalePrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stock Qty</label>
                  <input type="number" value={pStock} onChange={e => setPStock(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea rows={2} value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: CUSTOMER MODAL */}
      {/* ------------------------------------------------------------- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editingCustomer ? 'Edit Customer Profile' : 'Enroll New Customer'}</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCustomerSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Customer Full Name *</label>
                <input type="text" required value={cName} onChange={e => setCName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input type="text" value={cPhone} onChange={e => setCPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                  <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Address</label>
                <input type="text" value={cAddress} onChange={e => setCAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Internal Notes</label>
                <textarea rows={2} value={cNotes} onChange={e => setCNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, type: '', item: null, name: '' })}
        onConfirm={async () => {
          if (deleteModalState.type === 'Invoice') {
            await onDeleteInvoice?.(deleteModalState.item.id);
            onAddAuditLog?.({
              action: 'Shop Invoice Deleted',
              category: 'delete',
              user: 'Admin',
              details: `Invoice #${deleteModalState.item.invoiceNumber || deleteModalState.item.id} permanently deleted.`,
              targetId: deleteModalState.item.id
            });
            triggerAlert?.('Invoice deleted from database.');
          } else if (deleteModalState.type === 'Product') {
            await onDeleteProduct?.(deleteModalState.item.id);
            onAddAuditLog?.({
              action: 'Product Deleted',
              category: 'delete',
              user: 'Admin',
              details: `Product "${deleteModalState.item.name}" (${deleteModalState.item.sku}) deleted.`,
              targetId: deleteModalState.item.id
            });
            triggerAlert?.('Product deleted.');
          } else if (deleteModalState.type === 'Customer') {
            await onDeleteCustomer?.(deleteModalState.item.id);
            onAddAuditLog?.({
              action: 'Customer Deleted',
              category: 'delete',
              user: 'Admin',
              details: `Customer "${deleteModalState.item.name}" deleted.`,
              targetId: deleteModalState.item.id
            });
            triggerAlert?.('Customer profile deleted.');
          }
        }}
        title={`Delete ${deleteModalState.type}`}
        itemName={deleteModalState.name}
        itemType={deleteModalState.type}
      />

    </div>
  );
}
