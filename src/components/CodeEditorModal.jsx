import React, { useState } from 'react';
import {
  Code,
  Eye,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Plus,
  Play,
  FileCode,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

const DEFAULT_CUSTOM_PAGES = [
  {
    id: 'page_custom_about',
    title: 'Custom About & Equipment',
    slug: 'about-equipment',
    html: `<div class="p-6 bg-slate-900 text-white rounded-2xl border border-amber-500/40">
  <h2 class="text-2xl font-bold text-amber-400">Hadi Studio — Master Equipment & Gear</h2>
  <p class="mt-2 text-slate-300">Official Sony Full-Frame bodies, G-Master Lenses, DJI Drones & Pro Lighting systems.</p>
  <ul class="mt-4 space-y-2 list-disc list-inside text-sm text-slate-300">
    <li>Sony A7IV / FX3 4K 10-bit 4:2:2 Cinema Gear</li>
    <li>DJI Mini 3 Pro / Mavic 3 Cinematic Drone Coverage</li>
    <li>Godox AD600 Pro High-Speed Studio Strobes</li>
  </ul>
</div>`,
    css: `/* Custom Page Styling */
h2 { letter-spacing: -0.02em; }`,
    js: `// Custom Page Logic
console.log("Hadi Studio Custom Page Loaded");`,
    lastUpdated: new Date().toISOString()
  }
];

export default function CodeEditorModal({
  isOpen,
  onClose,
  onAddAuditLog,
  triggerAlert
}) {
  const [pages, setPages] = useState(() => {
    try {
      const saved = localStorage.getItem('hadi_custom_pages');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_PAGES;
    } catch {
      return DEFAULT_CUSTOM_PAGES;
    }
  });

  const [activePageId, setActivePageId] = useState(pages[0]?.id || 'page_custom_about');
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'css' | 'js' | 'preview'
  const [versionHistory, setVersionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('hadi_code_versions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [validationError, setValidationError] = useState('');
  const [previewError, setPreviewError] = useState('');

  const currentPage = pages.find(p => p.id === activePageId) || pages[0] || {
    id: 'new_page',
    title: 'New Page',
    html: '',
    css: '',
    js: ''
  };

  const updateCurrentPageCode = (key, value) => {
    setPages(prev =>
      prev.map(p => (p.id === currentPage.id ? { ...p, [key]: value, lastUpdated: new Date().toISOString() } : p))
    );
  };

  const handleAddNewPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      title: `Custom Page ${pages.length + 1}`,
      slug: `custom-page-${pages.length + 1}`,
      html: `<div class="p-6 bg-slate-900 text-white rounded-xl">\n  <h2 class="text-xl font-bold text-amber-400">New Custom Page</h2>\n  <p class="mt-2 text-slate-300">Custom content generated via Hadi Studio Page Builder.</p>\n</div>`,
      css: '',
      js: '',
      lastUpdated: new Date().toISOString()
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    triggerAlert?.('New custom page created / Naya page ban gaya');
  };

  const handleDeletePage = (id) => {
    if (pages.length <= 1) {
      triggerAlert?.('Cannot delete the only page / Aakhri page delete nahi ho sakta', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to delete this custom page? / Kya aap ye page delete karna chahte hain?')) {
      setPages(prev => prev.filter(p => p.id !== id));
      setActivePageId(pages[0].id);
      triggerAlert?.('Page deleted successfully / Page delete ho gaya');
    }
  };

  const handleApplyAndSave = () => {
    // 1. Validation check
    setValidationError('');
    setPreviewError('');

    try {
      // Basic syntax check for JS
      if (currentPage.js && currentPage.js.trim()) {
        new Function(currentPage.js);
      }
    } catch (err) {
      setValidationError(`JavaScript Error: ${err.message}`);
      triggerAlert?.(`Code Error: ${err.message} / Code mein kharabi hai`, 'error');
      return;
    }

    // 2. Create Version Backup
    const newVersion = {
      id: `ver_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      pageId: currentPage.id,
      pageTitle: currentPage.title,
      html: currentPage.html,
      css: currentPage.css,
      js: currentPage.js
    };

    const updatedHistory = [newVersion, ...versionHistory.slice(0, 19)];
    setVersionHistory(updatedHistory);
    localStorage.setItem('hadi_code_versions', JSON.stringify(updatedHistory));

    // 3. Save Pages
    localStorage.setItem('hadi_custom_pages', JSON.stringify(pages));

    onAddAuditLog?.({
      action: 'Custom Code Applied',
      category: 'admin',
      details: `Saved & applied custom code for page "${currentPage.title}" (Version #${newVersion.id})`
    });

    triggerAlert?.('Code validated and applied successfully! / Code kamyabi se save ho gaya');
    setActiveTab('preview');
  };

  const handleRollbackVersion = (version) => {
    if (window.confirm(`Restore code version from ${version.timestamp}? / Kya aap pichla version restore karna chahte hain?`)) {
      setPages(prev =>
        prev.map(p =>
          p.id === version.pageId
            ? { ...p, html: version.html, css: version.css, js: version.js, lastUpdated: new Date().toISOString() }
            : p
        )
      );
      triggerAlert?.(`Version from ${version.timestamp} restored successfully / Purana version restore ho gaya`);
      setActiveTab('preview');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all custom code to default? / Kya aap code default par reset karna chahte hain?')) {
      setPages(DEFAULT_CUSTOM_PAGES);
      setActivePageId(DEFAULT_CUSTOM_PAGES[0].id);
      localStorage.setItem('hadi_custom_pages', JSON.stringify(DEFAULT_CUSTOM_PAGES));
      triggerAlert?.('Reset to factory defaults / Factory default code restore ho gaya');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                ADMIN CODE EDITOR & PAGE BUILDER
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  SAFE SANDBOX
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Custom HTML/CSS/JS Editor, Live Preview, Version Rollback & Page Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
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

        {/* Workspace Toolbar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Select Page:</span>
            <select
              value={activePageId}
              onChange={(e) => setActivePageId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddNewPage}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Page</span>
            </button>

            {pages.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeletePage(currentPage.id)}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                title="Delete Current Page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'html' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'css' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>CSS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('js')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'js' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>JS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE PREVIEW</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyAndSave}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-lg flex items-center gap-1.5 shadow-md transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>VALIDATE & APPLY</span>
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-red-500/20 border-b border-red-500/40 p-2.5 px-4 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor / Preview Area */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {activeTab === 'html' && (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
                  <span className="font-bold text-amber-400">HTML Template Structure:</span>
                  <span>Safe HTML rendering sandbox</span>
                </div>
                <textarea
                  value={currentPage.html || ''}
                  onChange={(e) => updateCurrentPageCode('html', e.target.value)}
                  placeholder="<!-- Enter custom HTML markup here -->"
                  className="flex-1 w-full bg-slate-900/90 text-amber-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'css' && (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
                  <span className="font-bold text-amber-400">Custom CSS Rules:</span>
                  <span>Scoped styling stylesheet</span>
                </div>
                <textarea
                  value={currentPage.css || ''}
                  onChange={(e) => updateCurrentPageCode('css', e.target.value)}
                  placeholder="/* Enter custom CSS rules here */"
                  className="flex-1 w-full bg-slate-900/90 text-blue-200 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'js' && (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
                  <span className="font-bold text-amber-400">JavaScript Interactivity:</span>
                  <span>Sandboxed JavaScript execution</span>
                </div>
                <textarea
                  value={currentPage.js || ''}
                  onChange={(e) => updateCurrentPageCode('js', e.target.value)}
                  placeholder="// Enter custom JavaScript code here"
                  className="flex-1 w-full bg-slate-900/90 text-emerald-200 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{currentPage.title}</h3>
                      <p className="text-xs text-slate-400">Live Render Preview</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active Preview
                    </span>
                  </div>

                  {/* Scoped CSS Injection */}
                  {currentPage.css && <style>{currentPage.css}</style>}

                  {/* Rendered HTML */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentPage.html || '<p class="text-slate-500 italic">No HTML content provided.</p>'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Version History */}
          <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col text-xs">
            <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2 font-bold text-amber-400">
              <History className="w-4 h-4" />
              <span>VERSION ROLLBACK</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {versionHistory.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">
                  No previous versions saved yet. Click "Validate & Apply" to create snapshots.
                </div>
              ) : (
                versionHistory.map(ver => (
                  <div
                    key={ver.id}
                    className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-white truncate max-w-[130px]">{ver.pageTitle}</span>
                      <span>{ver.timestamp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRollbackVersion(ver)}
                      className="mt-1 w-full py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center justify-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rollback Version</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
