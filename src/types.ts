export type UserRole = 'admin' | 'staff';

export type EventType = 
  | 'Mayo' 
  | 'Nikkah' 
  | 'Baraat' 
  | 'Walima' 
  | 'Birthday' 
  | 'School Event' 
  | 'Corporate Event' 
  | 'Pre-Wedding' 
  | 'Other';

export type ShiftType = 'Day' | 'Night';

export type CoverageType = 'Video Cam' | 'Photo Cam' | 'Both';

export type DutyStatus = 'Pending' | 'YES' | 'NO' | 'Completed';

export type OpenDateStatus = 'Open' | 'Booked' | 'Cancelled';

export type BookingStatus = 'Requested' | 'Confirmed' | 'Rejected';

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export type PaymentMethod = 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Cash';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: 'staff';
  specialty?: string; // e.g. Lead Photographer, Videographer, Drone Operator, Assistant
  createdAt: string;
}

export interface OpenDate {
  id: string;
  date: string;
  shift: ShiftType;
  type: CoverageType;
  locName: string;
  locAdd: string;
  city: string;
  payment: number;
  advance: number;
  desc?: string;
  status: OpenDateStatus;
  createdAt: string;
}

export interface BookingRequest {
  id: string;
  staffId: string;
  openDateId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface EventDuty {
  id: string;
  staffId: string;
  type: string; // Event type or custom name
  date: string;
  shift: ShiftType;
  locName: string;
  locAdd: string;
  city?: string;
  payment: number;
  advance: number;
  role?: string;
  status: DutyStatus;
  declineReason?: string;
  source?: 'OpenDate' | 'Manual';
  createdAt: string;
}

export interface CheckIn {
  id: string;
  eventId: string;
  staffId: string;
  staffName: string;
  location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface PaymentRequest {
  id: string;
  staffId: string;
  staffName: string;
  eventId: string;
  amount: number;
  method: PaymentMethod;
  title: string;
  account: string;
  reason: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  msg: string;
  timestamp: string;
  targetRole?: 'admin' | 'staff' | 'all';
  staffId?: string;
  isRead?: boolean;
}

export interface StudioSettings {
  name: string;
  contact: string;
  address?: string;
  terms: string;
  adminEmail: string;
  adminPass: string;
  currency: string;
}
