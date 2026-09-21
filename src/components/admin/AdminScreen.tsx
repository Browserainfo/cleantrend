import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  FileText, 
  Lock, 
  Key, 
  Upload, 
  Check, 
  X, 
  AlertTriangle, 
  Save, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Phone,
  Mail,
  UserPlus,
  Database
} from 'lucide-react';
import { UserRole, User } from '../../types';
import { deriveEffectiveBranchCode } from '../../utils/pieceTagUtils';
import { UserManagementScreen } from './UserManagementScreen';
import { AdminBackupSection } from './AdminBackupSection';

export const AdminScreen: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    activeView,
    setActiveView,
    users, 
    businessSettings, 
    updateBusinessSettings, 
    priceCorrectionRequests, 
    reviewPriceCorrectionRequest, 
    auditLogs, 
    showToast,
    resetToDefaults 
  } = useApp();

  // Strict role guard: only ADMIN can access AdminScreen
  if (currentRole !== 'ADMIN') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100 text-center select-none">
        <div className="max-w-md bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Administrative controls, user management, and system configuration are strictly reserved for the <strong>ADMIN</strong> role. Manager accounts cannot access this module.
          </p>
          <button
            onClick={() => setActiveView('HOME')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Return to Counter Desk
          </button>
        </div>
      </div>
    );
  }

  const [activeAdminTab, setActiveAdminTab] = useState<'USERS' | 'SETTINGS' | 'BACKUPS' | 'PRICE_APPROVALS' | 'AUDIT'>(
    activeView === 'SETTINGS' ? 'SETTINGS' : 'USERS'
  );

  // Switch to Settings tab automatically if navigated with SETTINGS view
  useEffect(() => {
    if (activeView === 'SETTINGS') {
      setActiveAdminTab('SETTINGS');
    }
  }, [activeView]);

  // Business settings state - Single Source of Truth
  const [storeName, setStoreName] = useState(businessSettings.storeName || 'Trendera');
  const [businessName, setBusinessName] = useState(businessSettings.businessName);
  const [branchName, setBranchName] = useState(businessSettings.branchName);
  const [branchCode, setBranchCode] = useState(businessSettings.branchCode);
  const [tagline, setTagline] = useState(businessSettings.marketingMessage || '');
  const [address, setAddress] = useState(businessSettings.address);
  const [phone, setPhone] = useState(businessSettings.phone);
  const [email, setEmail] = useState(businessSettings.email);
  const [gstNumber, setGstNumber] = useState(businessSettings.taxNumber);
  const [taxRate, setTaxRate] = useState((businessSettings.taxRatePercent || 18).toString());
  const [receiptFooter, setReceiptFooter] = useState(businessSettings.receiptFooterMessage);
  const [logoData, setLogoData] = useState(businessSettings.logoUrl);
  const [faviconData, setFaviconData] = useState(businessSettings.faviconUrl);

  // Sync state whenever businessSettings changes from anywhere in the app
  useEffect(() => {
    setStoreName(businessSettings.storeName || 'Trendera');
    setBusinessName(businessSettings.businessName);
    setBranchName(businessSettings.branchName);
    setBranchCode(businessSettings.branchCode);
    setTagline(businessSettings.marketingMessage || '');
    setAddress(businessSettings.address);
    setPhone(businessSettings.phone);
    setEmail(businessSettings.email);
    setGstNumber(businessSettings.taxNumber);
    setTaxRate((businessSettings.taxRatePercent || 18).toString());
    setReceiptFooter(businessSettings.receiptFooterMessage);
    setLogoData(businessSettings.logoUrl);
    setFaviconData(businessSettings.faviconUrl);
  }, [businessSettings]);

  // User management state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MANAGER');
  const [newUserMobile, setNewUserMobile] = useState('');

  // Handle Logo Upload (Client-side base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoData(reader.result as string);
        showToast('Store logo updated and cached for receipts.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconData(reader.result as string);
        showToast('Favicon updated.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'ADMIN') {
      showToast('Only Admin can save business settings.', 'error');
      return;
    }

    const trimmedName = businessName.trim();
    if (!trimmedName) {
      showToast('Business Name cannot be empty.', 'error');
      return;
    }

    updateBusinessSettings({
      storeName: storeName.trim() || 'Trendera',
      businessName: trimmedName,
      displayName: trimmedName,
      legalName: trimmedName,
      branchName: branchName.trim(),
      branchCode: branchCode.trim().toUpperCase(),
      marketingMessage: tagline,
      address,
      phone,
      email,
      taxNumber: '',
      taxRatePercent: 0,
      receiptFooterMessage: receiptFooter,
      logoUrl: logoData,
      faviconUrl: faviconData
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Administration & Owner Control Hub</span>
              {currentRole === 'ADMIN' ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                  Full Authority
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                  Restricted View
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Manage Users (RBAC), Business Settings, Price Exception Approvals, and Audit Logs.
            </p>
          </div>
        </div>

        <button
          onClick={resetToDefaults}
          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded font-semibold text-xs flex items-center gap-1 border border-slate-200 transition"
          title="Reset database to initial demo state"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <button
              onClick={() => setActiveAdminTab('USERS')}
              className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeAdminTab === 'USERS'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users & Permissions ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('SETTINGS')}
              className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeAdminTab === 'SETTINGS'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Business Settings & Branding</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('BACKUPS')}
              className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeAdminTab === 'BACKUPS'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backups & Restore</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('PRICE_APPROVALS')}
              className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeAdminTab === 'PRICE_APPROVALS'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Price Exception Approvals ({priceCorrectionRequests.filter(r => r.status === 'PENDING').length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('AUDIT')}
              className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeAdminTab === 'AUDIT'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Immutable Audit Ledger ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Users & Permissions */}
        {activeAdminTab === 'USERS' && (
          <div className="flex-1 overflow-y-auto">
            <UserManagementScreen />
          </div>
        )}

        {/* Tab 2: Business Settings & Branding */}
        {activeAdminTab === 'SETTINGS' && (
          <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-y-auto p-6">
            <div className="mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-600" />
                <span>Primary Business Identity & Branding (Single Source of Truth)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The Business Name configured here is automatically used across all 2R Piece Tags, QR codes, receipts, invoices, reports, and customer portals.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="max-w-3xl space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Business Name (Tags, Header, Receipts, QR) *</span>
                    <span className="text-[10px] text-sky-600 font-normal">Primary Brand</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setBusinessName(newName);
                      if (!branchCode || branchCode === 'DC02') {
                        setBranchCode(deriveEffectiveBranchCode({ ...businessSettings, businessName: newName, branchName }));
                      }
                    }}
                    placeholder="e.g. Trendera or ABC Dry Cleaners"
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Branch Code (Prefix)</label>
                    <button
                      type="button"
                      onClick={() => setBranchCode(deriveEffectiveBranchCode({ ...businessSettings, businessName, branchName }))}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-bold hover:underline"
                    >
                      Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TE02 or TE"
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Store Name (WhatsApp) *</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Header & Sign-off</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Trendera"
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch / Location Name</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. C2 Sector 1 Noida"
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Premium Garment Care"
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Store Address (Printed on Receipts)</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Branding: Logo & Favicon Upload */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Store Logo (Printed on Thermal Receipt)</span>
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                  </label>
                  <div className="flex items-center gap-3">
                    {logoData ? (
                      <img src={logoData} alt="Logo" className="w-12 h-12 object-contain bg-white p-1 rounded border border-slate-300" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center font-bold text-slate-500">
                        Logo
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Favicon (Browser Tab Icon)</span>
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                  </label>
                  <div className="flex items-center gap-3">
                    {faviconData ? (
                      <img src={faviconData} alt="Favicon" className="w-8 h-8 object-contain bg-white p-1 rounded border border-slate-300" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center font-bold text-slate-500 text-[10px]">
                        Icon
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Receipt Footer Disclaimer</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Business Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Backups & Disaster Recovery */}
        {activeAdminTab === 'BACKUPS' && (
          <AdminBackupSection />
        )}

        {/* Tab 4: Price Exception Approvals */}
        {activeAdminTab === 'PRICE_APPROVALS' && (
          <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Anti-Fraud: Price Correction & Discount Authorization Queue</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Managers must request Admin clearance for discounts or price cuts.
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 text-xs">
              {priceCorrectionRequests.map(req => (
                <div key={req.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sky-700">Order #{req.orderNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-slate-900">{req.customerName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-900' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-rose-100 text-rose-900'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-slate-600 flex items-center gap-3">
                      <span>Requested By: <strong className="text-slate-800">{req.requestedBy}</strong></span>
                      <span>Original: <del>₹{req.originalPrice.toFixed(2)}</del></span>
                      <span>Proposed: <strong className="text-emerald-700">₹{req.proposedPrice.toFixed(2)}</strong></span>
                      {req.discountPercent && req.discountPercent > 0 && (
                        <span>Discount: <strong className="text-rose-700">{req.discountPercent}%</strong></span>
                      )}
                    </div>

                    <div className="text-slate-500 italic">"{req.reason}"</div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reviewPriceCorrectionRequest(req.id, false, 'Rejected by owner')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => reviewPriceCorrectionRequest(req.id, true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Apply
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {priceCorrectionRequests.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No price correction requests pending. Anti-fraud system is secure.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Immutable Audit Log Ledger */}
        {activeAdminTab === 'AUDIT' && (
          <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Immutable Security & Operational Audit Log Ledger</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {auditLogs.length} Recorded System Events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Action Type</th>
                    <th className="p-2.5">User & Role</th>
                    <th className="p-2.5">Order #</th>
                    <th className="p-2.5">Target Field</th>
                    <th className="p-2.5">Previous Value</th>
                    <th className="p-2.5">New Value</th>
                    <th className="p-2.5">Business Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">{log.changedBy}</td>
                      <td className="p-2.5 font-bold font-mono text-sky-700">#{log.orderNumber}</td>
                      <td className="p-2.5 text-slate-700">{log.fieldName}</td>
                      <td className="p-2.5 font-mono text-rose-700">{log.previousValue}</td>
                      <td className="p-2.5 font-mono text-emerald-700">{log.newValue}</td>
                      <td className="p-2.5 text-slate-500 italic">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
