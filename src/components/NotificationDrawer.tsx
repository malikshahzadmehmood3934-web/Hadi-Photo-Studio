import React from 'react';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { AppNotification, UserRole, StaffMember } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  activeRole: UserRole | null;
  currentStaff: StaffMember | null;
  onMarkRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  activeRole,
  currentStaff,
  onMarkRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (activeRole === 'admin') return n.targetRole === 'admin' || n.targetRole === 'all';
    if (activeRole === 'staff') return n.targetRole === 'staff' || n.targetRole === 'all' || (currentStaff && n.staffId === currentStaff.id);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 text-slate-900 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0f172a] text-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base text-white">Studio Activity Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Total Notifications: {filteredNotifs.length}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkRead}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-semibold">No activity notifications yet.</p>
            </div>
          ) : (
            filteredNotifs.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                  !n.isRead
                    ? 'bg-blue-50/80 border-l-4 border-blue-500 border-slate-200 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-blue-600 text-[10px] uppercase tracking-wider">
                    {n.targetRole === 'admin' ? 'Studio Admin Alert' : 'Staff Alert'}
                  </span>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-slate-800 font-medium">{n.msg}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-[11px] text-slate-500 font-medium">
          Hadi Photo Studio Real-time Notification System
        </div>

      </div>
    </div>
  );
};
