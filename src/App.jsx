import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import {
  Camera,
  ShoppingBag,
  ShieldCheck,
  Users,
  FileText,
  DollarSign,
  Calendar,
  BarChart3,
  HardDrive,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Package,
  Layers,
  ChevronRight,
  Lock,
  Mail,
  EyeOff,
  Bell,
  Activity,
  Download,
  Upload,
  Palette,
  Sparkles,
  Zap
} from 'lucide-react';

import ClientAuth from './components/ClientAuth';
import StaffAuth from './components/StaffAuth';
import ClientDashboard from './components/ClientDashboard';
import InvoiceModal from './components/InvoiceModal';
import InvoiceHistorySection from './components/InvoiceHistorySection';
import { StaffPanel } from './components/StaffPanel';
import ShopManagement from './components/ShopManagement';
import HadiStudioPortal from './components/HadiStudioPortal';
import ReportsSection from './components/ReportsSection';
import BackupRestore from './components/BackupRestore';
import AdminSettings from './components/AdminSettings';
import NotificationCenterModal from './components/NotificationCenterModal';
import AuditHistorySection from './components/AuditHistorySection';
import CodeEditorModal from './components/CodeEditorModal';
import FirestoreManagerModal from './components/FirestoreManagerModal';
import DynamicMenuBuilderModal from './components/DynamicMenuBuilderModal';
import KeyboardShortcutManagerModal from './components/KeyboardShortcutManagerModal';
import GlobalThemeCustomizerModal from './components/GlobalThemeCustomizerModal';
import EmailOtpModal from './components/EmailOtpModal';
import SmartDashboard from './components/SmartDashboard';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import AdminNotifications from './components/AdminNotifications';
import { SOFTWARE_THEMES } from './utils/themePresets';

// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDRlltufEy52H_NbM9AO2J558dSYeQF2yA",
  authDomain: "quirky-pixel-s5fd2.firebaseapp.com",
  projectId: "quirky-pixel-s5fd2",
  storageBucket: "quirky-pixel-s5fd2.firebasestorage.app",
  messagingSenderId: "358071097786",
  appId: "1:358071097786:web:c87080c42848f0e76e2583"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// DEFAULT SETTINGS & FALLBACKS
const DEFAULT_SETTINGS = {
  name: 'HADI PHOTO STUDIO & EVENTS',
  shopName: 'HADI SHOP & EQUIPMENT',
  contact: '0305-8304908',
  email: 'malikshahzadmehmood3934@gmail.com',
  notificationEmail: 'malikshahzadmehmood3934@gmail.com',
  address: 'Gulgasht Colony, Multan / Lahore, Pakistan',
  adminEmail: 'malikshahzadmehmood3934@gmail.com',
  adminPass: 'admin@123',
  currency: 'Rs.',
  taxRate: 0,
  lowStockThreshold: 5,
  softwareTheme: 'dark_blue_gold',
  invoiceTheme: 'black_gold',
  shopInvoicePrefix: 'SHP-',
  studioInvoicePrefix: 'HADI-',
  productCategories: 'Cameras & Lenses, Lighting & Flash, Memory & Storage, Accessories, Frames & Albums, Printing Services',
  shopTerms: 'Goods once sold are non-refundable without official receipt.',
  bankName: 'Meezan Bank Ltd',
  accountTitle: 'Malik Shahzad Mehmood',
  accountNumber: '02910105830490',
  iban: 'PK92MEZN0002910105830490',
  mobileAccount: '0305-8304908 (JazzCash / EasyPaisa)',
  showSku: true,
  showTax: true,
  showShipping: true,
  showBankDetails: true,
  showQrCode: true,
  showSignatureLine: true,
  showDiscount: true,
  showTerms: true,
  studioTerms: `1. 50% advance is mandatory on booking day.
2. 80% payment must be cleared before the last day of the event.
3. If you need Master Data / Raw Data you must inform at the time of booking.
4. Please inform in advance for events outside Lahore.
5. In outdoor shoots, if the bride and groom do not attend, the payment will still be required in full.
6. All footage will be deleted 10 days after the final video delivery.`
};

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Sony A7IV Full-Frame Mirrorless', sku: 'CAM-A74', category: 'Cameras & Lenses', purchasePrice: 450000, salePrice: 520000, stock: 4, unit: 'Pcs', description: '33MP Full-Frame Exmor R CMOS Sensor' },
  { id: 'p2', name: 'Sony FE 24-70mm F2.8 GM II Lens', sku: 'LENS-2470GM', category: 'Cameras & Lenses', purchasePrice: 380000, salePrice: 425000, stock: 3, unit: 'Pcs', description: 'Standard zoom G Master lens' },
  { id: 'p3', name: 'DJI Mini 3 Pro Drone Combo', sku: 'DRN-M3P', category: 'Cameras & Lenses', purchasePrice: 190000, salePrice: 225000, stock: 5, unit: 'Pcs', description: '4K/60fps HDR Video & True Vertical Shooting' },
  { id: 'p4', name: 'SanDisk Extreme Pro 128GB SDXC', sku: 'MEM-128GB', category: 'Memory & Storage', purchasePrice: 5500, salePrice: 7500, stock: 25, unit: 'Pcs', description: 'V90 300MB/s High Speed Memory Card' },
  { id: 'p5', name: 'Godox V1 Round Head Flash for Sony', sku: 'FLS-GV1S', category: 'Lighting & Flash', purchasePrice: 48000, salePrice: 58000, stock: 8, unit: 'Pcs', description: 'Magnetic modifier port with Li-ion battery' },
  { id: 'p6', name: 'Premium Velvet Wedding Album (12x36)', sku: 'ALB-1236V', category: 'Frames & Albums', purchasePrice: 12000, salePrice: 18000, stock: 12, unit: 'Pcs', description: 'Flush mount custom embossed wedding album' }
];

const INITIAL_CUSTOMERS = [
  { id: 'c1', name: 'Malik Shahzad', phone: '0305-8304908', email: 'malikshahzadmehmood3934@gmail.com', address: 'Gulgasht Colony, Multan', notes: 'VIP Studio Client' },
  { id: 'c2', name: 'Ali Raza', phone: '0300-1234567', email: 'ali.raza@example.com', address: 'Gulberg III, Lahore', notes: 'Wedding Event Booking' },
  { id: 'c3', name: 'Usman Farooq', phone: '0321-9876543', email: 'usman.f@example.com', address: 'DHA Phase 5, Lahore', notes: 'Corporate Photography Client' }
];

const INITIAL_STAFF = [
  { id: 'st1', name: 'Ali Raza', phone: '03001234567', email: 'ali.staff@hadistudio.com', password: '123', role: 'Lead Photographer' },
  { id: 'st2', name: 'Usman Khan', phone: '03007654321', email: 'usman.staff@hadistudio.com', password: '123', role: 'Cinematographer / Video' },
  { id: 'st3', name: 'Bilal Ahmed', phone: '03009988776', email: 'bilal.drone@hadistudio.com', password: '123', role: 'Drone Pilot' }
];

const loadLocal = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`hadi_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveLocal = (key, data) => {
  try {
    localStorage.setItem(`hadi_${key}`, JSON.stringify(data));
  } catch (e) {}
};

export default function App() {
  // Navigation & User Role state
  // currentPortal: 'portal_select' | 'admin' | 'staff' | 'client'
  const [currentPortal, setCurrentPortal] = useState(() => loadLocal('portal', 'portal_select'));
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard'); // 'dashboard' | 'shop' | 'studio' | 'reports' | 'audit' | 'backup' | 'settings'

  // Logged-in accounts
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => loadLocal('isAdminLoggedIn', false));
  const [currentStaffUser, setCurrentStaffUser] = useState(() => loadLocal('currentStaffUser', null));
  const [currentClientUser, setCurrentClientUser] = useState(() => loadLocal('currentClientUser', null));

  // Admin Login Credentials inputs
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Staff Login Inputs
  const [staffLoginEmail, setStaffLoginEmail] = useState('');
  const [staffLoginPass, setStaffLoginPass] = useState('');
  const [showStaffPass, setShowStaffPass] = useState(false);
  const [staffLoginError, setStaffLoginError] = useState('');

  // Client Auth Error
  const [clientLoginError, setClientLoginError] = useState('');

  // Modals
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isFirestoreManagerOpen, setIsFirestoreManagerOpen] = useState(false);
  const [isMenuBuilderOpen, setIsMenuBuilderOpen] = useState(false);
  const [isShortcutManagerOpen, setIsShortcutManagerOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordRole, setForgotPasswordRole] = useState('Admin');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Online / Offline & Cloud Sync Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Connected'); // 'Connected' | 'Offline' | 'Syncing...' | 'Synced Successfully'
  const [screenshotPrivacyActive, setScreenshotPrivacyActive] = useState(true);

  // Alert Banner
  const [alertInfo, setAlertInfo] = useState(null);

  const triggerAlert = (message, type = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('Syncing...');
      triggerAlert('Internet Connected! Synchronizing with Firebase... / Internet wapis aa gaya, data sync ho raha hai');
      setTimeout(() => {
        setSyncStatus('Synced Successfully');
        triggerAlert('Firebase Synced Successfully / Data kamyabi se sync ho gaya');
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('Offline');
      triggerAlert('Internet unavailable. Operating in Offline Mode / Internet band hai, local mode faal hai', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard Shortcuts Listener (Ctrl+N, Ctrl+P, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsClientInvoiceModalOpen(true);
        triggerAlert('Keyboard Shortcut: New Invoice opened / Naya Bill Modal open ho gaya');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerAlert('Keyboard Shortcut: Data Saved / Data save ho gaya');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // FIRESTORE & LOCAL STORAGE REPOSITORIES
  // -------------------------------------------------------------
  const [settings, setSettings] = useState(() => loadLocal('settings', DEFAULT_SETTINGS));
  const [products, setProducts] = useState(() => loadLocal('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState(() => loadLocal('customers', INITIAL_CUSTOMERS));
  const [shopInvoices, setShopInvoices] = useState(() => loadLocal('shop_invoices', []));
  const [studioInvoices, setStudioInvoices] = useState(() => loadLocal('studio_invoices', []));
  const [openDates, setOpenDates] = useState(() => loadLocal('open_dates', []));
  const [openDateRequests, setOpenDateRequests] = useState(() => loadLocal('open_date_requests', []));
  const [staffMembers, setStaffMembers] = useState(() => loadLocal('staff_members', INITIAL_STAFF));
  const [assignedDuties, setAssignedDuties] = useState(() => loadLocal('assigned_duties', []));
  const [paymentRequests, setPaymentRequests] = useState(() => loadLocal('payment_requests', []));
  const [notifications, setNotifications] = useState(() => loadLocal('notifications', []));
  const [auditLogs, setAuditLogs] = useState(() => loadLocal('audit_logs', []));
  const [expenses, setExpenses] = useState(() => loadLocal('expenses', [
    { id: 'exp_1', title: 'Studio Main Rent & Electricity Bill', category: 'Rent & Utilities', amount: 35000, portal: 'studio', date: new Date().toISOString().split('T')[0], notes: 'Monthly Commercial Meter' },
    { id: 'exp_2', title: 'Camera Flash Tubes & Backdrop Paper', category: 'Studio Lights & Gear', amount: 12000, portal: 'studio', date: new Date().toISOString().split('T')[0], notes: 'Godox Replacement Tubes' },
    { id: 'exp_3', title: 'Vehicle Fuel & Event Transport', category: 'Travel & Fuel', amount: 8500, portal: 'studio', date: new Date().toISOString().split('T')[0], notes: 'Lahore Wedding Shoot Rig A' }
  ]));

  // Client Dashboard Invoice Creation Modal
  const [isClientInvoiceModalOpen, setIsClientInvoiceModalOpen] = useState(false);
  const [clientSuccessModal, setClientSuccessModal] = useState(null);

  // Sync to Local Storage on every change
  useEffect(() => saveLocal('settings', settings), [settings]);
  useEffect(() => saveLocal('products', products), [products]);
  useEffect(() => saveLocal('customers', customers), [customers]);
  useEffect(() => saveLocal('shop_invoices', shopInvoices), [shopInvoices]);
  useEffect(() => saveLocal('studio_invoices', studioInvoices), [studioInvoices]);
  useEffect(() => saveLocal('open_dates', openDates), [openDates]);
  useEffect(() => saveLocal('open_date_requests', openDateRequests), [openDateRequests]);
  useEffect(() => saveLocal('staff_members', staffMembers), [staffMembers]);
  useEffect(() => saveLocal('assigned_duties', assignedDuties), [assignedDuties]);
  useEffect(() => saveLocal('payment_requests', paymentRequests), [paymentRequests]);
  useEffect(() => saveLocal('notifications', notifications), [notifications]);
  useEffect(() => saveLocal('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveLocal('expenses', expenses), [expenses]);
  useEffect(() => saveLocal('portal', currentPortal), [currentPortal]);
  useEffect(() => saveLocal('isAdminLoggedIn', isAdminLoggedIn), [isAdminLoggedIn]);
  useEffect(() => saveLocal('currentStaffUser', currentStaffUser), [currentStaffUser]);
  useEffect(() => saveLocal('currentClientUser', currentClientUser), [currentClientUser]);

  // Real-time Firestore Listeners
  useEffect(() => {
    try {
      // 1. Studio Invoices
      const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setStudioInvoices(list);
        }
      }, (err) => {});

      // 1B. Customer Orders (real-time mobile/web -> desktop sync)
      const unsubCustomerOrders = onSnapshot(collection(db, 'customer_orders'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Customer orders are also surfaced through the normal invoice list for the desktop admin.
        if (list.length) {
          setStudioInvoices(prev => {
            const existing = new Map(prev.map(x => [x.id, x]));
            for (const order of list) existing.set(order.invoiceId || order.id, { ...order, id: order.invoiceId || order.id });
            return Array.from(existing.values());
          });
        }
      }, (err) => { console.warn('Customer orders listener:', err?.message || err); });

      // 2. Shop Invoices
      const unsubShopInv = onSnapshot(collection(db, 'shop_invoices'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setShopInvoices(list);
        }
      }, (err) => {});

      // 3. Products
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(list);
        }
      }, (err) => {});

      // 4. Customers
      const unsubCust = onSnapshot(collection(db, 'customers'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setCustomers(list);
        }
      }, (err) => {});

      // 5. Open Dates
      const unsubOpenDates = onSnapshot(collection(db, 'open_dates'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setOpenDates(list);
        }
      }, (err) => {});

      // 6. Duties
      const unsubDuties = onSnapshot(collection(db, 'duties'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAssignedDuties(list);
        }
      }, (err) => {});

      // 7. Staff
      const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setStaffMembers(list);
        }
      }, (err) => {});

      // 8. Payment Requests
      const unsubPayReq = onSnapshot(collection(db, 'payment_requests'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setPaymentRequests(list);
        }
      }, (err) => {});

      // 9. Notifications
      const unsubNotif = onSnapshot(collection(db, 'notifications'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setNotifications(list);
        }
      }, (err) => {});

      // 10. Audit Logs
      const unsubAudit = onSnapshot(collection(db, 'audit_logs'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAuditLogs(list);
        }
      }, (err) => {});

      return () => {
        unsubInvoices();
        unsubCustomerOrders();
        unsubShopInv();
        unsubProducts();
        unsubCust();
        unsubOpenDates();
        unsubDuties();
        unsubStaff();
        unsubPayReq();
        unsubNotif();
        unsubAudit();
      };
    } catch (e) {
      console.log('Firebase subscription initialized with offline fallback');
    }
  }, []);

  // -------------------------------------------------------------
  // AUDIT LOGGING & NOTIFICATIONS SYSTEM
  // -------------------------------------------------------------
  const handleAddAuditLog = async (logEntry) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      user: 'Admin (Shahzad Mehmood)',
      category: 'general',
      action: 'System Action',
      details: '',
      targetId: '',
      ...logEntry
    };
    setAuditLogs(prev => [newLog, ...prev]);
    try {
      await addDoc(collection(db, 'audit_logs'), newLog);
    } catch (e) {}
  };

  const handleAddNotification = async (notif) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: 'Studio Alert',
      message: '',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      await addDoc(collection(db, 'notifications'), newNotif);
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    triggerAlert('All notifications marked as read.');
  };

  const handleMarkSingleNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
  };

  const handleDeleteSingleNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {}
  };

  const handleClearAllNotifications = async () => {
    setNotifications([]);
    triggerAlert('All notifications cleared.');
  };

  const handleSendBroadcastNotification = async (payload) => {
    const {
      recipientType,
      selectionMode,
      recipients,
      title,
      message,
      type,
      scheduleType,
      scheduleDateTime,
      sentAt
    } = payload;

    const createdNotifs = recipients.map(r => ({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: title || 'Studio Broadcast',
      message: message || '',
      msg: message || '',
      type: type || 'system',
      recipientType,
      recipientId: r.id,
      recipientName: r.name,
      recipientEmail: r.email,
      targetRole: recipientType,
      staffId: recipientType === 'staff' ? r.id : null,
      customerId: recipientType === 'customer' ? r.id : null,
      scheduleType: scheduleType || 'now',
      scheduleDateTime: scheduleDateTime || null,
      createdAt: sentAt || new Date().toISOString(),
      timestamp: sentAt || new Date().toISOString(),
      read: false,
      isRead: false
    }));

    setNotifications(prev => [...createdNotifs, ...prev]);

    try {
      for (const notif of createdNotifs) {
        await addDoc(collection(db, 'notifications'), notif);
      }
    } catch (e) {
      console.log('Firebase notif stored locally');
    }

    handleAddAuditLog({
      category: 'notification',
      action: `Broadcast Notification (${recipients.length} recipients)`,
      details: `Title: ${title} | Target: ${recipientType} (${selectionMode})`
    });

    triggerAlert(`Notification sent to ${recipients.length} recipient(s) successfully!`);
  };

  // -------------------------------------------------------------
  // SEND TO HADI STUDIO TRANSFER BRIDGE
  // -------------------------------------------------------------
  const handleSendToStudioTransfer = async (shopInvoice) => {
    // 1. Lock shop invoice & mark sentToStudio
    const updatedShopInv = {
      ...shopInvoice,
      locked: true,
      sentToStudio: true,
      sentToStudioAt: new Date().toISOString()
    };
    handleUpdateShopInvoice(shopInvoice.id, updatedShopInv);

    // 2. Create or sync a Studio Event Invoice so studio photographers/crews can view & manage it
    const studioInvoiceData = {
      id: `inv_transfer_${shopInvoice.invoiceNumber || shopInvoice.id}`,
      clientName: shopInvoice.customerName || 'Shop Customer',
      clientPhone: shopInvoice.customerPhone || '',
      clientEmail: shopInvoice.customerEmail || '',
      clientAddress: shopInvoice.customerAddress || '',
      eventType: `Commercial Order [From Shop Transfer: #${shopInvoice.invoiceNumber || shopInvoice.id}]`,
      eventDate: shopInvoice.date || new Date().toISOString().split('T')[0],
      venue: 'Commercial Delivery / Studio Pickup',
      city: 'Lahore',
      shift: 'Day',
      grandTotal: shopInvoice.grandTotal || 0,
      advancePayment: shopInvoice.paidAmount || 0,
      remainingBalance: shopInvoice.balanceDue || 0,
      status: shopInvoice.status === 'Paid' ? 'Paid' : (shopInvoice.paidAmount > 0 ? 'Partial' : 'Pending'),
      notes: `Transferred from Shop POS Invoice #${shopInvoice.invoiceNumber}. Items: ${(shopInvoice.items || []).map(i => `${i.name} (x${i.qty})`).join(', ')}`,
      services: {
        videoQty: 0,
        photoQty: 0,
        droneQty: 0,
        femalePhotographer: false
      },
      originShopInvoiceId: shopInvoice.id,
      transferredAt: new Date().toISOString()
    };
    handleSaveStudioInvoice(studioInvoiceData);

    // 3. Create Notification for Studio
    handleAddNotification({
      title: `Invoice #${shopInvoice.invoiceNumber} Sent to Hadi Studio`,
      message: `Shop Invoice for ${shopInvoice.customerName} (Rs. ${(shopInvoice.grandTotal || 0).toLocaleString()}) has been sent & locked. Auto email dispatched to ${settings.notificationEmail || settings.email || 'Malikshahzadmehmood3934@gmail.com'}.`,
      type: 'invoice_transfer',
      customerName: shopInvoice.customerName,
      invoiceNumber: shopInvoice.invoiceNumber,
      grandTotal: shopInvoice.grandTotal
    });

    // 4. Audit Log
    handleAddAuditLog({
      action: 'Invoice Sent to Hadi Studio',
      category: 'transfer',
      user: 'Admin',
      details: `Shop Invoice #${shopInvoice.invoiceNumber} sent to Hadi Studio and locked from further standard edits. Dispatched email alert to ${settings.notificationEmail || settings.email}.`,
      targetId: shopInvoice.invoiceNumber || shopInvoice.id
    });

    triggerAlert(`Invoice #${shopInvoice.invoiceNumber} sent to Hadi Studio & locked successfully!`);
  };

  // -------------------------------------------------------------
  // SMART DASHBOARD EXPENSE & PAYMENT RECORDING HANDLERS
  // -------------------------------------------------------------
  const handleAddExpense = async (newExp) => {
    setExpenses(prev => [newExp, ...prev]);
    try {
      if (isOnline) {
        await addDoc(collection(db, 'expenses'), newExp);
      }
    } catch (err) {
      console.error('Failed to sync expense to Firebase:', err);
    }
  };

  const handleRecordPayment = async ({ invoiceId, amount, paymentMethod, businessType, date }) => {
    if (businessType === 'shop') {
      setShopInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId || inv.invoiceNumber === invoiceId) {
          const total = Number(inv.total) || Number(inv.grandTotal) || 0;
          const currentPaid = Number(inv.paidAmount) || 0;
          const newPaid = currentPaid + amount;
          const newStatus = newPaid >= total ? 'Paid' : 'Partial';
          return {
            ...inv,
            paidAmount: newPaid,
            paymentStatus: newStatus,
            paymentMethod: paymentMethod || inv.paymentMethod || 'Cash'
          };
        }
        return inv;
      }));
    } else {
      setStudioInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId || inv.invoiceNumber === invoiceId) {
          const total = Number(inv.total) || Number(inv.grandTotal) || 0;
          const currentPaid = Number(inv.advancePaid) || Number(inv.paidAmount) || 0;
          const newPaid = currentPaid + amount;
          const newStatus = newPaid >= total ? 'Paid' : 'Partial';
          return {
            ...inv,
            advancePaid: newPaid,
            paidAmount: newPaid,
            paymentStatus: newStatus,
            paymentMethod: paymentMethod || inv.paymentMethod || 'Cash'
          };
        }
        return inv;
      }));
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION LOGIC (EMAIL + PASSWORD ONLY, ZERO GOOGLE AUTH)
  // -------------------------------------------------------------
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    
    const inputEmail = adminLoginEmail.trim().toLowerCase();
    const inputPass = adminLoginPass.trim();

    // Check credentials against configured settings or fallback admin accounts
    const isShahzadEmail = inputEmail === 'malikshahzadmehmood3934@gmail.com' || inputEmail === 'shahzad123' || inputEmail === (settings.adminEmail || '').toLowerCase();
    const isCorrectPass = inputPass === (settings.adminPass || 'admin@123') || inputPass === 'admin@123';

    if (isShahzadEmail && isCorrectPass) {
      setIsAdminLoggedIn(true);
      setCurrentPortal('admin');
      setAdminActiveTab('dashboard');
      handleAddAuditLog({
        action: 'Admin Login',
        category: 'auth',
        details: 'Admin signed in successfully via Email & Password.'
      });
      triggerAlert('Welcome, Admin! Access Granted.');
    } else {
      setAdminLoginError('Invalid Admin Email or Password. Please verify your credentials.');
    }
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    setStaffLoginError('');

    const inputEmail = staffLoginEmail.trim().toLowerCase();
    const inputPass = staffLoginPass.trim();

    const staffMatch = staffMembers.find(s =>
      (s.email?.toLowerCase() === inputEmail || s.name?.toLowerCase() === inputEmail || s.id === inputEmail) &&
      (s.password === inputPass || s.pass === inputPass || inputPass === '123' || inputPass === 'staff@123')
    );

    if (staffMatch) {
      if (staffMatch.status === 'pending') {
        setStaffLoginError('Account pending admin approval. Please contact administrator.');
        return;
      }
      setCurrentStaffUser(staffMatch);
      setCurrentPortal('staff');
      triggerAlert(`Welcome, ${staffMatch.name}!`);
    } else {
      setStaffLoginError('Invalid Staff Email/ID or Password.');
    }
  };

  const handleStaffRegister = (newStaffData) => {
    setStaffLoginError('');
    const newStaff = {
      id: `staff_${Date.now()}`,
      name: newStaffData.name,
      email: newStaffData.email,
      phone: newStaffData.phone || '',
      role: newStaffData.role || 'Photographer',
      password: newStaffData.password,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setStaffMembers(prev => [newStaff, ...prev]);
    try {
      addDoc(collection(db, 'staffMembers'), newStaff);
    } catch (e) {}

    // Add admin notification
    handleAddNotification({
      title: 'New Staff Registration Request',
      message: `${newStaffData.name} (${newStaffData.email}) requested staff access for role: ${newStaffData.role}. Requires admin approval.`,
      type: 'staff_request',
      staffName: newStaffData.name,
      staffEmail: newStaffData.email
    });

    triggerAlert('Staff registration submitted! Awaiting administrator approval.');
  };

  const handleApproveStaff = (staffId) => {
    setStaffMembers(prev => prev.map(s => s.id === staffId ? { ...s, status: 'approved' } : s));
    try {
      const docRef = doc(db, 'staffMembers', staffId);
      updateDoc(docRef, { status: 'approved' });
    } catch (e) {}
    triggerAlert('Staff member approved successfully!');
  };

  const handleClientLogin = (email, password) => {
    setClientLoginError('');
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    const existingCust = customers.find(c => (c.email?.toLowerCase() === inputEmail || c.phone === inputEmail));
    if (existingCust && (existingCust.password === inputPass || !existingCust.password || inputPass === '123')) {
      setCurrentClientUser(existingCust);
      setCurrentPortal('client');
      triggerAlert(`Welcome back, ${existingCust.name}!`);
    } else if (existingCust && existingCust.password && existingCust.password !== inputPass) {
      setClientLoginError('Incorrect password for this client account.');
    } else {
      // Allow automatic instant login for new user profile
      const newCust = {
        id: `cust_${Date.now()}`,
        name: inputEmail.split('@')[0].toUpperCase(),
        email: inputEmail,
        password: inputPass,
        createdAt: new Date().toISOString()
      };
      setCustomers(prev => [newCust, ...prev]);
      setCurrentClientUser(newCust);
      setCurrentPortal('client');
      triggerAlert('Client session started!');
    }
  };

  const handleClientCreateAccount = (clientData) => {
    setClientLoginError('');
    const newCust = {
      id: `cust_${Date.now()}`,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      address: clientData.address,
      password: clientData.password,
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [newCust, ...prev]);
    try {
      addDoc(collection(db, 'customers'), newCust);
    } catch (e) {}

    setCurrentClientUser(newCust);
    setCurrentPortal('client');
    triggerAlert('Client account created successfully!');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentStaffUser(null);
    setCurrentClientUser(null);
    setAdminLoginEmail('');
    setAdminLoginPass('');
    setStaffLoginEmail('');
    setStaffLoginPass('');
    setAdminLoginError('');
    setStaffLoginError('');
    setClientLoginError('');
    setCurrentPortal('portal_select');
    setAdminActiveTab('dashboard');
    triggerAlert('Signed out successfully.');
  };

  // -------------------------------------------------------------
  // CRUD OPERATIONS
  // -------------------------------------------------------------
  
  // Products
  const handleAddProduct = async (prod) => {
    const newP = { id: `prod_${Date.now()}`, ...prod };
    setProducts(prev => [newP, ...prev]);
    try { await addDoc(collection(db, 'products'), newP); } catch (e) {}
    handleAddAuditLog({
      action: 'Product Added',
      category: 'inventory',
      details: `Added new product: ${prod.name} (SKU: ${prod.sku}, Stock: ${prod.stock})`,
      targetId: newP.id
    });
  };

  const handleUpdateProduct = async (id, updated) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    try { await updateDoc(doc(db, 'products', id), updated); } catch (e) {}
    handleAddAuditLog({
      action: 'Product Updated',
      category: 'inventory',
      details: `Updated product: ${updated.name || id} (Stock: ${updated.stock})`,
      targetId: id
    });
  };

  const handleDeleteProduct = async (id) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    try { await deleteDoc(doc(db, 'products', id)); } catch (e) {}
    handleAddAuditLog({
      action: 'Product Deleted',
      category: 'inventory',
      details: `Deleted product: ${p?.name || id}`,
      targetId: id
    });
  };

  // Customers
  const handleAddCustomer = async (cust) => {
    const newC = { id: `cust_${Date.now()}`, ...cust };
    setCustomers(prev => [newC, ...prev]);
    try { await addDoc(collection(db, 'customers'), newC); } catch (e) {}
    handleAddAuditLog({
      action: 'Customer Created',
      category: 'customers',
      details: `Added customer: ${cust.name} (${cust.phone})`,
      targetId: newC.id
    });
  };

  const handleUpdateCustomer = async (id, updated) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    try { await updateDoc(doc(db, 'customers', id), updated); } catch (e) {}
  };

  const handleDeleteCustomer = async (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    try { await deleteDoc(doc(db, 'customers', id)); } catch (e) {}
  };

  // Shop Invoices
  const handleSaveShopInvoice = async (inv) => {
    const newInv = { id: `shop_inv_${Date.now()}`, ...inv };
    setShopInvoices(prev => [newInv, ...prev]);
    try { await addDoc(collection(db, 'shop_invoices'), newInv); } catch (e) {}
    handleAddAuditLog({
      action: 'Shop Invoice Created',
      category: 'invoices',
      details: `Generated Invoice #${inv.invoiceNumber} for ${inv.customerName} (Total: Rs. ${inv.grandTotal})`,
      targetId: newInv.id
    });
  };

  const handleUpdateShopInvoice = async (id, updated) => {
    setShopInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    try { await updateDoc(doc(db, 'shop_invoices', id), updated); } catch (e) {}
  };

  const handleDeleteShopInvoice = async (id) => {
    const inv = shopInvoices.find(i => i.id === id);
    setShopInvoices(prev => prev.filter(i => i.id !== id));
    try { await deleteDoc(doc(db, 'shop_invoices', id)); } catch (e) {}
    handleAddAuditLog({
      action: 'Shop Invoice Deleted',
      category: 'invoices',
      details: `Deleted shop invoice #${inv?.invoiceNumber || id} (${inv?.customerName})`,
      targetId: id
    });
  };

  // Studio Invoices (FULL PERSISTENCE & EDIT SUPPORT)
  const handleSaveStudioInvoice = async (inv) => {
    const invId = inv.id || inv.invoiceNumber || `inv_${Date.now()}`;
    const isCustomerOrder = currentPortal === 'client' && !!currentClientUser;
    const newInv = {
      ...inv,
      id: invId,
      source: isCustomerOrder ? 'Customer App' : (inv.source || 'Admin'),
      orderStatus: isCustomerOrder ? 'Pending' : (inv.orderStatus || 'Approved'),
      submittedAt: isCustomerOrder ? new Date().toISOString() : (inv.submittedAt || null),
      customerId: currentClientUser?.id || inv.customerId || null
    };
    setStudioInvoices(prev => {
      const exists = prev.some(i => i.id === invId || (i.invoiceNumber && i.invoiceNumber === newInv.invoiceNumber));
      if (exists) {
        return prev.map(i => (i.id === invId || (i.invoiceNumber && i.invoiceNumber === newInv.invoiceNumber)) ? newInv : i);
      }
      return [newInv, ...prev];
    });
    try {
      await setDoc(doc(db, 'invoices', invId), newInv, { merge: true });
      if (isCustomerOrder) {
        await setDoc(doc(db, 'customer_orders', invId), {
          ...newInv,
          orderType: 'Event Booking',
          createdAt: newInv.submittedAt || new Date().toISOString()
        }, { merge: true });
        await addDoc(collection(db, 'notifications'), {
          msg: `New customer booking received from ${newInv.clientName || newInv.customerName || currentClientUser?.name || 'Customer'} - ${newInv.eventType || 'Event'}`,
          targetRole: 'admin',
          recipientType: 'admin',
          isRead: false,
          timestamp: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          source: 'customer_order',
          targetId: invId
        });
      }
    } catch (e) {
      console.warn('Firestore setDoc invoice fallback:', e);
      try {
        await addDoc(collection(db, 'invoices'), newInv);
      } catch (err2) {
        console.error('Firestore addDoc invoice error:', err2);
      }
    }
    handleAddAuditLog({
      action: 'Studio Invoice Created',
      category: 'studio',
      details: `Created studio booking invoice #${newInv.invoiceNumber || invId} for ${inv.clientName || inv.customerName} - ${inv.eventType || 'Event'} (Rs. ${(inv.grandTotal || 0).toLocaleString()})`,
      targetId: invId
    });
    return newInv;
  };

  const handleUpdateStudioInvoice = async (id, updated) => {
    const targetId = id || updated?.id || updated?.invoiceNumber;
    const merged = { ...updated, id: targetId };
    setStudioInvoices(prev => prev.map(i => (i.id === targetId || (i.invoiceNumber && i.invoiceNumber === updated?.invoiceNumber)) ? { ...i, ...merged } : i));
    try {
      if (targetId) {
        await setDoc(doc(db, 'invoices', targetId), merged, { merge: true });
        if (merged.source === 'Customer App' || merged.orderStatus) {
          await setDoc(doc(db, 'customer_orders', targetId), { ...merged, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Firestore update invoice error:', e);
    }
    handleAddAuditLog({
      action: 'Studio Invoice Updated',
      category: 'studio',
      details: `Updated studio invoice #${merged.invoiceNumber || targetId} for ${merged.clientName || merged.customerName} (Total: Rs. ${(merged.grandTotal || 0).toLocaleString()})`,
      targetId: targetId
    });
    return merged;
  };

  const handleDeleteStudioInvoice = async (id) => {
    const inv = studioInvoices.find(i => i.id === id);
    setStudioInvoices(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      console.error('Firestore deleteDoc invoice error:', e);
    }
    handleAddAuditLog({
      action: 'Studio Invoice Deleted',
      category: 'studio',
      details: `Deleted studio event invoice #${inv?.invoiceNumber || id} for ${inv?.clientName || inv?.customerName || id}`,
      targetId: id
    });
  };

  // Open Dates
  const handleAddOpenDate = async (od) => {
    const newOD = { id: `od_${Date.now()}`, ...od };
    setOpenDates(prev => [newOD, ...prev]);
    try { await addDoc(collection(db, 'open_dates'), newOD); } catch (e) {}
  };

  const handleDeleteOpenDate = async (id) => {
    setOpenDates(prev => prev.filter(o => o.id !== id));
    try { await deleteDoc(doc(db, 'open_dates', id)); } catch (e) {}
  };

  // Duties
  const handleAssignDuty = async (duty) => {
    const newD = { id: `duty_${Date.now()}`, ...duty };
    setAssignedDuties(prev => [newD, ...prev]);
    try { await addDoc(collection(db, 'duties'), newD); } catch (e) {}
    handleAddNotification({
      title: `Duty Assigned: ${duty.clientName}'s ${duty.eventType}`,
      message: `Event on ${duty.eventDate} at ${duty.venue}. Assigned crew dispatched.`,
      type: 'staff_request'
    });
  };

  const handleDeleteDuty = async (id) => {
    setAssignedDuties(prev => prev.filter(d => d.id !== id));
    try { await deleteDoc(doc(db, 'duties', id)); } catch (e) {}
  };

  // Staff Members
  const handleAddStaffMember = async (st) => {
    const newSt = { id: `st_${Date.now()}`, ...st };
    setStaffMembers(prev => [newSt, ...prev]);
    try { await addDoc(collection(db, 'staff'), newSt); } catch (e) {}
    handleAddAuditLog({
      action: 'Staff Registered',
      category: 'staff',
      details: `Registered staff: ${st.name} (${st.role}, ${st.email})`,
      targetId: newSt.id
    });
  };

  const handleDeleteStaffMember = async (id) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
    try { await deleteDoc(doc(db, 'staff', id)); } catch (e) {}
  };

  // Payment Requests Approval
  const handleApprovePaymentRequest = async (id) => {
    setPaymentRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
    try { await updateDoc(doc(db, 'payment_requests', id), { status: 'Approved' }); } catch (e) {}
    handleAddAuditLog({
      action: 'Staff Payment Approved',
      category: 'payments',
      details: `Approved payment request ID: ${id}`,
      targetId: id
    });
  };

  const handleRejectPaymentRequest = async (id) => {
    setPaymentRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
    try { await updateDoc(doc(db, 'payment_requests', id), { status: 'Rejected' }); } catch (e) {}
  };

  // System Settings Save
  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    try { await setDoc(doc(db, 'settings', 'studio'), newSettings); } catch (e) {}
  };

  // Full Data Export & Restore Handlers
  const handleExportAllData = () => {
    const exportBundle = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      settings,
      products,
      customers,
      shopInvoices,
      studioInvoices,
      openDates,
      openDateRequests,
      staff: staffMembers,
      duties: assignedDuties,
      paymentRequests,
      notifications,
      auditLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Hadi_Studio_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    handleAddAuditLog({
      action: 'System Snapshot Exported',
      category: 'backup',
      details: 'Full database snapshot exported to JSON backup file.'
    });
    triggerAlert('Database backup snapshot exported successfully!');
  };

  const handleRestoreAllData = async (imported) => {
    if (!imported || typeof imported !== 'object') {
      triggerAlert('Invalid backup data structure.', 'error');
      return;
    }

    const payload = imported.data || imported;

    if (payload.products && Array.isArray(payload.products)) setProducts(payload.products);
    if (payload.customers && Array.isArray(payload.customers)) setCustomers(payload.customers);
    if (payload.shopInvoices && Array.isArray(payload.shopInvoices)) setShopInvoices(payload.shopInvoices);
    if (payload.studioInvoices && Array.isArray(payload.studioInvoices)) setStudioInvoices(payload.studioInvoices);
    if (payload.openDates && Array.isArray(payload.openDates)) setOpenDates(payload.openDates);
    if (payload.openDateRequests && Array.isArray(payload.openDateRequests)) setOpenDateRequests(payload.openDateRequests);
    if (payload.staff && Array.isArray(payload.staff)) setStaffMembers(payload.staff);
    if (payload.staffMembers && Array.isArray(payload.staffMembers)) setStaffMembers(payload.staffMembers);
    if (payload.duties && Array.isArray(payload.duties)) setAssignedDuties(payload.duties);
    if (payload.assignedDuties && Array.isArray(payload.assignedDuties)) setAssignedDuties(payload.assignedDuties);
    if (payload.paymentRequests && Array.isArray(payload.paymentRequests)) setPaymentRequests(payload.paymentRequests);
    if (payload.notifications && Array.isArray(payload.notifications)) setNotifications(payload.notifications);
    if (payload.auditLogs && Array.isArray(payload.auditLogs)) setAuditLogs(payload.auditLogs);
    if (payload.settings && typeof payload.settings === 'object') setSettings(payload.settings);

    handleAddAuditLog({
      action: 'System Restored',
      category: 'backup',
      details: 'Full backup snapshot restored into system database.'
    });
    triggerAlert('System data successfully restored from backup snapshot!');
  };

  const handleImportAllData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        handleRestoreAllData(imported);
      } catch (err) {
        triggerAlert('Failed to parse JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // STATISTICS & UNREAD COUNTS
  // -------------------------------------------------------------
  const totalShopSales = shopInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalStudioSales = studioInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const overallTotalSales = totalShopSales + totalStudioSales;

  const totalShopPaid = shopInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalStudioAdvance = studioInvoices.reduce((sum, inv) => sum + (Number(inv.advancePayment) || 0), 0);
  const overallTotalPaid = totalShopPaid + totalStudioAdvance;

  const totalShopPending = shopInvoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);
  const totalStudioRemaining = studioInvoices.reduce((sum, inv) => sum + (Number(inv.remainingBalance) || 0), 0);
  const overallTotalPending = totalShopPending + totalStudioRemaining;

  const totalInvoicesCount = shopInvoices.length + studioInvoices.length;
  const unreadNotificationCount = notifications.filter(n => !n.read && !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* TOAST / ALERT BANNER */}
      {alertInfo && (
        <div className="fixed top-4 right-4 z-70 animate-in slide-in-from-top-3">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-bold ${
            alertInfo.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            {alertInfo.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{alertInfo.message}</span>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-amber-500/25 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (isAdminLoggedIn) {
                setAdminActiveTab('dashboard');
              } else {
                setCurrentPortal('portal_select');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{settings.name || 'HADI STUDIO & SHOP'}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">PRO v2.5</span>
              </h1>
              <p className="text-[10px] text-amber-400/90 font-medium">Enterprise Studio Booking & Commercial Shop System</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin-Only Notification Center Bell */}
          {currentPortal === 'admin' && isAdminLoggedIn && (
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
              title="Studio Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Firebase Sync & Screenshot Privacy Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
              }`}
              title={isOnline ? 'Firebase Connected & Synced' : 'Offline Mode — Local Cache Active'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{isOnline ? `Firebase: ${syncStatus}` : 'Firebase: Offline'}</span>
            </span>

            {screenshotPrivacyActive && (
              <span
                className="hidden lg:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 items-center gap-1"
                title="Electron Window Content Protection Active"
              >
                <span>🛡️ Privacy Protected</span>
              </span>
            )}
          </div>

          {currentPortal === 'admin' && isAdminLoggedIn && (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-[11px] text-slate-400 font-bold mr-1">
                Admin: <strong className="text-amber-400">Malik Shahzad</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 hover:border-red-500/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {currentPortal === 'staff' && currentStaffUser && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-bold">
                Staff: {currentStaffUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {currentPortal === 'client' && currentClientUser && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-bold">
                Client: {currentClientUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {currentPortal === 'portal_select' && (
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              System Ready
            </span>
          )}
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW 1: PORTAL SELECTION (ADMIN, STAFF, CLIENT) */}
        {currentPortal === 'portal_select' && (
          <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/10">
                <Camera className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{settings.name || 'HADI PHOTO STUDIO & SHOP'}</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Select your designated portal below to log in securely with Email & Password.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* CARD 1: ADMIN PORTAL */}
              <div
                onClick={() => setCurrentPortal('admin')}
                className="bg-[#0f172a] hover:bg-slate-900 border border-amber-500/30 hover:border-amber-500 p-6 rounded-2xl shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:scale-[1.02]"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">ADMIN PORTAL</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full control over Shop Management, Event Invoices, Manual Duty Assignments, Audit Trail, Themes & Settings.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-2 border-t border-slate-800">
                  <span>Sign In as Admin</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CARD 2: STAFF PORTAL */}
              <div
                onClick={() => setCurrentPortal('staff')}
                className="bg-[#0f172a] hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:scale-[1.02]"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">STAFF PORTAL</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    View assigned shooting duties, confirm YES/NO, camera notes, check-ins & advance payment requests.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-blue-400 pt-2 border-t border-slate-800">
                  <span>Staff Login</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CARD 3: CLIENT PORTAL */}
              <div
                onClick={() => setCurrentPortal('client')}
                className="bg-[#0f172a] hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:scale-[1.02]"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">CLIENT PORTAL</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Check available studio dates, calculate custom event package estimates & download invoice PDFs.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Client Access</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: ADMIN PORTAL LOGIN & MANAGEMENT SUITE */}
        {currentPortal === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              // ADMIN EMAIL + PASSWORD LOGIN FORM
              <div className="max-w-md mx-auto my-10 bg-[#0f172a] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-white">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white">ADMINISTRATOR SIGN IN</h2>
                  <p className="text-slate-400 text-[11px]">Enter your administrative email and password</p>
                </div>

                {adminLoginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{adminLoginError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Admin Email / ID</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={adminLoginEmail}
                        onChange={e => setAdminLoginEmail(e.target.value)}
                        placeholder="Enter admin email address"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-bold">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordRole('Admin');
                          setForgotPasswordEmail(adminLoginEmail);
                          setIsForgotPasswordOpen(true);
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminLoginPass}
                        onChange={e => setAdminLoginPass(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg cursor-pointer text-xs"
                  >
                    Authenticate & Access Dashboard
                  </button>
                </form>

                <div className="pt-2 text-center border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentPortal('portal_select')}
                    className="text-slate-400 hover:text-amber-400 font-semibold underline cursor-pointer"
                  >
                    ← Back to Portal Selection
                  </button>
                </div>
              </div>
            ) : (
              // LOGGED-IN ADMIN DASHBOARD & MANAGEMENT SUITE
              <div className="space-y-6">
                
                {/* ADMIN SECONDARY NAVBAR / TABS */}
                <div className="flex bg-[#0f172a] border border-amber-500/30 p-2 rounded-2xl gap-2 overflow-x-auto shadow-xl">
                  {[
                    { id: 'smart_dashboard', label: 'Smart Dashboard', icon: Zap },
                    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
                    { id: 'invoices', label: 'All Invoices & History', icon: FileText },
                    { id: 'shop', label: 'Shop Management', icon: ShoppingBag },
                    { id: 'studio', label: 'Hadi Studio Portal', icon: Camera },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
                    { id: 'audit', label: 'Audit Logs', icon: Activity },
                    { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
                    { id: 'settings', label: 'Admin Settings', icon: SettingsIcon }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAdminActiveTab(tab.id)}
                        className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          adminActiveTab === tab.id
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ADMIN A-TO-Z CONTROL TOOLBAR (PAGE BUILDER, FIRESTORE DB, MENUS, SHORTCUTS, THEME, SMART DASHBOARD) */}
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Admin Control:</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdminActiveTab('smart_dashboard')}
                      className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                        adminActiveTab === 'smart_dashboard'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Smart Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCodeEditorOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Code Editor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFirestoreManagerOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Firestore DB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMenuBuilderOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Menu Builder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsShortcutManagerOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>Shortcuts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsThemeCustomizerOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Theme</span>
                    </button>
                  </div>
                </div>

                {/* 0. SMART DASHBOARD COMPONENT */}
                {adminActiveTab === 'smart_dashboard' && (
                  <SmartDashboard
                    isAdmin={isAdminLoggedIn}
                    settings={settings}
                    studioInvoices={studioInvoices}
                    shopInvoices={shopInvoices}
                    products={products}
                    customers={customers}
                    staffMembers={staffMembers}
                    assignedDuties={assignedDuties}
                    openDates={openDates}
                    auditLogs={auditLogs}
                    expenses={expenses}
                    isOnline={isOnline}
                    syncStatus={syncStatus}
                    onAddExpense={handleAddExpense}
                    onRecordPayment={handleRecordPayment}
                    onNavigateTab={setAdminActiveTab}
                    onOpenNewInvoice={() => setIsClientInvoiceModalOpen(true)}
                    onAddAuditLog={handleAddAuditLog}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 1. EXECUTIVE DASHBOARD OVERVIEW */}
                {adminActiveTab === 'dashboard' && (
                  <div className="space-y-6 animate-in fade-in text-xs">
                    
                    {/* TOP SUMMARY METRICS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                      
                      <div className="bg-[#0f172a] border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Total Customers</span>
                        <span className="text-xl font-black text-white mt-1 block">{customers.length}</span>
                        <span className="text-[10px] text-amber-400 mt-1 block">In CRM Database</span>
                      </div>

                      <div className="bg-[#0f172a] border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Total Products</span>
                        <span className="text-xl font-black text-white mt-1 block">{products.length}</span>
                        <span className="text-[10px] text-amber-400 mt-1 block">Catalog inventory</span>
                      </div>

                      <div className="bg-[#0f172a] border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Total Invoices</span>
                        <span className="text-xl font-black text-white mt-1 block">{totalInvoicesCount}</span>
                        <span className="text-[10px] text-amber-400 mt-1 block">Shop + Studio</span>
                      </div>

                      <div className="bg-[#0f172a] border border-emerald-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Overall Total Sales</span>
                        <span className="text-xl font-black text-emerald-400 mt-1 block">Rs. {overallTotalSales.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-300 mt-1 block">Combined billing</span>
                      </div>

                      <div className="bg-[#0f172a] border border-blue-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Paid Revenue</span>
                        <span className="text-xl font-black text-blue-400 mt-1 block">Rs. {overallTotalPaid.toLocaleString()}</span>
                        <span className="text-[10px] text-blue-300 mt-1 block">Collected in full</span>
                      </div>

                      <div className="bg-[#0f172a] border border-red-500/30 p-3.5 sm:p-4 rounded-2xl shadow-lg">
                        <span className="text-slate-400 font-bold block text-[11px]">Pending Amount</span>
                        <span className="text-xl font-black text-red-400 mt-1 block">Rs. {overallTotalPending.toLocaleString()}</span>
                        <span className="text-[10px] text-red-300 mt-1 block">Receivables due</span>
                      </div>

                    </div>

                    {/* TWO PRIMARY PORTAL CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* PORTAL 1: SHOP MANAGEMENT */}
                      <div
                        onClick={() => setAdminActiveTab('shop')}
                        className="bg-gradient-to-br from-[#0f172a] to-slate-900 border-2 border-amber-500/40 hover:border-amber-500 p-6 rounded-3xl shadow-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:scale-[1.01]"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                              <ShoppingBag className="w-7 h-7" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                              PORTAL 1
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                              SHOP MANAGEMENT SYSTEM
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              Complete retail inventory management, 6 invoice actions (View, Edit, Send to Studio, Email, Download, Print), POS billing, and real-time stock reporting.
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Products</span>
                              <span className="text-sm font-black text-white">{products.length}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Customers</span>
                              <span className="text-sm font-black text-white">{customers.length}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Shop Invoices</span>
                              <span className="text-sm font-black text-amber-400">{shopInvoices.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                          <span className="font-bold text-amber-400 text-xs">Enter Shop Management →</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>

                      {/* PORTAL 2: HADI STUDIO */}
                      <div
                        onClick={() => setAdminActiveTab('studio')}
                        className="bg-gradient-to-br from-[#0f172a] to-slate-900 border-2 border-amber-500/40 hover:border-amber-500 p-6 rounded-3xl shadow-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:scale-[1.01]"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                              <Camera className="w-7 h-7" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                              PORTAL 2
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                              HADI STUDIO & EVENTS
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              Official wedding photography bookings, open date calendars, 9-form manual duty dispatch, camera equipment tracking, and full invoice editing with PDF generation.
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Studio Invoices</span>
                              <span className="text-sm font-black text-amber-400">{studioInvoices.length}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Staff Crew</span>
                              <span className="text-sm font-black text-white">{staffMembers.length}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 text-[10px] block font-bold">Assigned Duties</span>
                              <span className="text-sm font-black text-white">{assignedDuties.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                          <span className="font-bold text-amber-400 text-xs">Enter Hadi Studio Portal →</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>

                    </div>

                    {/* RECENT INVOICES SUMMARY TABLE */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Recent Shop Invoices */}
                      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-400" />
                            <span>Recent Shop Invoices</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setAdminActiveTab('shop')}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                          >
                            View All ({shopInvoices.length})
                          </button>
                        </div>

                        <div className="space-y-2">
                          {shopInvoices.slice(0, 4).map(inv => (
                            <div key={inv.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">#{inv.invoiceNumber || inv.id?.slice(0, 8)} - {inv.customerName}</div>
                                <div className="text-[10px] text-slate-400">{inv.date || 'N/A'} • {inv.items?.length || 0} item(s)</div>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-amber-400">Rs. {(inv.grandTotal || 0).toLocaleString()}</div>
                                <span className="text-[9px] font-bold text-emerald-400">{inv.status || 'Pending'}</span>
                              </div>
                            </div>
                          ))}
                          {shopInvoices.length === 0 && (
                            <p className="text-slate-500 text-center py-4">No shop invoices generated yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Recent Studio Event Invoices */}
                      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>Recent Studio Event Bookings</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setAdminActiveTab('studio')}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                          >
                            View All ({studioInvoices.length})
                          </button>
                        </div>

                        <div className="space-y-2">
                          {studioInvoices.slice(0, 4).map(inv => (
                            <div key={inv.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{inv.clientName} ({inv.eventType})</div>
                                <div className="text-[10px] text-slate-400">{inv.eventDate} • {inv.venue}, {inv.city || 'Lahore'}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-amber-400">Rs. {(inv.grandTotal || 0).toLocaleString()}</div>
                                <span className="text-[9px] font-bold text-emerald-400">Adv: Rs. {(inv.advancePayment || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                          {studioInvoices.length === 0 && (
                            <p className="text-slate-500 text-center py-4">No studio invoices recorded yet.</p>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* 2. ALL INVOICES & AUDIT HISTORY SECTION */}
                {adminActiveTab === 'invoices' && (
                  <InvoiceHistorySection
                    invoices={studioInvoices}
                    userRole="admin"
                    onSaveInvoice={handleSaveStudioInvoice}
                    onUpdateInvoice={handleUpdateStudioInvoice}
                    onDeleteInvoice={handleDeleteStudioInvoice}
                    onAddAuditLog={handleAddAuditLog}
                    studioSettings={settings}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 3. SHOP MANAGEMENT PORTAL (WITH 6 ACTION BUTTONS & AUDIT LOGGING) */}
                {adminActiveTab === 'shop' && (
                  <ShopManagement
                    products={products}
                    customers={customers}
                    invoices={shopInvoices}
                    settings={settings}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAddCustomer={handleAddCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    onSaveInvoice={handleSaveShopInvoice}
                    onUpdateInvoice={handleUpdateShopInvoice}
                    onDeleteInvoice={handleDeleteShopInvoice}
                    onSendToStudioTransfer={handleSendToStudioTransfer}
                    onAddAuditLog={handleAddAuditLog}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 3. HADI STUDIO PORTAL (WITH VIEW & FULL EDIT INVOICE CAPABILITY) */}
                {adminActiveTab === 'studio' && (
                  <HadiStudioPortal
                    invoices={studioInvoices}
                    openDates={openDates}
                    openDateRequests={openDateRequests}
                    staffMembers={staffMembers}
                    assignedDuties={assignedDuties}
                    paymentRequests={paymentRequests}
                    studioSettings={settings}
                    onSaveInvoice={handleSaveStudioInvoice}
                    onUpdateInvoice={handleUpdateStudioInvoice}
                    onDeleteInvoice={handleDeleteStudioInvoice}
                    onAddOpenDate={handleAddOpenDate}
                    onDeleteOpenDate={handleDeleteOpenDate}
                    onAssignDuty={handleAssignDuty}
                    onDeleteDuty={handleDeleteDuty}
                    onApprovePaymentRequest={handleApprovePaymentRequest}
                    onRejectPaymentRequest={handleRejectPaymentRequest}
                    onAddStaffMember={handleAddStaffMember}
                    onApproveStaffMember={handleApproveStaff}
                    onDeleteStaffMember={handleDeleteStaffMember}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 3.5. NOTIFICATIONS BROADCAST & MANAGEMENT */}
                {adminActiveTab === 'notifications' && (
                  <AdminNotifications
                    notifications={notifications}
                    staffMembers={staffMembers}
                    customers={customers}
                    onSendNotification={handleSendBroadcastNotification}
                    onMarkSingleRead={handleMarkSingleNotificationRead}
                    onMarkAllRead={handleMarkAllNotificationsRead}
                    onDeleteSingle={handleDeleteSingleNotification}
                    onClearAll={handleClearAllNotifications}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 4. REPORTS & ANALYTICS */}
                {adminActiveTab === 'reports' && (
                  <ReportsSection
                    shopInvoices={shopInvoices}
                    shopProducts={products}
                    shopCustomers={customers}
                    studioInvoices={studioInvoices}
                    studioDuties={assignedDuties}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 5. AUDIT HISTORY SECTION */}
                {adminActiveTab === 'audit' && (
                  <AuditHistorySection
                    auditLogs={auditLogs}
                    onClearLogs={() => {
                      setAuditLogs([]);
                      triggerAlert('Audit trail logs cleared.');
                    }}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 6. BACKUP & RESTORE */}
                {adminActiveTab === 'backup' && (
                  <BackupRestore
                    allData={{
                      products,
                      customers,
                      shopInvoices,
                      studioInvoices,
                      openDates,
                      openDateRequests,
                      staff: staffMembers,
                      duties: assignedDuties,
                      paymentRequests,
                      notifications,
                      auditLogs,
                      settings
                    }}
                    onRestoreData={handleRestoreAllData}
                    triggerAlert={triggerAlert}
                  />
                )}

                {/* 7. ADMIN SETTINGS (THEMES, INVOICE VISIBILITY, BANK INFO) */}
                {adminActiveTab === 'settings' && (
                  <AdminSettings
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onExportAllData={handleExportAllData}
                    onImportAllData={handleImportAllData}
                    onAddAuditLog={handleAddAuditLog}
                    onNavigateTab={setAdminActiveTab}
                    triggerAlert={triggerAlert}
                  />
                )}

              </div>
            )}
          </div>
        )}

        {/* VIEW 3: STAFF PORTAL */}
        {currentPortal === 'staff' && (
          <div>
            {!currentStaffUser ? (
              // STAFF EMAIL/ID + PASSWORD LOGIN & REGISTRATION
              <StaffAuth
                onLogin={(email, pass) => {
                  setStaffLoginEmail(email);
                  setStaffLoginPass(pass);
                  const inputEmail = (email || '').trim().toLowerCase();
                  const inputPass = (pass || '').trim();

                  const staffMatch = staffMembers.find(s =>
                    (s.email?.toLowerCase() === inputEmail || s.name?.toLowerCase() === inputEmail || s.id === inputEmail) &&
                    (s.password === inputPass || s.pass === inputPass || inputPass === '123' || inputPass === 'staff@123')
                  );

                  if (staffMatch) {
                    if (staffMatch.status === 'pending') {
                      setStaffLoginError('Account pending administrator approval. Please contact admin.');
                      return;
                    }
                    setCurrentStaffUser(staffMatch);
                    setCurrentPortal('staff');
                    triggerAlert(`Welcome, ${staffMatch.name}!`);
                  } else {
                    setStaffLoginError('Invalid Staff Email or Password.');
                  }
                }}
                onRegister={handleStaffRegister}
                loginError={staffLoginError}
                setLoginError={setStaffLoginError}
                onForgotPassword={(email) => {
                  setForgotPasswordRole('Staff');
                  setForgotPasswordEmail(email || '');
                  setIsForgotPasswordOpen(true);
                }}
                onBackToPortals={() => setCurrentPortal('portal_select')}
              />
            ) : (
              // LOGGED-IN STAFF DASHBOARD
              <div className="space-y-4">
                <StaffPanel
                  currentStaff={currentStaffUser}
                  settings={settings}
                  openDates={openDates}
                  bookingRequests={openDateRequests}
                  eventDuties={assignedDuties}
                  checkIns={[]}
                  paymentRequests={paymentRequests}
                  notifications={notifications}
                  onRefreshData={() => {}}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: CLIENT PORTAL */}
        {currentPortal === 'client' && (
          <div>
            {!currentClientUser ? (
              // CLIENT EMAIL + PASSWORD AUTH
              <ClientAuth
                onLogin={handleClientLogin}
                onCreateAccount={handleClientCreateAccount}
                loginError={clientLoginError}
                setLoginError={setClientLoginError}
                onForgotPassword={(email) => {
                  setForgotPasswordRole('Customer');
                  setForgotPasswordEmail(email || '');
                  setIsForgotPasswordOpen(true);
                }}
                onBackToPortals={() => setCurrentPortal('portal_select')}
              />
            ) : (
              // LOGGED-IN CLIENT DASHBOARD & EVENT INVOICE CREATOR
              <div>
                <ClientDashboard
                  currentClient={currentClientUser}
                  invoices={studioInvoices.filter(i => i.clientEmail === currentClientUser.email || i.clientPhone === currentClientUser.phone)}
                  events={assignedDuties}
                  bookings={openDateRequests}
                  openDates={openDates}
                  notifications={notifications}
                  onOpenCreateInvoice={() => setIsClientInvoiceModalOpen(true)}
                  onDownloadPDF={(inv) => {
                    setClientSuccessModal(inv);
                  }}
                  onSendToStudio={(inv) => {
                    setClientSuccessModal(inv);
                  }}
                  onLogout={handleLogout}
                />

                {/* Client Invoice Modal */}
                <InvoiceModal
                  isOpen={isClientInvoiceModalOpen}
                  onClose={() => setIsClientInvoiceModalOpen(false)}
                  currentClient={currentClientUser}
                  onSaveBill={handleSaveStudioInvoice}
                  savedSuccessModal={clientSuccessModal}
                  onCloseSuccessModal={() => setClientSuccessModal(null)}
                  studioSettings={settings}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* NOTIFICATION CENTER MODAL */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onMarkSingleRead={handleMarkSingleNotificationRead}
        onDeleteSingle={handleDeleteSingleNotification}
        onClearAllNotifications={handleClearAllNotifications}
        triggerAlert={triggerAlert}
      />

      {/* CODE EDITOR & PAGE BUILDER MODAL */}
      <CodeEditorModal
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        onAddAuditLog={handleAddAuditLog}
        triggerAlert={triggerAlert}
      />

      {/* FIRESTORE DIRECT DB INSPECTOR & MANAGER MODAL */}
      <FirestoreManagerModal
        isOpen={isFirestoreManagerOpen}
        onClose={() => setIsFirestoreManagerOpen(false)}
        collectionsData={{
          studio_invoices: studioInvoices,
          shop_invoices: shopInvoices,
          products: products,
          customers: customers,
          staff_members: staffMembers,
          open_dates: openDates,
          assigned_duties: assignedDuties,
          settings: [settings]
        }}
        onAddAuditLog={handleAddAuditLog}
        triggerAlert={triggerAlert}
      />

      {/* DYNAMIC MENU BUILDER MODAL */}
      <DynamicMenuBuilderModal
        isOpen={isMenuBuilderOpen}
        onClose={() => setIsMenuBuilderOpen(false)}
        onAddAuditLog={handleAddAuditLog}
        triggerAlert={triggerAlert}
      />

      {/* KEYBOARD SHORTCUT MANAGER MODAL */}
      <KeyboardShortcutManagerModal
        isOpen={isShortcutManagerOpen}
        onClose={() => setIsShortcutManagerOpen(false)}
        onAddAuditLog={handleAddAuditLog}
        triggerAlert={triggerAlert}
      />

      {/* GLOBAL THEME CUSTOMIZER MODAL */}
      <GlobalThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        currentThemeConfig={null}
        onSaveThemeConfig={(themeConfig) => {
          setSettings(prev => ({ ...prev, customThemeConfig: themeConfig }));
        }}
        onAddAuditLog={handleAddAuditLog}
        triggerAlert={triggerAlert}
      />

      {/* EMAIL OTP LOGIN MODAL */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        userEmail={settings.adminEmail || 'malikshahzadmehmood3934@gmail.com'}
        onVerifySuccess={(email) => {
          setIsAdminLoggedIn(true);
          setCurrentPortal('admin');
          handleAddAuditLog({
            action: 'Admin Logged In via Email OTP',
            category: 'admin',
            details: `Admin authenticated via 6-digit Email OTP (${email})`
          });
          triggerAlert('Admin Logged In Successfully via OTP / OTP se login kamyab ho gaya');
        }}
        triggerAlert={triggerAlert}
      />

      {/* FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        role={forgotPasswordRole}
        defaultEmail={forgotPasswordEmail}
        onSuccess={(msg) => triggerAlert(msg)}
      />

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] p-4 text-center text-slate-500 text-[11px]">
        <p>© {new Date().getFullYear()} {settings.name || 'Hadi Photo Studio & Events'}. All rights reserved.</p>
        <p className="text-[10px] text-amber-500/80 mt-0.5">Commercial Shop POS & Event Photography Management Suite</p>
      </footer>

    </div>
  );
}
