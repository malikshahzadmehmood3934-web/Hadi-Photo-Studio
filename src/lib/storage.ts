import {
  StaffMember,
  OpenDate,
  BookingRequest,
  EventDuty,
  CheckIn,
  PaymentRequest,
  AppNotification,
  StudioSettings,
  DutyStatus
} from '../types';

const STORAGE_KEYS = {
  STAFF: 'hadi_studio_staff_v2',
  OPEN_DATES: 'hadi_studio_open_dates_v2',
  BOOKINGS: 'hadi_studio_bookings_v2',
  EVENTS: 'hadi_studio_events_v2',
  CHECKINS: 'hadi_studio_checkins_v2',
  PAYMENTS: 'hadi_studio_payments_v2',
  NOTIFICATIONS: 'hadi_studio_notifications_v2',
  SETTINGS: 'hadi_studio_settings_v2',
  CURRENT_USER: 'hadi_studio_current_user_v2'
};

const DEFAULT_SETTINGS: StudioSettings = {
  name: "HADI PHOTO STUDIO",
  contact: "0305-8304908",
  address: "Studio 14, Main Gulgasht Avenue, Multan, Pakistan",
  terms: `1. All staff members must reach the venue 30 minutes before event start.
2. Official Studio uniform/dress code & ID badge must be worn at all times.
3. Check-in via app upon arrival at venue is strictly mandatory.
4. Backup memory cards and dual-slot recording must be enabled.
5. Raw data must be handed over to studio within 12 hours after event completion.
6. Advance payment requests must be submitted at least 24 hours prior to duty.`,
  adminEmail: "shahzad123",
  adminPass: "admin@123",
  currency: "Rs."
};

const SEED_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Muhammad Ali Raza',
    phone: '03001234567',
    password: 'staff123',
    role: 'staff',
    specialty: 'Lead Photographer & Drone Specialist',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'staff-2',
    name: 'Usman Khan',
    phone: '03019876543',
    password: 'staff123',
    role: 'staff',
    specialty: 'Candid Videographer',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'staff-3',
    name: 'Hamza Tariq',
    phone: '03058304908',
    password: 'staff123',
    role: 'staff',
    specialty: 'Assistant Cameraman',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

const SEED_OPEN_DATES: OpenDate[] = [
  {
    id: 'open-1',
    date: '2026-08-20',
    shift: 'Night',
    type: 'Both',
    locName: 'Al Jannat Marriage Hall',
    locAdd: 'Near Northern Bypass',
    city: 'Multan',
    payment: 15000,
    advance: 3000,
    desc: 'Grand Baraat event. Requires 1 Lead Photo + 1 Video Cam.',
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'open-2',
    date: '2026-08-22',
    shift: 'Day',
    type: 'Photo Cam',
    locName: 'Royal Palm Banquet',
    locAdd: 'Bosan Road',
    city: 'Multan',
    payment: 10000,
    advance: 2000,
    desc: 'Walima Lunch Ceremony. Studio gear provided.',
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'open-3',
    date: '2026-08-25',
    shift: 'Night',
    type: 'Video Cam',
    locName: 'Pearl Continental',
    locAdd: 'Mall Road',
    city: 'Lahore',
    payment: 22000,
    advance: 5000,
    desc: 'Destination wedding shoot. Travel allowance included.',
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const SEED_EVENTS: EventDuty[] = [
  {
    id: 'event-1',
    staffId: 'staff-1',
    type: 'Baraat',
    date: '2026-08-15',
    shift: 'Night',
    locName: 'Imperial Marquee',
    locAdd: 'Khanewal Road',
    city: 'Multan',
    payment: 18000,
    advance: 4000,
    role: 'Lead Photographer',
    status: 'YES',
    source: 'Manual',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'event-2',
    staffId: 'staff-2',
    type: 'Walima',
    date: '2026-08-16',
    shift: 'Day',
    locName: 'Crown Banquet',
    locAdd: 'Vehari Road',
    city: 'Multan',
    payment: 12000,
    advance: 3000,
    role: 'Lead Videographer',
    status: 'Pending',
    source: 'Manual',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'event-3',
    staffId: 'staff-3',
    type: 'Nikkah',
    date: '2026-08-18',
    shift: 'Night',
    locName: 'Grand Palace',
    locAdd: 'Cantt Avenue',
    city: 'Multan',
    payment: 9000,
    advance: 2000,
    role: 'Assistant Cameraman',
    status: 'YES',
    source: 'Manual',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    msg: 'New Open Date published: 2026-08-20 Night (Both) in Multan',
    timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
    targetRole: 'staff',
    isRead: false
  },
  {
    id: 'notif-2',
    msg: 'Muhammad Ali Raza confirmed YES for Baraat event on 2026-08-15',
    timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
    targetRole: 'admin',
    isRead: false
  }
];

// Load / Initialize helper
function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return defaultVal;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('hadi_storage_change'));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
}

export const StorageService = {
  // Staff
  getStaff: (): StaffMember[] => getItem(STORAGE_KEYS.STAFF, SEED_STAFF),
  saveStaff: (staff: StaffMember[]) => setItem(STORAGE_KEYS.STAFF, staff),
  addStaffMember: (member: Omit<StaffMember, 'id' | 'createdAt'>): StaffMember => {
    const list = StorageService.getStaff();
    const newMember: StaffMember = {
      ...member,
      id: 'staff-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.push(newMember);
    StorageService.saveStaff(list);
    return newMember;
  },
  deleteStaffMember: (id: string) => {
    const list = StorageService.getStaff().filter(s => s.id !== id);
    StorageService.saveStaff(list);
  },

  // Open Dates
  getOpenDates: (): OpenDate[] => getItem(STORAGE_KEYS.OPEN_DATES, SEED_OPEN_DATES),
  saveOpenDates: (dates: OpenDate[]) => setItem(STORAGE_KEYS.OPEN_DATES, dates),
  publishOpenDate: (data: Omit<OpenDate, 'id' | 'status' | 'createdAt'>): OpenDate => {
    const list = StorageService.getOpenDates();
    const newOpenDate: OpenDate = {
      ...data,
      id: 'open-' + Date.now(),
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    list.unshift(newOpenDate);
    StorageService.saveOpenDates(list);

    // Notify staff
    StorageService.addNotification({
      msg: `New Open Date: ${newOpenDate.date} (${newOpenDate.shift}) - ${newOpenDate.type} at ${newOpenDate.locName}, ${newOpenDate.city}`,
      targetRole: 'staff'
    });

    return newOpenDate;
  },
  deleteOpenDate: (id: string) => {
    const list = StorageService.getOpenDates().filter(o => o.id !== id);
    StorageService.saveOpenDates(list);
  },

  // Booking Requests
  getBookings: (): BookingRequest[] => getItem(STORAGE_KEYS.BOOKINGS, []),
  saveBookings: (bookings: BookingRequest[]) => setItem(STORAGE_KEYS.BOOKINGS, bookings),
  requestBooking: (staffId: string, openDateId: string) => {
    const list = StorageService.getBookings();
    const staff = StorageService.getStaff().find(s => s.id === staffId);
    const openDate = StorageService.getOpenDates().find(o => o.id === openDateId);
    
    const newReq: BookingRequest = {
      id: 'booking-' + Date.now(),
      staffId,
      openDateId,
      status: 'Requested',
      createdAt: new Date().toISOString()
    };
    list.unshift(newReq);
    StorageService.saveBookings(list);

    StorageService.addNotification({
      msg: `${staff?.name || 'Staff'} requested to book open date: ${openDate?.date || ''} (${openDate?.shift || ''})`,
      targetRole: 'admin'
    });
  },

  confirmBookingRequest: (bookingId: string) => {
    const bookings = StorageService.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    booking.status = 'Confirmed';
    StorageService.saveBookings(bookings);

    // Update Open Date status to Booked
    const openDates = StorageService.getOpenDates();
    const openDate = openDates.find(o => o.id === booking.openDateId);
    if (openDate) {
      openDate.status = 'Booked';
      StorageService.saveOpenDates(openDates);

      // Create assigned event
      StorageService.addEventDuty({
        staffId: booking.staffId,
        type: openDate.type,
        date: openDate.date,
        shift: openDate.shift,
        locName: openDate.locName,
        locAdd: openDate.locAdd,
        city: openDate.city,
        payment: openDate.payment,
        advance: openDate.advance,
        role: openDate.type + ' Crew',
        status: 'YES',
        source: 'OpenDate'
      });

      // Notify Staff
      StorageService.addNotification({
        msg: `Your booking request for ${openDate.date} (${openDate.shift}) has been CONFIRMED by Studio Admin!`,
        targetRole: 'staff',
        staffId: booking.staffId
      });
    }
  },

  rejectBookingRequest: (bookingId: string) => {
    const bookings = StorageService.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    booking.status = 'Rejected';
    StorageService.saveBookings(bookings);

    const openDate = StorageService.getOpenDates().find(o => o.id === booking.openDateId);
    StorageService.addNotification({
      msg: `Your booking request for ${openDate?.date || 'open date'} was rejected.`,
      targetRole: 'staff',
      staffId: booking.staffId
    });
  },

  // Events / Duties
  getEventDuties: (): EventDuty[] => getItem(STORAGE_KEYS.EVENTS, SEED_EVENTS),
  saveEventDuties: (events: EventDuty[]) => setItem(STORAGE_KEYS.EVENTS, events),
  addEventDuty: (data: Omit<EventDuty, 'id' | 'createdAt'>): EventDuty => {
    const list = StorageService.getEventDuties();
    const newEvent: EventDuty = {
      ...data,
      id: 'event-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newEvent);
    StorageService.saveEventDuties(list);

    const staff = StorageService.getStaff().find(s => s.id === data.staffId);
    StorageService.addNotification({
      msg: `Duty assigned to ${staff?.name || 'Staff'}: ${data.type} on ${data.date} (${data.shift}) at ${data.locName}`,
      targetRole: 'all',
      staffId: data.staffId
    });

    return newEvent;
  },

  respondDuty: (eventId: string, status: DutyStatus, reason?: string) => {
    const events = StorageService.getEventDuties();
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    event.status = status;
    if (reason) event.declineReason = reason;
    StorageService.saveEventDuties(events);

    const staff = StorageService.getStaff().find(s => s.id === event.staffId);
    StorageService.addNotification({
      msg: `Staff ${staff?.name || 'Member'} responded [${status}] for ${event.type} on ${event.date}.${reason ? ` Reason: ${reason}` : ''}`,
      targetRole: 'admin'
    });
  },

  // CheckIns
  getCheckIns: (): CheckIn[] => getItem(STORAGE_KEYS.CHECKINS, []),
  saveCheckIns: (checkins: CheckIn[]) => setItem(STORAGE_KEYS.CHECKINS, checkins),
  addCheckIn: (data: Omit<CheckIn, 'id' | 'timestamp'>): CheckIn => {
    const list = StorageService.getCheckIns();
    const timeStr = new Date().toLocaleString();
    const newCheckin: CheckIn = {
      ...data,
      id: 'checkin-' + Date.now(),
      timestamp: timeStr
    };
    list.unshift(newCheckin);
    StorageService.saveCheckIns(list);

    StorageService.addNotification({
      msg: `📍 VENUE CHECK-IN: ${data.staffName} reached venue "${data.location}" at ${timeStr}`,
      targetRole: 'admin'
    });

    return newCheckin;
  },

  // Payment Requests
  getPaymentRequests: (): PaymentRequest[] => getItem(STORAGE_KEYS.PAYMENTS, []),
  savePaymentRequests: (payments: PaymentRequest[]) => setItem(STORAGE_KEYS.PAYMENTS, payments),
  requestPayment: (data: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): PaymentRequest => {
    const list = StorageService.getPaymentRequests();
    const newReq: PaymentRequest = {
      ...data,
      id: 'pay-' + Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    list.unshift(newReq);
    StorageService.savePaymentRequests(list);

    StorageService.addNotification({
      msg: `💰 Payment Advance Request from ${data.staffName}: Rs. ${data.amount} via ${data.method}`,
      targetRole: 'admin'
    });

    return newReq;
  },

  approvePaymentRequest: (payId: string) => {
    const list = StorageService.getPaymentRequests();
    const pay = list.find(p => p.id === payId);
    if (!pay) return;

    pay.status = 'Approved';
    StorageService.savePaymentRequests(list);

    StorageService.addNotification({
      msg: `Your payment request of Rs. ${pay.amount} via ${pay.method} has been APPROVED!`,
      targetRole: 'staff',
      staffId: pay.staffId
    });
  },

  rejectPaymentRequest: (payId: string) => {
    const list = StorageService.getPaymentRequests();
    const pay = list.find(p => p.id === payId);
    if (!pay) return;

    pay.status = 'Rejected';
    StorageService.savePaymentRequests(list);

    StorageService.addNotification({
      msg: `Your payment request of Rs. ${pay.amount} was rejected.`,
      targetRole: 'staff',
      staffId: pay.staffId
    });
  },

  // Notifications
  getNotifications: (): AppNotification[] => getItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
  saveNotifications: (notifs: AppNotification[]) => setItem(STORAGE_KEYS.NOTIFICATIONS, notifs),
  addNotification: (data: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const list = StorageService.getNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      isRead: false
    };
    list.unshift(newNotif);
    StorageService.saveNotifications(list);
  },
  markNotificationsAsRead: (role: 'admin' | 'staff', staffId?: string) => {
    const list = StorageService.getNotifications();
    let updated = false;
    list.forEach(n => {
      if (!n.isRead && (n.targetRole === 'all' || n.targetRole === role || (staffId && n.staffId === staffId))) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) StorageService.saveNotifications(list);
  },

  // Settings
  getSettings: (): StudioSettings => getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: StudioSettings) => setItem(STORAGE_KEYS.SETTINGS, settings),

  // Reset demo state
  resetAllData: () => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(SEED_STAFF));
    localStorage.setItem(STORAGE_KEYS.OPEN_DATES, JSON.stringify(SEED_OPEN_DATES));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    window.dispatchEvent(new Event('hadi_storage_change'));
  }
};
