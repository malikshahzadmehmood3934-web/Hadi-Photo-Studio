import React from 'react';
import { Camera, ShieldCheck, UserCheck, Bell, LogOut, RefreshCw } from 'lucide-react';
import { StudioSettings, UserRole, StaffMember, AppNotification } from '../types';

interface NavbarProps {
  settings: StudioSettings;
  activeRole: UserRole | null;
  currentStaff: StaffMember | null;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onLogout: () => void;
  onSwitchPortal: (role: UserRole) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeRole,
  currentStaff,
  notifications,
  onOpenNotifications,
  onLogout,
  onSwitchPortal,
  onResetData
}) => {
  const unreadCount = notifications.filter(n => {
    if (n.isRead) return false;
    if (activeRole === 'admin') return n.targetRole === 'admin' || n.targetRole === 'all';
    if (activeRole === 'staff') return n.targetRole === 'staff' || n.targetRole === 'all' || (currentStaff && n.staffId === currentStaff.id);
    return false;
  }).length;

  return (
    <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSwitchPortal('admin')}>
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              {settings.name || 'HADI PHOTO STUDIO'}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
              Admin & Duty Management
            </p>
          </div>
        </div>

        {/* Portal Switcher & User Control */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Active Role Selector Pills */}
          <div className="hidden md:flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              onClick={() => onSwitchPortal('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                activeRole === 'admin'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => onSwitchPortal('staff')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                activeRole === 'staff'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset to initial studio demo data"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset Data</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Logout */}
          {activeRole && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">
                  {activeRole === 'admin' ? 'Shahzad Ahmed' : currentStaff?.name || 'Staff User'}
                </p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                  {activeRole === 'admin' ? 'Studio Owner' : currentStaff?.phone || 'Logged In'}
                </p>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
