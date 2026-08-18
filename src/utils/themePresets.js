// 10 Distinct Professional Invoice Themes
export const INVOICE_THEMES = [
  {
    id: 'classic',
    name: '1. Classic Monochrome',
    description: 'Crisp monochrome slate with traditional serif headers and formal borders',
    headerBg: 'bg-slate-900 text-white',
    accentColor: '#1e293b',
    borderColor: 'border-slate-300',
    tableHeaderBg: 'bg-slate-100 text-slate-900',
    badgeClass: 'bg-slate-800 text-white',
    fontStyle: 'font-serif',
    cardBorder: 'border-2 border-slate-900',
    headerBanner: 'bg-slate-950 text-white p-6 border-b-4 border-slate-800'
  },
  {
    id: 'modern',
    name: '2. Modern Indigo',
    description: 'Minimalist indigo & slate layout with sleek divider lines and pill badges',
    headerBg: 'bg-indigo-600 text-white',
    accentColor: '#4f46e5',
    borderColor: 'border-indigo-100',
    tableHeaderBg: 'bg-indigo-50/80 text-indigo-950',
    badgeClass: 'bg-indigo-600 text-white rounded-full',
    fontStyle: 'font-sans',
    cardBorder: 'border border-indigo-100 shadow-sm',
    headerBanner: 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 rounded-xl'
  },
  {
    id: 'elegant',
    name: '3. Elegant Rose Gold',
    description: 'Refined warm champagne gold and rose accents with delicate typography',
    headerBg: 'bg-stone-900 text-amber-200',
    accentColor: '#d97706',
    borderColor: 'border-amber-200/60',
    tableHeaderBg: 'bg-amber-50/60 text-amber-950',
    badgeClass: 'bg-amber-700 text-white',
    fontStyle: 'font-serif',
    cardBorder: 'border border-amber-300/80 shadow-md',
    headerBanner: 'bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-amber-100 p-6 border-b-2 border-amber-500'
  },
  {
    id: 'black_gold',
    name: '4. Luxury Black & Gold',
    description: 'High-end obsidian luxury with bold metallic gold borders and badges',
    headerBg: 'bg-black text-amber-400',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/40',
    tableHeaderBg: 'bg-slate-900 text-amber-300',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black',
    fontStyle: 'font-sans',
    cardBorder: 'border-2 border-amber-500/60 shadow-xl bg-slate-950 text-white',
    headerBanner: 'bg-black text-amber-400 p-6 border-b-4 border-amber-500 flex justify-between items-center'
  },
  {
    id: 'royal',
    name: '5. Royal Navy & Violet',
    description: 'Majestic deep navy and imperial violet with regal gold trim',
    headerBg: 'bg-slate-950 text-white',
    accentColor: '#6366f1',
    borderColor: 'border-slate-200',
    tableHeaderBg: 'bg-slate-900 text-amber-200',
    badgeClass: 'bg-indigo-900 text-indigo-100 border border-indigo-700',
    fontStyle: 'font-serif',
    cardBorder: 'border-2 border-slate-900 shadow-lg',
    headerBanner: 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 border-b-2 border-amber-400'
  },
  {
    id: 'minimal',
    name: '6. Minimal Swiss',
    description: 'Ultra-clean Swiss design, maximum legibility, zero unnecessary decoration',
    headerBg: 'bg-white text-slate-900',
    accentColor: '#0f172a',
    borderColor: 'border-slate-200',
    tableHeaderBg: 'bg-slate-100 text-slate-800 font-mono text-xs',
    badgeClass: 'bg-slate-200 text-slate-900 font-mono',
    fontStyle: 'font-sans',
    cardBorder: 'border border-slate-200 shadow-none',
    headerBanner: 'bg-white text-slate-950 p-6 border-b border-slate-200'
  },
  {
    id: 'premium',
    name: '7. Premium Emerald',
    description: 'Executive dark charcoal paired with rich emerald accents and clean cards',
    headerBg: 'bg-emerald-950 text-emerald-100',
    accentColor: '#059669',
    borderColor: 'border-emerald-200',
    tableHeaderBg: 'bg-emerald-50 text-emerald-950',
    badgeClass: 'bg-emerald-700 text-white',
    fontStyle: 'font-sans',
    cardBorder: 'border border-emerald-300 shadow-sm',
    headerBanner: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-emerald-100 p-6 rounded-xl'
  },
  {
    id: 'studio',
    name: '8. Cinematic Studio Dark',
    description: 'Creative photographer theme with aperture styling and filmstrip accents',
    headerBg: 'bg-slate-950 text-amber-400',
    accentColor: '#fbbf24',
    borderColor: 'border-slate-700',
    tableHeaderBg: 'bg-slate-900 text-amber-200',
    badgeClass: 'bg-amber-500 text-slate-950 font-bold',
    fontStyle: 'font-sans',
    cardBorder: 'border border-amber-500/30 shadow-2xl bg-slate-900 text-slate-100',
    headerBanner: 'bg-slate-950 text-white p-6 border-b-2 border-amber-500'
  },
  {
    id: 'business',
    name: '9. Corporate Blue Grid',
    description: 'Structured corporate blue layout with dense tabular data alignment',
    headerBg: 'bg-sky-950 text-sky-100',
    accentColor: '#0284c7',
    borderColor: 'border-sky-200',
    tableHeaderBg: 'bg-sky-50 text-sky-950',
    badgeClass: 'bg-sky-700 text-white',
    fontStyle: 'font-sans',
    cardBorder: 'border-2 border-sky-800 shadow-sm',
    headerBanner: 'bg-gradient-to-r from-sky-950 via-blue-900 to-sky-900 text-sky-100 p-6'
  },
  {
    id: 'creative',
    name: '10. Creative Teal & Amber',
    description: 'Vibrant modern studio theme with teal highlights and warm amber badges',
    headerBg: 'bg-teal-950 text-white',
    accentColor: '#0d9488',
    borderColor: 'border-teal-200',
    tableHeaderBg: 'bg-teal-50 text-teal-950',
    badgeClass: 'bg-amber-500 text-slate-950 font-bold rounded-lg',
    fontStyle: 'font-sans',
    cardBorder: 'border border-teal-300 shadow-md',
    headerBanner: 'bg-gradient-to-r from-teal-950 via-teal-900 to-slate-950 text-teal-100 p-6 rounded-t-xl border-b-2 border-amber-400'
  }
];

// 8 Software-wide theme presets
export const SOFTWARE_THEMES = [
  {
    id: 'obsidian_gold',
    name: 'Obsidian Gold (Default)',
    description: 'Deep midnight dark slate with brilliant gold accents',
    bgClass: 'bg-[#0a0f1d]',
    cardClass: 'bg-[#0f172a]',
    borderClass: 'border-amber-500/25',
    accentColor: '#f59e0b',
    primaryColor: '#0a0f1d',
    textColor: 'text-white'
  },
  {
    id: 'midnight_sapphire',
    name: 'Midnight Sapphire',
    description: 'Deep oceanic navy with radiant cyan & sky highlights',
    bgClass: 'bg-[#050e20]',
    cardClass: 'bg-[#0a192f]',
    borderClass: 'border-sky-500/30',
    accentColor: '#0ea5e9',
    primaryColor: '#050e20',
    textColor: 'text-white'
  },
  {
    id: 'emerald_prestige',
    name: 'Emerald Prestige',
    description: 'Dark royal forest slate with rich emerald highlights',
    bgClass: 'bg-[#041712]',
    cardClass: 'bg-[#08241c]',
    borderClass: 'border-emerald-500/30',
    accentColor: '#10b981',
    primaryColor: '#041712',
    textColor: 'text-white'
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    description: 'Imperial deep purple canvas with lavender & gold trim',
    bgClass: 'bg-[#0f0a1c]',
    cardClass: 'bg-[#18112d]',
    borderClass: 'border-purple-500/30',
    accentColor: '#a855f7',
    primaryColor: '#0f0a1c',
    textColor: 'text-white'
  },
  {
    id: 'crimson_ruby',
    name: 'Crimson Ruby',
    description: 'Sophisticated dark burgundy slate with ruby red highlights',
    bgClass: 'bg-[#190a0f]',
    cardClass: 'bg-[#260f18]',
    borderClass: 'border-rose-500/30',
    accentColor: '#f43f5e',
    primaryColor: '#190a0f',
    textColor: 'text-white'
  },
  {
    id: 'titanium_light',
    name: 'Titanium Executive Light',
    description: 'Pristine, high-contrast light mode with clean slate borders',
    bgClass: 'bg-[#f1f5f9]',
    cardClass: 'bg-[#ffffff]',
    borderClass: 'border-slate-300',
    accentColor: '#d97706',
    primaryColor: '#ffffff',
    textColor: 'text-slate-900'
  },
  {
    id: 'cyber_slate',
    name: 'Cyber Slate',
    description: 'High-contrast monochrome charcoal with neon lime accents',
    bgClass: 'bg-[#111317]',
    cardClass: 'bg-[#1b1e24]',
    borderClass: 'border-lime-500/30',
    accentColor: '#84cc16',
    primaryColor: '#111317',
    textColor: 'text-white'
  },
  {
    id: 'classic_studio_navy',
    name: 'Classic Studio Navy',
    description: 'Traditional Hadi Photo Studio navy and warm amber palette',
    bgClass: 'bg-[#0b1329]',
    cardClass: 'bg-[#131f3f]',
    borderClass: 'border-amber-400/30',
    accentColor: '#fbbf24',
    primaryColor: '#0b1329',
    textColor: 'text-white'
  }
];
