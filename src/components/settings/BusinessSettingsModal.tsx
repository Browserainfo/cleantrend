import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  Save, 
  X,
  Sparkles,
  Printer,
  Wifi,
  WifiOff,
  Play,
  RefreshCw,
  QrCode,
  Trash2
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { printBridgeService, BridgeStatus, PrinterDevice } from '../../services/printBridgeService';
import { deriveEffectiveBranchCode } from '../../utils/pieceTagUtils';
import { buildUpiPaymentUri, generateUpiQrDataUrl, verifyUpiQrScanner, renderBrandedPaymentCardDataUrl } from '../../utils/upiQrUtils';

export const BusinessSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    businessSettings, 
    updateBusinessSettings, 
    currentRole, 
    showToast 
  } = useApp();

  const [formData, setFormData] = useState<BusinessSettings>({ ...businessSettings });
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'BRANDING' | 'MESSAGING' | 'TAX_FINANCIAL' | 'HARDWARE'>('IDENTITY');
  const [logoPreview, setLogoPreview] = useState<string>(businessSettings.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState<string>(businessSettings.faviconUrl);
  const [paymentQrPreview, setPaymentQrPreview] = useState<string>(businessSettings.paymentQrUrl || '/payment-qr.jpg');

  // Sync state whenever modal opens or businessSettings updates
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...businessSettings });
      setLogoPreview(businessSettings.logoUrl);
      setFaviconPreview(businessSettings.faviconUrl);
      setPaymentQrPreview(businessSettings.paymentQrUrl || '/payment-qr.jpg');
    }
  }, [isOpen, businessSettings]);

  // Hardware Print Bridge configuration state
  const [bridgeConfig, setBridgeConfig] = useState(() => printBridgeService.getConfig());
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>(printBridgeService.getStatus());
  const [detectedPrinters, setDetectedPrinters] = useState<PrinterDevice[]>(() => printBridgeService.getDiscoveredPrinters());
  const [isTestingConnect, setIsTestingConnect] = useState(false);
  const [isTestingPrint, setIsTestingPrint] = useState(false);

  useEffect(() => {
    const unsub = printBridgeService.subscribe((s) => {
      setBridgeStatus(s);
      setDetectedPrinters(printBridgeService.getDiscoveredPrinters());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const isManager = currentRole === 'MANAGER';

  const suggestedBranchCode = deriveEffectiveBranchCode(formData);

  const handleInputChange = (field: keyof BusinessSettings, value: any) => {
    if (isManager) {
      showToast('ANTI-FRAUD PROTECTION: Manager has read-only access to Business Settings. Only Admin can modify settings.', 'error');
      return;
    }
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // If user updates businessName and branchCode is legacy DC02 or empty, auto-derive new prefix
      if (field === 'businessName') {
        if (!prev.branchCode || prev.branchCode === 'DC02') {
          updated.branchCode = deriveEffectiveBranchCode(updated);
        }
      }
      return updated;
    });
  };

  // Logo file upload handler with validation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isManager) {
      showToast('Only Admin can upload branding assets.', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file format. Please upload a PNG, JPG, or SVG logo.', 'error');
      return;
    }

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      showToast('Logo file size exceeds 3MB. Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setLogoPreview(dataUrl);
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      showToast('Business logo loaded and validated successfully.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Favicon file upload handler
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isManager) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setFaviconPreview(dataUrl);
      setFormData(prev => ({ ...prev, faviconUrl: dataUrl }));
      showToast('Favicon updated.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Payment QR Scanner file upload handler
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isManager) {
      showToast('Only Admin can upload payment QR scanner assets.', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid format. Please upload a PNG, JPG, or SVG payment QR image.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size exceeds 5MB. Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setPaymentQrPreview(dataUrl);
      setFormData(prev => ({ ...prev, paymentQrUrl: dataUrl }));

      // Scanner validation check
      const check = await verifyUpiQrScanner(dataUrl);
      if (check.valid && check.payload) {
        showToast(`Payment QR scanner image updated & verified with scanner: ${check.payload}`, 'success');
      } else {
        showToast('Payment QR image updated. Tip: Click "Generate from UPI ID" for a guaranteed standards-compliant UPI QR.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateStandardUpiQr = async () => {
    if (isManager) return;
    const upiId = formData.upiId?.trim();
    if (!upiId) {
      showToast('Please enter a valid UPI ID (VPA) first.', 'error');
      return;
    }
    try {
      const upiUri = buildUpiPaymentUri({
        upiId,
        payeeName: formData.upiPayeeName || formData.businessName || 'PRITPAL SINGH',
        note: `${formData.businessName || 'Trendera'} Dry Cleaners`
      });
      const dataUrl = await renderBrandedPaymentCardDataUrl({
        upiUri,
        payeeName: formData.upiPayeeName || formData.businessName || 'PRITPAL SINGH',
        upiId,
        businessName: formData.businessName || 'Trendera Dry Cleaners'
      });
      setPaymentQrPreview(dataUrl);
      setFormData(prev => ({ ...prev, paymentQrUrl: dataUrl }));
      showToast('Branded professional payment QR card generated successfully from UPI ID!', 'success');
    } catch (err: any) {
      showToast(`Failed to generate UPI QR: ${err?.message}`, 'error');
    }
  };

  const handleClearQr = () => {
    if (isManager) return;
    setPaymentQrPreview('');
    setFormData(prev => ({ ...prev, paymentQrUrl: '' }));
    showToast('Payment QR scanner cleared. Order creation WhatsApp messages will send without QR code.', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isManager) {
      showToast('403 Forbidden: Only Admin role can persist business settings.', 'error');
      return;
    }

    const res = updateBusinessSettings(formData);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Business Settings & Branding</span>
                {isManager ? (
                  <span className="bg-amber-900/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-600/60 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only (Manager)
                  </span>
                ) : (
                  <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-600/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin Authorized
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Configure enterprise identity, tax identifiers, receipt branding, and customer portals.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Anti-Fraud Banner */}
        {isManager && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Security Protocol Active:</strong> Managers are restricted to operational tasks. To change business identity, rates, or branding, please request Admin intervention.
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('IDENTITY')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'IDENTITY'
                ? 'border-sky-600 text-sky-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'BRANDING'
                ? 'border-sky-600 text-sky-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo & Favicon</span>
          </button>

          <button
            onClick={() => setActiveTab('MESSAGING')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'MESSAGING'
                ? 'border-sky-600 text-sky-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Customer Messages & Receipt</span>
          </button>

          <button
            onClick={() => setActiveTab('TAX_FINANCIAL')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'TAX_FINANCIAL'
                ? 'border-sky-600 text-sky-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Tax & POS Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('HARDWARE')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'HARDWARE'
                ? 'border-sky-600 text-sky-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Hardware & Print Bridge</span>
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === 'IDENTITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Name (Header/Receipt)</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium disabled:bg-slate-100"
                    placeholder="Cleanera Dry Cleaning CRM"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch / Store Name</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium disabled:bg-slate-100"
                    placeholder="C2 Sector 1 Noida"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Branch Code (Invoice Prefix)</label>
                    {formData.branchCode !== suggestedBranchCode && (
                      <button
                        type="button"
                        disabled={isManager}
                        onClick={() => handleInputChange('branchCode', suggestedBranchCode)}
                        className="text-[11px] text-sky-600 hover:text-sky-800 font-bold hover:underline"
                        title="Auto-derive prefix from company name"
                      >
                        Auto-fill ({suggestedBranchCode})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.branchCode}
                    onChange={(e) => handleInputChange('branchCode', e.target.value.toUpperCase())}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-medium disabled:bg-slate-100"
                    placeholder="e.g. TE02"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Prefix used for piece tags and receipts (e.g. <strong className="text-slate-800 font-mono">{formData.branchCode || suggestedBranchCode}-019</strong>)
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST / VAT Tax Number</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-medium disabled:bg-slate-100"
                    placeholder="09AAACQ1234F1Z5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Store Address</label>
                <input
                  type="text"
                  disabled={isManager}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium disabled:bg-slate-100"
                  placeholder="C2, Sector 1, Block C, Noida Industrial Area"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN / Zip Code</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    disabled={isManager}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & UPLOADS */}
          {activeTab === 'BRANDING' && (
            <div className="space-y-6">
              {/* Logo Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Business Logo (Receipts, Portal & CRM Header)</span>
                </h4>
                <p className="text-slate-500 mb-4">
                  Recommended size: 300x120px. Supported formats: PNG, JPG, SVG (Max 3MB).
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-36 h-20 bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-center shadow-inner overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">No Logo</span>
                    )}
                  </div>

                  {!isManager ? (
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Upload Business Logo</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="text-[11px] text-slate-500">
                        Automatically updates CRM navigation, thermal receipt header, and customer payment gateway.
                      </div>
                    </div>
                  ) : (
                    <div className="text-amber-700 text-xs font-medium">
                      Manager cannot replace business branding assets.
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>CRM Browser Favicon</span>
                </h4>
                <p className="text-slate-500 mb-3">
                  Square 32x32 or 48x48 icon for browser tab display.
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shadow-inner">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">Icon</span>
                    )}
                  </div>

                  {!isManager && (
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Favicon</span>
                      <input
                        type="file"
                        accept="image/png, image/x-icon, image/svg+xml"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* UPI Payment Scanner & QR Code Section */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>UPI Payment Scanner & QR Code (WhatsApp Order Delivery)</span>
                  </h4>
                  {paymentQrPreview && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Active Scanner
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mb-4">
                  The payment scanner image attached to WhatsApp order confirmations and shown on the customer self-service invoice.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-5 mb-4">
                  {/* Scanner Image Preview */}
                  <div className="w-36 h-44 bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-inner overflow-hidden shrink-0">
                    {paymentQrPreview ? (
                      <img
                        src={paymentQrPreview}
                        alt="Payment QR Scanner Preview"
                        className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition"
                        onClick={() => window.open(paymentQrPreview, '_blank')}
                        title="Click to view full scanner"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                        <span className="text-slate-400 text-[10px]">No QR Scanner Configured</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Settings */}
                  <div className="flex-1 space-y-3 w-full">
                    {!isManager ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{paymentQrPreview ? 'Replace QR Scanner' : 'Upload QR Scanner'}</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                            onChange={handleQrUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleGenerateStandardUpiQr}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer"
                          title="Generate a standards-compliant UPI QR scanner code using the configured UPI ID and Payee Name"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Generate from UPI ID</span>
                        </button>

                        {paymentQrPreview && (
                          <button
                            type="button"
                            onClick={handleClearQr}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded text-xs font-semibold transition"
                            title="Remove QR code to test WhatsApp without QR"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove QR</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-amber-700 text-xs font-medium">
                        Manager cannot modify payment scanner configuration.
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          UPI ID (VPA):
                        </label>
                        <input
                          type="text"
                          disabled={isManager}
                          value={formData.upiId || ''}
                          onChange={(e) => handleInputChange('upiId', e.target.value)}
                          placeholder="e.g. 9041590866@hdfc"
                          className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs text-slate-900 disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Payee Name (Account Holder):
                        </label>
                        <input
                          type="text"
                          disabled={isManager}
                          value={formData.upiPayeeName || ''}
                          onChange={(e) => handleInputChange('upiPayeeName', e.target.value)}
                          placeholder="e.g. PRITPAL SINGH"
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-slate-900 disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isManager}
                          checked={formData.includeQrInWhatsApp !== false}
                          onChange={(e) => handleInputChange('includeQrInWhatsApp', e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                        <span>Automatically append Payment QR Scanner to WhatsApp Order Confirmation</span>
                      </label>
                      <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
                        When enabled, newly created orders will include payment instructions and the QR code scanner in the customer message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER MESSAGING & RECEIPT CONTENT */}
          {activeTab === 'MESSAGING' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Marketing Message on Thermal Receipts (Screenshot 7 & 11)
                </label>
                <input
                  type="text"
                  disabled={isManager}
                  value={formData.marketingMessage}
                  onChange={(e) => handleInputChange('marketingMessage', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  placeholder="Your space for marketing or any other message."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Footer Note</label>
                <textarea
                  rows={2}
                  disabled={isManager}
                  value={formData.receiptFooterMessage}
                  onChange={(e) => handleInputChange('receiptFooterMessage', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Portal Welcome Header</label>
                <input
                  type="text"
                  disabled={isManager}
                  value={formData.customerPortalMessage}
                  onChange={(e) => handleInputChange('customerPortalMessage', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Terms & Conditions</label>
                <textarea
                  rows={3}
                  disabled={isManager}
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono text-[11px] disabled:bg-slate-100"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TAX & FINANCIAL RULES */}
          {activeTab === 'TAX_FINANCIAL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default GST / Tax Rate (%)</label>
                  <input
                    type="number"
                    disabled={isManager}
                    value={formData.taxRatePercent}
                    onChange={(e) => handleInputChange('taxRatePercent', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-bold disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.currencySymbol}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-bold disabled:bg-slate-100"
                    placeholder="Rs."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Garment Ready Time (Days)</label>
                  <input
                    type="number"
                    disabled={isManager}
                    value={formData.defaultDueDays}
                    onChange={(e) => handleInputChange('defaultDueDays', parseInt(e.target.value) || 4)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Online Portal URL Domain</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={formData.onlinePortalDomain}
                    onChange={(e) => handleInputChange('onlinePortalDomain', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono text-xs disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isManager}
                    checked={formData.maskPhoneOnThermalReceipt}
                    onChange={(e) => handleInputChange('maskPhoneOnThermalReceipt', e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span className="text-slate-800 font-semibold">
                    Mask customer mobile phone on thermal receipts (e.g. ****7124) for privacy
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: HARDWARE & PHYSICAL PRINT BRIDGE */}
          {activeTab === 'HARDWARE' && (
            <div className="space-y-4">
              {/* Status Header Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-800 border border-slate-700 text-sky-400">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <span>Physical Printer (Local Print Bridge)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        bridgeStatus === 'CONNECTED'
                          ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-900 text-amber-300 border border-amber-700'
                      }`}>
                        {bridgeStatus === 'CONNECTED' ? `Bridge: Online (ws://${bridgeConfig.host}:${bridgeConfig.port})` : 'Bridge: Offline (Port 8182)'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Direct printing to HP LaserJet 1020 Plus and Windows spooler via local QZ Tray or Cleanera bridge.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsTestingConnect(true);
                      try {
                        const res = await printBridgeService.testConnection();
                        setDetectedPrinters(res.printers);
                        if (res.connected) {
                          showToast(`Bridge Connected • ${res.printers.length} printer(s) detected.`, 'success');
                        } else {
                          showToast('Local Print Bridge daemon offline on port 8182.', 'warning');
                        }
                      } finally {
                        setIsTestingConnect(false);
                      }
                    }}
                    disabled={isTestingConnect}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-xs flex items-center gap-1.5 transition"
                  >
                    <Wifi className={`w-3.5 h-3.5 ${isTestingConnect ? 'animate-spin' : ''}`} />
                    <span>{isTestingConnect ? 'Checking...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsTestingPrint(true);
                      try {
                        const res = await printBridgeService.testPrint();
                        if (res.success) {
                          showToast(`Test page sent to [${res.printerName}]. Job ID: ${res.jobId}`, 'success');
                        } else {
                          showToast(`Test Print Error: ${res.error || res.message}`, 'error');
                        }
                      } finally {
                        setIsTestingPrint(false);
                      }
                    }}
                    disabled={isTestingPrint}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs flex items-center gap-1.5 transition"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTestingPrint ? 'animate-spin' : ''}`} />
                    <span>{isTestingPrint ? 'Printing...' : 'Test Print'}</span>
                  </button>
                </div>
              </div>

              {/* Hardware Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Printer Name</label>
                  <input
                    type="text"
                    disabled={isManager}
                    value={bridgeConfig.selectedPrinterName}
                    onChange={(e) => {
                      const val = e.target.value;
                      printBridgeService.updateConfig({ selectedPrinterName: val, tagPrinterName: val });
                      setBridgeConfig(printBridgeService.getConfig());
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-medium disabled:bg-slate-100"
                    placeholder="HP LaserJet 1020 Plus"
                  />
                  <span className="text-[10px] text-slate-500">
                    Exact Windows printer spooler name as installed on this PC.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Printer Archetype</label>
                  <select
                    disabled={isManager}
                    value={bridgeConfig.printerType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      printBridgeService.updateConfig({ printerType: val });
                      setBridgeConfig(printBridgeService.getConfig());
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium disabled:bg-slate-100"
                  >
                    <option value="STANDARD_LASER">Standard Laser (HP LaserJet 1020 Plus - Windows Spooler)</option>
                    <option value="LABEL_TAG">Thermal Label Printer (TSC TE200 / Zebra ZD220)</option>
                    <option value="THERMAL_RECEIPT">80mm POS Thermal Receipt (Epson TM-T82)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">
                    HP LaserJet 1020 Plus uses standard GDI / raster formatting.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bridge WebSocket Host & Port</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={isManager}
                      value={bridgeConfig.host}
                      onChange={(e) => {
                        printBridgeService.updateConfig({ host: e.target.value });
                        setBridgeConfig(printBridgeService.getConfig());
                      }}
                      className="w-2/3 p-2 border border-slate-300 rounded text-slate-900 font-mono text-xs disabled:bg-slate-100"
                      placeholder="localhost"
                    />
                    <input
                      type="number"
                      disabled={isManager}
                      value={bridgeConfig.port}
                      onChange={(e) => {
                        printBridgeService.updateConfig({ port: parseInt(e.target.value) || 8182 });
                        setBridgeConfig(printBridgeService.getConfig());
                      }}
                      className="w-1/3 p-2 border border-slate-300 rounded text-slate-900 font-mono text-xs disabled:bg-slate-100"
                      placeholder="8182"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Default local QZ Tray port: 8182.</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Print Resolution Density</label>
                  <select
                    disabled={isManager}
                    value={bridgeConfig.densityDpi}
                    onChange={(e) => {
                      printBridgeService.updateConfig({ densityDpi: parseInt(e.target.value) || 600 });
                      setBridgeConfig(printBridgeService.getConfig());
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium disabled:bg-slate-100"
                  >
                    <option value="600">600 DPI (High Resolution - HP LaserJet 1020 Plus)</option>
                    <option value="300">300 DPI (Fine Laser / Thermal)</option>
                    <option value="203">203 DPI (Standard POS Thermal)</option>
                  </select>
                </div>
              </div>

              {/* Detected Printers Table */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Installed Windows Printers Detected ({detectedPrinters.length}):</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await printBridgeService.queryPrinters();
                      setDetectedPrinters(res);
                      showToast(`Discovered ${res.length} Windows printer(s).`, 'info');
                    }}
                    className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Spooler List
                  </button>
                </div>

                {detectedPrinters.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {detectedPrinters.map(p => (
                      <div key={p.name} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                        <span className="font-mono font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {p.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    No printers queried yet. Click 'Test Connection' or 'Refresh Spooler List' while the bridge is active.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-6">
            <div className="text-[11px] text-slate-500">
              Changes persist across tenant database and live customer-facing links.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs transition"
              >
                Close
              </button>

              {!isManager ? (
                <button
                  type="submit"
                  id="btn-save-settings-admin"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings & Branding</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 bg-slate-300 text-slate-500 rounded font-bold text-xs flex items-center gap-1.5 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Authority Required</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
