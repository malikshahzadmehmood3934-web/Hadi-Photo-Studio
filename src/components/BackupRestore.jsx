import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  ShieldAlert,
  CheckCircle2,
  FileJson,
  AlertTriangle,
  RefreshCw,
  HardDrive
} from 'lucide-react';

export default function BackupRestore({
  allData = {},
  onRestoreData,
  triggerAlert
}) {
  const [importFile, setImportFile] = useState(null);
  const [importJsonData, setImportJsonData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // One-click JSON Export
  const handleExportBackup = () => {
    try {
      const backupPayload = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        appName: 'Hadi Studio & Shop Management System',
        data: allData
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Hadi_Studio_Backup_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      triggerAlert?.('Complete system backup exported successfully!');
    } catch (err) {
      console.error(err);
      triggerAlert?.('Failed to generate backup export', 'error');
    }
  };

  // File Upload Reader for Import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed.data || parsed.products || parsed.invoices) {
          setImportJsonData(parsed.data || parsed);
        } else {
          triggerAlert?.('Invalid backup file format.', 'error');
          setImportFile(null);
        }
      } catch (err) {
        triggerAlert?.('Failed to read JSON backup file.', 'error');
        setImportFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!importJsonData) return;
    setIsRestoring(true);
    try {
      if (onRestoreData) {
        await onRestoreData(importJsonData);
      }
      setShowConfirmModal(false);
      setImportFile(null);
      setImportJsonData(null);
      triggerAlert?.('Database and local state restored successfully from backup!');
    } catch (err) {
      console.error(err);
      triggerAlert?.('Failed during data restore process', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* HEADER */}
      <div className="bg-[#0f172a] border border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
          <HardDrive className="w-6 h-6 text-amber-400" />
          <span>DATA BACKUP & SYSTEM RESTORE</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Export complete database snapshots (Products, Customers, Invoices, Bookings, Staff) or restore previous archives</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EXPORT BACKUP CARD */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Export System Backup (JSON)</h3>
            <p className="text-slate-400 leading-relaxed">
              Downloads a single, portable, encrypted-structure JSON file containing all records:
            </p>
            <ul className="text-slate-300 space-y-1.5 list-disc pl-4 text-[11px]">
              <li>Shop Catalog & Products Stock ({allData.products?.length || 0})</li>
              <li>Customer Contacts & Profiles ({allData.customers?.length || 0})</li>
              <li>Shop POS Invoices ({allData.shopInvoices?.length || 0})</li>
              <li>Hadi Studio Event Invoices ({allData.studioInvoices?.length || 0})</li>
              <li>Assigned Event Duties & Gear Notes ({allData.duties?.length || 0})</li>
              <li>Staff Accounts & Payment Requests ({allData.staff?.length || 0})</li>
              <li>Published Open Dates & System Settings</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT FULL BACKUP FILE (.JSON)</span>
          </button>
        </div>

        {/* RESTORE BACKUP CARD */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Restore from Backup Archive</h3>
            <p className="text-slate-400 leading-relaxed">
              Upload a previously exported JSON backup file to restore or merge existing data into your system.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-5 block text-center cursor-pointer transition-colors bg-slate-950">
              <FileJson className="w-8 h-8 mx-auto text-amber-400 mb-2" />
              <span className="font-bold text-white block">
                {importFile ? importFile.name : 'Select JSON Backup File'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Click to browse your device storage</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {importJsonData && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Backup file valid and ready for restoration.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!importJsonData || isRestoring}
            onClick={() => setShowConfirmModal(true)}
            className={`w-full font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              importJsonData && !isRestoring
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
            <span>RESTORE DATA NOW</span>
          </button>
        </div>

      </div>

      {/* CONFIRMATION WARNING MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f172a] border-2 border-amber-500 rounded-2xl max-w-md w-full p-6 text-white text-xs space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">CONFIRM DATABASE RESTORATION</h3>
              <p className="text-slate-300">
                Are you sure you want to restore the data from <span className="text-amber-400 font-bold">{importFile?.name}</span>?
              </p>
              <p className="text-[11px] text-slate-400">
                Existing collections will be synchronized with the backup dataset.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                {isRestoring ? 'Restoring...' : 'YES, PROCEED & RESTORE'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
