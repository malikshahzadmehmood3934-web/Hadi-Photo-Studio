const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, isolated APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  toggleScreenshotProtection: (enable) => ipcRenderer.invoke('toggle-screenshot-protection', enable),
  saveInvoicePdf: (data) => ipcRenderer.invoke('save-invoice-pdf', data),
  exportCsvFile: (data) => ipcRenderer.invoke('export-csv-file', data),
  backupLocalDatabase: (data) => ipcRenderer.invoke('backup-local-database', data),
  restoreLocalDatabase: () => ipcRenderer.invoke('restore-local-database'),
  printThermalReceipt: (htmlContent) => ipcRenderer.invoke('print-thermal-receipt', htmlContent)
});
