import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit,
  Save,
  Search,
  RefreshCw,
  X,
  Plus,
  CheckCircle2,
  Database,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getFirestore
} from 'firebase/firestore';

export default function FirestoreManagerModal({
  isOpen,
  onClose,
  dbInstance,
  onAddAuditLog,
  triggerAlert
}) {
  const [collectionsList, setCollectionsList] = useState([
    'invoices',
    'customers',
    'bookings',
    'products',
    'settings',
    'staff',
    'auditLogs'
  ]);
  const [selectedCollection, setSelectedCollection] = useState('invoices');
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonEditorContent, setJsonEditorContent] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newDocId, setNewDocId] = useState('');

  const fetchCollectionDocs = async (colName) => {
    if (!dbInstance) return;
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(dbInstance, colName));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(list);
      if (list.length > 0) {
        setSelectedDoc(list[0]);
        setJsonEditorContent(JSON.stringify(list[0], null, 2));
      } else {
        setSelectedDoc(null);
        setJsonEditorContent('{}');
      }
    } catch (err) {
      console.warn('Firestore manager query notice:', err);
      // Fallback local simulated collection inspect
      const localInvs = JSON.parse(localStorage.getItem('hadi_studio_invoices') || '[]');
      setDocuments(localInvs);
      if (localInvs.length > 0) {
        setSelectedDoc(localInvs[0]);
        setJsonEditorContent(JSON.stringify(localInvs[0], null, 2));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedCollection) {
      fetchCollectionDocs(selectedCollection);
    }
  }, [isOpen, selectedCollection]);

  const handleSelectDoc = (docItem) => {
    setSelectedDoc(docItem);
    setJsonEditorContent(JSON.stringify(docItem, null, 2));
  };

  const handleSaveDocChanges = async () => {
    if (!selectedDoc || !dbInstance) return;
    try {
      const parsed = JSON.parse(jsonEditorContent);
      const docId = selectedDoc.id;
      await setDoc(doc(dbInstance, selectedCollection, docId), parsed, { merge: true });

      onAddAuditLog?.({
        action: 'Firestore Document Updated',
        category: 'database',
        details: `Updated document #${docId} in collection "${selectedCollection}"`
      });

      triggerAlert?.(`Document #${docId} saved successfully! / Document save ho gaya`);
      fetchCollectionDocs(selectedCollection);
    } catch (err) {
      triggerAlert?.(`Invalid JSON format: ${err.message}`, 'error');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm(`Are you sure you want to delete document #${docId}? / Kya aap ye document delete karna chahte hain?`)) return;
    try {
      await deleteDoc(doc(dbInstance, selectedCollection, docId));
      onAddAuditLog?.({
        action: 'Firestore Document Deleted',
        category: 'database',
        details: `Deleted document #${docId} from collection "${selectedCollection}"`
      });
      triggerAlert?.(`Document #${docId} deleted / Document delete ho gaya`);
      fetchCollectionDocs(selectedCollection);
    } catch (err) {
      triggerAlert?.(`Delete error: ${err.message}`, 'error');
    }
  };

  const handleCreateNewDoc = async () => {
    if (!newDocId.trim()) {
      triggerAlert?.('Please enter a Document ID / Document ID likhein', 'error');
      return;
    }
    try {
      const initialData = {
        id: newDocId.trim(),
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };
      await setDoc(doc(dbInstance, selectedCollection, newDocId.trim()), initialData);
      setNewDocId('');
      triggerAlert?.(`Document #${newDocId} created successfully / Naya document ban gaya`);
      fetchCollectionDocs(selectedCollection);
    } catch (err) {
      triggerAlert?.(`Create error: ${err.message}`, 'error');
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const clean = newCollectionName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!collectionsList.includes(clean)) {
      setCollectionsList(prev => [...prev, clean]);
      setSelectedCollection(clean);
      setNewCollectionName('');
      triggerAlert?.(`Collection "${clean}" ready / Nayi collection ban gayi`);
    }
  };

  const filteredDocs = documents.filter(d =>
    JSON.stringify(d).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-6xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                FIRESTORE DATABASE MANAGER
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  SECURE ADMIN CONSOLE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Browse Collections, Inspect Documents, Edit Raw Fields & Manage Cloud Data
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

        {/* 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Collections List */}
          <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col text-xs">
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 font-bold text-amber-400 flex items-center justify-between">
              <span>COLLECTIONS</span>
              <button
                type="button"
                onClick={() => fetchCollectionDocs(selectedCollection)}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1">
              {collectionsList.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedCollection(col)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between transition ${
                    selectedCollection === col
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span className="capitalize">{col}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>

            {/* Add Collection Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/40">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="New collection..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-white text-[11px] focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  className="px-2 py-1 bg-amber-500 text-black rounded-lg font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Documents in Collection */}
          <div className="w-72 bg-slate-900/80 border-r border-slate-800 flex flex-col text-xs">
            <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-[11px]">
                  {selectedCollection} ({filteredDocs.length})
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 pl-8 pr-2 py-1 rounded-lg text-white text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500">Loading documents...</div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">No documents found.</div>
              ) : (
                filteredDocs.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDoc(d)}
                    className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between border ${
                      selectedDoc?.id === d.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-[11px] truncate font-mono">{d.id}</div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {d.customerName || d.clientName || d.name || d.action || 'Document Item'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(d.id);
                      }}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
                      title="Delete Doc"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Document Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="New Document ID..."
                  value={newDocId}
                  onChange={(e) => setNewDocId(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-white text-[11px] focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCreateNewDoc}
                  className="px-2 py-1 bg-amber-500 text-black rounded-lg font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Document Inspector & JSON Editor */}
          <div className="flex-1 bg-slate-950 flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">DOCUMENT INSPECTOR:</span>
                <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {selectedDoc ? `${selectedCollection}/${selectedDoc.id}` : 'No Document Selected'}
                </span>
              </div>
              {selectedDoc && (
                <button
                  type="button"
                  onClick={handleSaveDocChanges}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE DOCUMENT</span>
                </button>
              )}
            </div>

            <textarea
              value={jsonEditorContent}
              onChange={(e) => setJsonEditorContent(e.target.value)}
              disabled={!selectedDoc}
              placeholder="// Select a document to inspect and edit JSON fields..."
              className="flex-1 w-full bg-slate-900/90 text-amber-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
