import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to permanently delete this item? This action cannot be undone and will be recorded in the system audit log.',
  itemName = '',
  itemType = 'Record'
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-red-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Top Warning Bar */}
        <div className="p-4 bg-gradient-to-r from-red-950/80 to-slate-900 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Admin Security Protocol</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">{message}</p>

          {itemName && (
            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
              <span className="text-[10px] text-red-400/90 font-bold uppercase tracking-wider block mb-1">
                Target {itemType}:
              </span>
              <p className="text-white font-bold break-all">{itemName}</p>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>This deletion will be permanently logged in the Admin Audit History.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center gap-1.5 transition-all shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Confirm & Delete'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
