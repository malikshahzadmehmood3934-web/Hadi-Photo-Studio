import React, { useState } from 'react';
import {
  Palette,
  Eye,
  CheckCircle2,
  Save,
  RotateCcw,
  X,
  Sparkles,
  Sliders
} from 'lucide-react';

const DEFAULT_THEME_COLORS = {
  primaryGold: '#f59e0b',
  secondaryGold: '#d97706',
  darkBg: '#020617',
  panelBg: '#0f172a',
  cardBg: '#1e293b',
  textColor: '#f8fafc',
  accentBorder: '#f59e0b',
  buttonBg: '#f59e0b',
  buttonText: '#000000'
};

export default function GlobalThemeCustomizerModal({
  isOpen,
  onClose,
  currentThemeConfig,
  onSaveThemeConfig,
  onAddAuditLog,
  triggerAlert
}) {
  const [colors, setColors] = useState(() => {
    return currentThemeConfig || DEFAULT_THEME_COLORS;
  });

  const handleChangeColor = (key, val) => {
    setColors(prev => ({ ...prev, [key]: val }));
  };

  const handleResetDefaults = () => {
    setColors(DEFAULT_THEME_COLORS);
    triggerAlert?.('Reset to Luxury Gold & Dark Theme defaults / Default colors set ho gaye');
  };

  const handleSave = () => {
    onSaveThemeConfig(colors);
    localStorage.setItem('hadi_custom_theme_colors', JSON.stringify(colors));
    onAddAuditLog?.({
      action: 'Global Theme Palette Updated',
      category: 'admin',
      details: 'Admin updated custom application color palette & gold accents'
    });
    triggerAlert?.('Global Theme saved successfully! / Theme colors apply ho gaye');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                GLOBAL THEME & BRANDING DESIGNER
              </h2>
              <p className="text-xs text-slate-400">
                Customize Premium Gold, Dark Canvas, Panel Tones & Accent Highlights with Live Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column: Color Controls & Live Preview */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
          {/* Color Pickers */}
          <div className="space-y-4 text-xs">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4" />
              <span>Palette Configuration</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary Metallic Gold</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.primaryGold}
                    onChange={(e) => handleChangeColor('primaryGold', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.primaryGold}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Secondary Amber / Gold</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.secondaryGold}
                    onChange={(e) => handleChangeColor('secondaryGold', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.secondaryGold}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Main App Background</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.darkBg}
                    onChange={(e) => handleChangeColor('darkBg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.darkBg}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Panels & Sidebars</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.panelBg}
                    onChange={(e) => handleChangeColor('panelBg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.panelBg}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Card Containers</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.cardBg}
                    onChange={(e) => handleChangeColor('cardBg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.cardBg}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary Text</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.textColor}
                    onChange={(e) => handleChangeColor('textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.textColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary Button BG</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.buttonBg}
                    onChange={(e) => handleChangeColor('buttonBg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.buttonBg}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Accent Border</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={colors.accentBorder}
                    onChange={(e) => handleChangeColor('accentBorder', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{colors.accentBorder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="flex flex-col">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800 text-xs mb-3">
              <Eye className="w-4 h-4" />
              <span>Live Application Preview</span>
            </div>

            <div
              className="flex-1 p-5 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.accentBorder,
                color: colors.textColor
              }}
            >
              <div className="space-y-3">
                <div
                  className="p-3 rounded-xl flex items-center justify-between border"
                  style={{
                    backgroundColor: colors.panelBg,
                    borderColor: `${colors.accentBorder}40`
                  }}
                >
                  <span className="font-black text-sm" style={{ color: colors.primaryGold }}>
                    HADI STUDIO & EVENTS
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: `${colors.primaryGold}20`,
                      color: colors.primaryGold
                    }}
                  >
                    Connected
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl border space-y-2"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: `${colors.accentBorder}30`
                  }}
                >
                  <div className="text-xs font-bold" style={{ color: colors.primaryGold }}>
                    Executive Dashboard Card
                  </div>
                  <div className="text-xl font-black">Rs. 450,000</div>
                  <div className="text-[11px] opacity-70">
                    Total Booking Invoices this month
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 px-3 rounded-xl font-black text-xs shadow-lg transition"
                  style={{
                    backgroundColor: colors.buttonBg,
                    color: colors.buttonText
                  }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="py-2 px-3 rounded-xl font-bold text-xs border transition"
                  style={{
                    backgroundColor: colors.panelBg,
                    borderColor: `${colors.accentBorder}50`,
                    color: colors.textColor
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>SAVE & APPLY THEME</span>
          </button>
        </div>
      </div>
    </div>
  );
}
