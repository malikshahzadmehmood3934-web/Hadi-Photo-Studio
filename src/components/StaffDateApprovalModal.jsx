import React, { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCheck,
  Clock,
  PhoneCall,
  HardDrive
} from 'lucide-react';

export default function StaffDateApprovalModal({
  isOpen,
  onClose,
  booking,
  currentStaff,
  onConfirmApproval,
  onAddAuditLog,
  triggerAlert
}) {
  const [cameraModel, setCameraModel] = useState('Sony A7IV');
  const [cameraName, setCameraName] = useState('Rig Alpha 1');
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cameraModel.trim() || !cameraName.trim()) {
      triggerAlert?.('Please enter Camera Model and Camera Name / Camera ka model aur naam likhein', 'error');
      return;
    }

    if (!termsAccepted) {
      triggerAlert?.('You must acknowledge and accept all 5 Staff Terms / Staff sharaait par ittefaq lazmi hai', 'error');
      return;
    }

    onConfirmApproval?.({
      bookingId: booking.id,
      cameraModel: cameraModel.trim(),
      cameraName: cameraName.trim(),
      termsAcceptedAt: new Date().toISOString()
    });

    onAddAuditLog?.({
      action: 'Staff Date Approved & Terms Accepted',
      category: 'staff',
      details: `${currentStaff?.name || 'Staff'} confirmed event "${booking.eventName || booking.type}" on ${booking.date} with Camera: ${cameraModel} (${cameraName}). Accepted all 5 Staff Terms.`
    });

    triggerAlert?.('Event date accepted & equipment confirmed! / Duty confirm ho gayi');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                STAFF DUTY ACCEPTANCE & GEAR CONFIRMATION
              </h2>
              <p className="text-xs text-blue-400">
                {booking.eventName || booking.type} — {booking.date} ({booking.shift || 'Full Day'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Equipment Fields */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>ASSIGNED EQUIPMENT & CAMERA GEAR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Camera Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony A7IV / FX3"
                  value={cameraModel}
                  onChange={(e) => setCameraModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Camera Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Body 01 / Studio Rig A"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Mandatory 5 Staff Terms */}
          <div className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-xl space-y-3">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>OFFICIAL STAFF TERMS & CONDITIONS</span>
            </div>

            <ol className="space-y-2 text-slate-200 list-decimal list-inside leading-relaxed text-[11px]">
              <li>
                <strong className="text-white">Check your equipment</strong> before leaving home (Batteries, Cards, Lenses, Lights).
              </li>
              <li>
                <strong className="text-white">Reach location 30 minutes before</strong> event scheduled time.
              </li>
              <li>
                <strong className="text-white">Call admin</strong> immediately after reaching the venue.
              </li>
              <li>
                <strong className="text-white">If late</strong>, immediately safe-backup all shoot data.
              </li>
              <li>
                <strong className="text-red-400">If staff deletes data</strong>, fine of Rs. 10,000 per day will apply.
              </li>
            </ol>

            <label className="flex items-start gap-2.5 pt-2 border-t border-amber-500/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-0"
              />
              <span className="text-amber-200 font-bold">
                I have read and solemnly agree to all 5 Hadi Studio Staff Terms. (Main sharaait qabool karta hoon)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!termsAccepted}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-black rounded-xl flex items-center gap-2 shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM & ACCEPT DUTY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
