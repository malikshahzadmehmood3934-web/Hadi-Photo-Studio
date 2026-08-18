import React, { useState } from 'react';
import {
  Keyboard,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  X,
  Sparkles,
  Command
} from 'lucide-react';

const DEFAULT_SHORTCUTS = [
  { id: 'sc_new_invoice', keyCombination: 'Ctrl + N', actionName: 'Open New Invoice Modal', enabled: true },
  { id: 'sc_print', keyCombination: 'Ctrl + P', actionName: 'Print Active Invoice / Report', enabled: true },
  { id: 'sc_save', keyCombination: 'Ctrl + S', actionName: 'Save Changes / Synchronize', enabled: true },
  { id: 'sc_search', keyCombination: 'Ctrl + F', actionName: 'Search Invoices & Customers', enabled: true },
  { id: 'sc_dashboard', keyCombination: 'Ctrl + D', actionName: 'Navigate to Executive Dashboard', enabled: true },
  { id: 'sc_studio', keyCombination: 'Ctrl + Shift + S', actionName: 'Jump to Studio Portal', enabled: true }
];

export default function KeyboardShortcutManagerModal({
  isOpen,
  onClose,
  onAddAuditLog,
  triggerAlert
}) {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem('hadi_shortcuts');
      return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });

  const [newKey, setNewKey] = useState('');
  const [newAction, setNewAction] = useState('');

  const handleToggle = (id) => {
    setShortcuts(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAdd = () => {
    if (!newKey.trim() || !newAction.trim()) {
      triggerAlert?.('Enter Key and Action / Shortcut key aur action likhein', 'error');
      return;
    }
    const newSc = {
      id: `sc_${Date.now()}`,
      keyCombination: newKey.trim(),
      actionName: newAction.trim(),
      enabled: true
    };
    setShortcuts(prev => [...prev, newSc]);
    setNewKey('');
    setNewAction('');
    triggerAlert?.('New shortcut registered / Shortcut add ho gaya');
  };

  const handleDelete = (id) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
    triggerAlert?.('Shortcut deleted / Shortcut delete ho gaya');
  };

  const handleSave = () => {
    localStorage.setItem('hadi_shortcuts', JSON.stringify(shortcuts));
    onAddAuditLog?.({
      action: 'Shortcuts Updated',
      category: 'admin',
      details: `Admin customized system keyboard shortcuts (${shortcuts.length} bindings)`
    });
    triggerAlert?.('Keyboard shortcuts saved / Shortcuts save ho gaye');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                KEYBOARD SHORTCUT MANAGER
              </h2>
              <p className="text-xs text-slate-400">
                Configure hotkeys for fast desktop studio operation (Ctrl+N, Ctrl+P, etc.)
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

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-2">
          {shortcuts.map(sc => (
            <div
              key={sc.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                sc.enabled
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs rounded-lg">
                  {sc.keyCombination}
                </span>
                <span className="text-xs font-medium text-slate-200">{sc.actionName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(sc.id)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition ${
                    sc.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {sc.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sc.id)}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Shortcut Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Key (e.g. Ctrl + Shift + B)..."
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full md:w-44 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />

          <input
            type="text"
            placeholder="Action Description..."
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>SAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
