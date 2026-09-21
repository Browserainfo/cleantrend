import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Download, 
  RotateCcw, 
  Upload, 
  RefreshCw, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  HardDrive, 
  FileJson, 
  Clock, 
  ArrowDownToLine, 
  Info, 
  Check, 
  X,
  Lock,
  Copy,
  FolderCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SavedBackupItem {
  filename: string;
  sizeBytes: number;
  formattedSize: string;
  createdAt: string;
  formattedDate: string;
  dayOfWeek: string;
  triggerType: string;
  isWeekly: boolean;
  branchName?: string;
  windowsBackupPath?: string;
  storageLocation?: string;
  summary?: {
    totalOrders: number;
    totalCustomers: number;
    totalUsers: number;
    totalPayments?: number;
    totalServices?: number;
    totalGarments?: number;
  };
}

export const AdminBackupSection: React.FC = () => {
  const { showToast, restoreBackupData } = useApp();

  const [backups, setBackups] = useState<SavedBackupItem[]>([]);
  const [nextScheduledThursday, setNextScheduledThursday] = useState<string>('Thursday, 24 Sep 2026 at 7:00 PM');
  const [isTodayThursday, setIsTodayThursday] = useState<boolean>(false);
  const [scheduleNotice, setScheduleNotice] = useState<string>('Automatic complete CRM backup runs every Thursday at 7:00 PM');
  const [storageLocation, setStorageLocation] = useState<string>('C:\\Cleanera Backups\\');
  const [windowsBackupDir, setWindowsBackupDir] = useState<string>('C:\\Cleanera Backups\\');
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [downloadingFilename, setDownloadingFilename] = useState<string | null>(null);

  // Restore Modal State
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<SavedBackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreConfirmationText, setRestoreConfirmationText] = useState<string>('');

  // Upload & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileToRestore, setUploadedFileToRestore] = useState<{
    filename: string;
    content: any;
    orderCount: number;
    customerCount: number;
  } | null>(null);
  const [isUploadingRestore, setIsUploadingRestore] = useState<boolean>(false);

  const handleCopyWindowsPath = () => {
    try {
      navigator.clipboard.writeText(windowsBackupDir);
      setCopiedPath(true);
      showToast(`Copied Windows path: ${windowsBackupDir}`, 'success');
      setTimeout(() => setCopiedPath(false), 2000);
    } catch (e) {
      showToast(`Windows backup path: ${windowsBackupDir}`, 'info');
    }
  };

  const fetchBackupsList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/backup/list');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
        if (data.nextScheduledThursday) setNextScheduledThursday(data.nextScheduledThursday);
        if (data.isTodayThursday !== undefined) setIsTodayThursday(Boolean(data.isTodayThursday));
        if (data.scheduleNotice) setScheduleNotice(data.scheduleNotice);
        if (data.storageLocation) setStorageLocation(data.storageLocation);
        if (data.windowsBackupDir) setWindowsBackupDir(data.windowsBackupDir);
      }
    } catch (err: any) {
      console.error('Failed to load backups list:', err);
      showToast(`Could not refresh backups list: ${err.message || 'Network error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupsList();
  }, []);

  const handleCreateManualBackup = async () => {
    setIsCreatingBackup(true);
    showToast('Creating complete CRM snapshot...', 'info');
    try {
      const res = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: 'MANUAL' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Backup successfully created: ${data.filename || 'New Snapshot'}`, 'success');
        await fetchBackupsList();
      } else {
        throw new Error(data.error || 'Failed to create backup');
      }
    } catch (err: any) {
      showToast(`Backup creation failed: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownloadSpecificBackup = async (filename: string) => {
    setDownloadingFilename(filename);
    showToast(`Downloading backup ${filename}...`, 'info');
    try {
      const res = await fetch(`/api/backup/download/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Downloaded: ${filename}`, 'success');
    } catch (err: any) {
      showToast(`Failed to download ${filename}: ${err.message}`, 'error');
    } finally {
      setDownloadingFilename(null);
    }
  };

  const handleConfirmRestoreSaved = async () => {
    if (!selectedBackupForRestore) return;
    setIsRestoring(true);
    showToast(`Restoring CRM from ${selectedBackupForRestore.filename}...`, 'info');

    try {
      const res = await fetch(`/api/backup/restore-saved/${encodeURIComponent(selectedBackupForRestore.filename)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.backupData) {
          restoreBackupData(data.backupData);
        }
        showToast(`CRM successfully restored from ${selectedBackupForRestore.filename}!`, 'success');
        setSelectedBackupForRestore(null);
        setRestoreConfirmationText('');
        await fetchBackupsList();
      } else {
        throw new Error(data.error || 'Restore failed on server');
      }
    } catch (err: any) {
      showToast(`Restore operation failed: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Upload custom backup file from computer
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          showToast('Invalid file: Expected a valid JSON object.', 'error');
          return;
        }
        const orderCount = Array.isArray(parsed.orders) ? parsed.orders.length : 0;
        const customerCount = Array.isArray(parsed.customers) ? parsed.customers.length : 0;
        setUploadedFileToRestore({
          filename: file.name,
          content: parsed,
          orderCount,
          customerCount
        });
      } catch (err: any) {
        showToast('Failed to parse backup JSON file: Invalid JSON syntax', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can reselect if needed
    if (e.target) e.target.value = '';
  };

  const handleConfirmUploadRestore = async () => {
    if (!uploadedFileToRestore) return;
    setIsUploadingRestore(true);
    showToast(`Applying uploaded backup: ${uploadedFileToRestore.filename}...`, 'info');

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadedFileToRestore.content)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.backupData || uploadedFileToRestore.content) {
          restoreBackupData(data.backupData || uploadedFileToRestore.content);
        }
        showToast(`CRM data successfully restored from ${uploadedFileToRestore.filename}!`, 'success');
        setUploadedFileToRestore(null);
        await fetchBackupsList();
      } else {
        throw new Error(data.error || 'Restore failed');
      }
    } catch (err: any) {
      showToast(`Restore failed: ${err.message}`, 'error');
    } finally {
      setIsUploadingRestore(false);
    }
  };

  const getTriggerBadge = (item: SavedBackupItem) => {
    if (item.triggerType === 'WEEKLY_THURSDAY' || item.isWeekly) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <Calendar className="w-3 h-3 text-purple-600" />
          Weekly Thursday
        </span>
      );
    }
    if (item.triggerType === 'MANUAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
          <HardDrive className="w-3 h-3 text-sky-600" />
          Manual Snapshot
        </span>
      );
    }
    if (item.triggerType === 'EMERGENCY_PRE_RESTORE' || item.filename.includes('Emergency')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <ShieldCheck className="w-3 h-3 text-amber-600" />
          Pre-Restore Safety
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" />
        Daily 7PM Snapshot
      </span>
    );
  };

  return (
    <div id="admin-backup-hub" className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-y-auto p-4 sm:p-6 text-slate-800">
      {/* Top Banner: Weekly Thursday Schedule Info */}
      <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Automatic Weekly CRM Backup
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Scheduled: Thursdays @ 7:00 PM
              </span>
              {isTodayThursday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 animate-pulse">
                  Today is Thursday
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Every Thursday at <strong>7:00 PM</strong>, the CRM automatically creates a complete backup and saves a copy outside the project folder on the Windows PC: <strong className="text-emerald-300">C:\Cleanera Backups\</strong>. All previous weekly backups are kept without overwriting.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next Scheduled Run: <strong className="text-white">{nextScheduledThursday}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <FolderCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Windows Location:</span>
                <button
                  type="button"
                  onClick={handleCopyWindowsPath}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[10px] rounded border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                  title="Click to copy path"
                >
                  <span>{windowsBackupDir}</span>
                  {copiedPath ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handleCreateManualBackup}
            disabled={isCreatingBackup}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            title="Create an immediate dated backup right now"
          >
            <Database className={`w-3.5 h-3.5 ${isCreatingBackup ? 'animate-spin' : ''}`} />
            <span>{isCreatingBackup ? 'Creating Snapshot...' : 'Create Backup Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            title="Upload a Cleanera JSON backup file to restore"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Restore</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={fetchBackupsList}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition cursor-pointer"
            title="Refresh backups list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Storage & Architecture Guarantee Info */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
          <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">Windows PC External Storage</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Saved outside CRM folder to <code className="text-slate-800 font-mono font-bold">C:\Cleanera Backups\</code> so your weekly backups remain safe outside the app.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
          <Database className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">100% Complete CRM Data Scope</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Includes customers, orders, payments, master data (services & garments), business settings, and users.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
          <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">Non-Overwriting Retention</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Each Thursday creates a new dated file. Previous weekly backups are kept without overwriting.
            </p>
          </div>
        </div>
      </div>

      {/* Available Backups List Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
            Available Saved Backups ({backups.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          Click <Download className="w-3 h-3 inline text-slate-600" /> to download or <RotateCcw className="w-3 h-3 inline text-amber-600" /> to restore
        </span>
      </div>

      {/* Backups Table */}
      {backups.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3">Backup Date & Time</th>
                <th className="p-3">Filename</th>
                <th className="p-3">Type</th>
                <th className="p-3">Contained Records</th>
                <th className="p-3">Storage Destination</th>
                <th className="p-3">File Size</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {backups.map((item) => (
                <tr key={item.filename} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.formattedDate}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block ml-5">
                      {item.dayOfWeek}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-800">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-900 border border-slate-200 select-all font-semibold">
                      {item.filename}
                    </span>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {getTriggerBadge(item)}
                  </td>

                  <td className="p-3 whitespace-nowrap text-[11px] text-slate-600">
                    {item.summary ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-semibold">
                          {item.summary.totalOrders} Orders
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-semibold">
                          {item.summary.totalCustomers} Customers
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-semibold">
                          {item.summary.totalUsers} Users
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Complete CRM Records</span>
                    )}
                  </td>

                  <td className="p-3 whitespace-nowrap text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] rounded border border-emerald-200">
                      <FolderCheck className="w-3 h-3 text-emerald-600" />
                      <span>C:\Cleanera Backups\</span>
                    </span>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    {item.formattedSize}
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadSpecificBackup(item.filename)}
                        disabled={downloadingFilename === item.filename}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs rounded border border-slate-200 hover:border-emerald-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title={`Download ${item.filename}`}
                      >
                        <Download className={`w-3.5 h-3.5 ${downloadingFilename === item.filename ? 'animate-bounce' : ''}`} />
                        <span>Download</span>
                      </button>

                      {/* Restore Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedBackupForRestore(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-semibold text-xs rounded border border-slate-200 hover:border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                        title={`Restore CRM data from ${item.filename}`}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
          <HardDrive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-700">No saved backups found on server.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click "Create Backup Now" above or wait for the automatic Thursday 7:00 PM scheduled snapshot.
          </p>
        </div>
      )}

      {/* Modal: Confirm Restore from Saved Server Backup */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm CRM Data Restoration</h3>
                <p className="text-[11px] text-slate-500">Restore CRM state from server backup</p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-semibold">Target Backup:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBackupForRestore.filename}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-semibold">Backup Date:</span>
                <span className="font-semibold text-slate-800">{selectedBackupForRestore.formattedDate}</span>
              </div>
              {selectedBackupForRestore.summary && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-semibold">Records in Backup:</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedBackupForRestore.summary.totalOrders} Orders • {selectedBackupForRestore.summary.totalCustomers} Customers
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] leading-relaxed mb-4">
              <ShieldCheck className="w-4 h-4 inline mr-1.5 text-emerald-700" />
              <strong>Safety Protected:</strong> An automatic emergency pre-restore backup of your current live data will be saved to disk before this backup is restored.
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Restoring this backup will replace current live orders, customers, and business configuration with the contents of this snapshot.
              Are you sure you wish to proceed?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedBackupForRestore(null);
                  setRestoreConfirmationText('');
                }}
                disabled={isRestoring}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRestoreSaved}
                disabled={isRestoring}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                <span>{isRestoring ? 'Restoring Database...' : 'Confirm & Restore CRM Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Restore from Uploaded Custom JSON */}
      {uploadedFileToRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Restore from Uploaded Backup File</h3>
                <p className="text-[11px] text-slate-500">Verify file contents before restoring</p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-semibold">Uploaded File:</span>
                <span className="font-mono font-bold text-slate-900">{uploadedFileToRestore.filename}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-semibold">Detected Orders:</span>
                <span className="font-semibold text-slate-800">{uploadedFileToRestore.orderCount} Orders</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-semibold">Detected Customers:</span>
                <span className="font-semibold text-slate-800">{uploadedFileToRestore.customerCount} Customers</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] leading-relaxed mb-4">
              <ShieldCheck className="w-4 h-4 inline mr-1.5 text-emerald-700" />
              <strong>Safety Protected:</strong> The server will create an emergency pre-restore snapshot of current CRM data prior to applying the uploaded file.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUploadedFileToRestore(null)}
                disabled={isUploadingRestore}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmUploadRestore}
                disabled={isUploadingRestore}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isUploadingRestore ? 'animate-spin' : ''}`} />
                <span>{isUploadingRestore ? 'Applying Restore...' : 'Restore from Uploaded File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
