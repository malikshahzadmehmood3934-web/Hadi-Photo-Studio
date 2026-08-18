import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
  X,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const DEFAULT_MENUS = [
  { id: 'dashboard', name: 'Executive Dashboard', icon: 'Layers', enabled: true, role: 'all', path: 'dashboard' },
  { id: 'invoices', name: 'All Invoices & History', icon: 'FileText', enabled: true, role: 'all', path: 'invoices' },
  { id: 'shop', name: 'Shop Management', icon: 'ShoppingBag', enabled: true, role: 'admin', path: 'shop' },
  { id: 'studio', name: 'Hadi Studio Portal', icon: 'Camera', enabled: true, role: 'all', path: 'studio' },
  { id: 'reports', name: 'Reports & Analytics', icon: 'BarChart3', enabled: true, role: 'admin', path: 'reports' },
  { id: 'audit', name: 'Activity Log', icon: 'Activity', enabled: true, role: 'admin', path: 'audit' },
  { id: 'backup', name: 'Data Backup & Restore', icon: 'HardDrive', enabled: true, role: 'admin', path: 'backup' },
  { id: 'settings', name: 'Admin Control Settings', icon: 'Settings', enabled: true, role: 'admin', path: 'settings' }
];

export default function DynamicMenuBuilderModal({
  isOpen,
  onClose,
  onAddAuditLog,
  triggerAlert
}) {
  const [menus, setMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('hadi_custom_menus');
      return saved ? JSON.parse(saved) : DEFAULT_MENUS;
    } catch {
      return DEFAULT_MENUS;
    }
  });

  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuRole, setNewMenuRole] = useState('all');

  const handleToggleMenu = (id) => {
    setMenus(prev =>
      prev.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const next = [...menus];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setMenus(next);
  };

  const handleMoveDown = (index) => {
    if (index === menus.length - 1) return;
    const next = [...menus];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setMenus(next);
  };

  const handleAddMenu = () => {
    if (!newMenuName.trim()) {
      triggerAlert?.('Enter menu name / Menu ka naam likhein', 'error');
      return;
    }
    const id = `custom_${Date.now()}`;
    const newMenu = {
      id,
      name: newMenuName.trim(),
      icon: 'Layers',
      enabled: true,
      role: newMenuRole,
      path: id,
      isCustom: true
    };
    setMenus(prev => [...prev, newMenu]);
    setNewMenuName('');
    triggerAlert?.(`Custom menu "${newMenu.name}" added / Naya menu add ho gaya`);
  };

  const handleDeleteMenu = (id) => {
    if (window.confirm('Are you sure you want to delete this menu item? / Kya aap ye menu delete karna chahte hain?')) {
      setMenus(prev => prev.filter(m => m.id !== id));
      triggerAlert?.('Menu item deleted / Menu delete ho gaya');
    }
  };

  const handleSave = () => {
    localStorage.setItem('hadi_custom_menus', JSON.stringify(menus));
    onAddAuditLog?.({
      action: 'Dynamic Menus Updated',
      category: 'admin',
      details: `Admin customized navigation menu arrangement (${menus.length} active items)`
    });
    triggerAlert?.('Navigation menu saved successfully! / Menu structure save ho gaya');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg">
              <MenuIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                DYNAMIC MENU & NAVIGATION BUILDER
              </h2>
              <p className="text-xs text-slate-400">
                Add, reorder, hide/show navigation menus & assign access permissions
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

        {/* Menu Items List */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-2">
          {menus.map((m, index) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                m.enabled
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500 w-5">
                  {index + 1}.
                </span>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {m.name}
                    {m.isCustom && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Access: <span className="text-amber-400 uppercase font-bold">{m.role}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleMenu(m.id)}
                  className={`p-1.5 rounded-lg border transition ${
                    m.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={m.enabled ? 'Visible' : 'Hidden'}
                >
                  {m.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === menus.length - 1}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {m.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(m.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                    title="Delete Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Menu Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="New Menu Title (e.g. Studio Portfolio)..."
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />

          <select
            value={newMenuRole}
            onChange={(e) => setNewMenuRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Accessible to All</option>
            <option value="admin">Admin Only</option>
            <option value="staff">Staff & Admin</option>
          </select>

          <button
            type="button"
            onClick={handleAddMenu}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>SAVE MENUS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
