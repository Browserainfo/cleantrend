import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  X, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Phone, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Layers, 
  MapPin, 
  ShoppingBag, 
  ExternalLink,
  RefreshCw,
  Clock,
  Copy,
  Check,
  Download,
  Smartphone,
  Send
} from 'lucide-react';
import { Order, PaymentTransaction, BusinessSettings } from '../../types';
import { printThermalBookingReceipt } from '../../utils/printUtils';
import { numberToIndianWords } from '../../utils/currencyUtils';
import { fetchInvoiceFromServer, findOrderFromReceiptQuery } from '../../utils/portalUrlUtils';
import { generateOrderUpiQr } from '../../utils/upiQrUtils';

interface PublicInvoicePortalPageProps {
  order?: Order | null;
  invalidQuery?: string | null;
  onExitToCrm?: () => void;
}

export const PublicInvoicePortalPage: React.FC<PublicInvoicePortalPageProps> = ({
  order: initialOrder,
  invalidQuery,
  onExitToCrm
}) => {
  const { businessSettings: contextSettings, orders: contextOrders, submitOrderUpiRef, showToast } = useApp();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder || null);
  const [activeSettings, setActiveSettings] = useState<BusinessSettings>(contextSettings);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrder && Boolean(invalidQuery));
  const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);

  // UPI payment state
  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState<boolean>(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [upiPayUri, setUpiPayUri] = useState<string>('');
  const [copiedUpiId, setCopiedUpiId] = useState<boolean>(false);
  const [copiedUpiLink, setCopiedUpiLink] = useState<boolean>(false);

  // UTR submission state
  const [utrNumberInput, setUtrNumberInput] = useState<string>('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [utrSubmittedSuccess, setUtrSubmittedSuccess] = useState<string | null>(null);

  const effectiveUpiId = activeSettings.upiId || '9041590866@hdfc';
  const effectivePayeeName = activeSettings.upiPayeeName || 'PRITPAL SINGH';

  // Ensure browser title & Open Graph metadata match requested public invoice branding
  useEffect(() => {
    document.title = 'Trendera Invoice';

    const setMeta = (attribute: string, attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', 'Trendera Customer Invoice / Receipt');
    setMeta('property', 'og:title', 'Trendera Invoice');
    setMeta('property', 'og:description', 'Trendera Customer Invoice / Receipt');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Trendera');
    setMeta('name', 'twitter:title', 'Trendera Invoice');
    setMeta('name', 'twitter:description', 'Trendera Customer Invoice / Receipt');
  }, []);

  // Dynamically generate standards-compliant UPI QR for the current order
  useEffect(() => {
    if (currentOrder && currentOrder.balanceDue > 0) {
      generateOrderUpiQr(currentOrder, activeSettings).then(res => {
        setDynamicQrUrl(res.qrDataUrl);
        setUpiPayUri(res.upiUri);
      }).catch(err => {
        console.warn('Could not generate dynamic portal QR:', err);
      });
    }
  }, [currentOrder, activeSettings]);

  // Load from backend server database if not found immediately in context
  useEffect(() => {
    let isMounted = true;

    async function loadInvoice() {
      if (invalidQuery) {
        setIsLoading(true);
        try {
          // 1. Try fetching from server API endpoint
          const serverData = await fetchInvoiceFromServer(invalidQuery);
          if (isMounted && serverData && serverData.order) {
            setCurrentOrder(serverData.order);
            if (serverData.settings) {
              setActiveSettings(prev => ({ ...prev, ...serverData.settings }));
            }
            setIsLoading(false);
            setFetchAttempted(true);
            return;
          }
        } catch (e) {
          console.error('Error fetching invoice from server:', e);
        }

        // 2. Client context fallback
        if (isMounted) {
          const fallback = findOrderFromReceiptQuery(invalidQuery, contextOrders);
          if (fallback) {
            setCurrentOrder(fallback);
          } else {
            setCurrentOrder(null);
          }
          setIsLoading(false);
          setFetchAttempted(true);
        }
      } else if (initialOrder) {
        setCurrentOrder(initialOrder);
        setIsLoading(false);
        setFetchAttempted(true);
      } else {
        setIsLoading(false);
        setFetchAttempted(true);
      }
    }

    loadInvoice();

    return () => {
      isMounted = false;
    };
  }, [invalidQuery, initialOrder, contextOrders]);

  // Copy UPI ID to clipboard
  const handleCopyUpiId = () => {
    try {
      navigator.clipboard.writeText(effectiveUpiId);
      setCopiedUpiId(true);
      showToast(`Copied UPI ID "${effectiveUpiId}" to clipboard!`, 'success');
      setTimeout(() => setCopiedUpiId(false), 2500);
    } catch {
      showToast(`UPI ID: ${effectiveUpiId}`, 'info');
    }
  };

  // Copy UPI Link to clipboard
  const handleCopyUpiLink = () => {
    const link = upiPayUri || `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectivePayeeName)}&am=${currentOrder?.balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Trendera Order ${currentOrder?.orderNumber}`)}`;
    try {
      navigator.clipboard.writeText(link);
      setCopiedUpiLink(true);
      showToast('Copied UPI Payment Link!', 'success');
      setTimeout(() => setCopiedUpiLink(false), 2500);
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  // Download QR Code image
  const handleDownloadQr = () => {
    const src = dynamicQrUrl || activeSettings.paymentQrUrl || '/payment-qr.jpg';
    const a = document.createElement('a');
    a.href = src;
    a.download = `Trendera-Order-${currentOrder?.orderNumber || 'Invoice'}-UPI-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Payment QR Code image downloaded.', 'success');
  };

  // Submit UTR Reference Number
  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentOrder) return;
    const cleanUtr = utrNumberInput.trim();
    if (!cleanUtr || cleanUtr.length < 4) {
      showToast('Please enter a valid UPI transaction reference / UTR number.', 'warning');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const res = submitOrderUpiRef(currentOrder.id, cleanUtr);
      if (res && res.success === false) {
        showToast(res.error || 'Failed to submit UPI reference.', 'error');
      } else {
        setUtrSubmittedSuccess(cleanUtr);
        setCurrentOrder(prev => prev ? ({
          ...prev,
          submittedUpiRef: cleanUtr,
          upiRefSubmittedAt: new Date().toISOString()
        }) : null);
        showToast(`UPI Reference #${cleanUtr} submitted. Store manager will verify bank credit.`, 'success');
      }
    } catch (err) {
      console.error('Error submitting UPI ref:', err);
      showToast('Could not submit reference number. Please try again.', 'error');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const handleOpenPaymentFlow = () => {
    setIsPayNowModalOpen(true);
    const el = document.getElementById('upi-payment-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-sky-500 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-white">Retrieving Digital Invoice...</h2>
          <p className="text-slate-400 text-xs font-mono">Reference: {invalidQuery || 'Loading'}</p>
        </div>
      </div>
    );
  }

  // 2. Invoice Not Found State
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Invoice Not Found</h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We could not find any active dry cleaning order for reference{' '}
              {invalidQuery ? <strong className="text-rose-300 font-mono">"{invalidQuery}"</strong> : 'provided in this link'}.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 text-left space-y-2 text-xs">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{activeSettings.businessName}</span>
            </div>
            <p className="text-slate-400">{activeSettings.address}</p>
            <div className="text-slate-300 flex items-center gap-1 font-semibold pt-1 border-t border-slate-800">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Helpline: {activeSettings.phone}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-slate-500">
              If you believe this is an error, please check the link in your WhatsApp confirmation message or contact the branch directly.
            </p>

            {onExitToCrm && (
              <button
                onClick={onExitToCrm}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
              >
                <span>Staff & Management Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const effectiveUpiUri = upiPayUri || `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectivePayeeName)}&am=${currentOrder.balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Trendera Order ${currentOrder.orderNumber}`)}&tr=ORD-${currentOrder.orderNumber}`;

  // 3. Render Verified Public Invoice
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Brand Banner */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs font-black text-sm">
            T
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{activeSettings.businessName}</span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Customer Bill & UPI Payment Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              printThermalBookingReceipt(currentOrder, activeSettings);
              showToast('Opening thermal print dialog...', 'info');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Bill</span>
          </button>

          {onExitToCrm && (
            <button
              onClick={onExitToCrm}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-medium px-2 py-1 transition cursor-pointer"
              title="Switch to CRM Terminal"
            >
              Staff Portal
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 flex flex-col space-y-4">
        {/* TOP GREEN PAYMENT / STATUS NOTIFICATION BAR */}
        <div className="bg-[#5ea500] text-white px-4 sm:px-6 py-3 rounded-xl flex flex-wrap items-center justify-between shadow-md gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wide opacity-90">Current Due Amount :</span>
            <span className="font-mono text-xl sm:text-2xl font-black">₹{(currentOrder.balanceDue ?? 0).toFixed(2)}</span>
          </div>

          {currentOrder.balanceDue > 0 ? (
            <button
              id="public-portal-pay-now-btn"
              onClick={handleOpenPaymentFlow}
              className="bg-[#78b300] hover:bg-[#86c400] active:scale-98 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm border border-white/40 transition flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-white" />
              <span>Pay via UPI / Scan QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border border-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Paid in Full</span>
            </span>
          )}
        </div>

        {/* SUBMITTED UTR NOTICE BANNER (IF PENDING VERIFICATION) */}
        {(currentOrder.submittedUpiRef || utrSubmittedSuccess) && currentOrder.balanceDue > 0 && (
          <div className="bg-sky-50 border border-sky-300 p-3.5 rounded-xl flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0 text-sky-700 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-sky-900 flex items-center gap-2">
                <span>UPI Reference Submitted for Verification</span>
                <span className="font-mono bg-sky-200/80 text-sky-950 px-2 py-0.5 rounded font-black text-[11px]">
                  Ref #{currentOrder.submittedUpiRef || utrSubmittedSuccess}
                </span>
              </div>
              <p className="text-sky-800">
                Our store manager (<strong>{effectivePayeeName}</strong>) will verify this credit in the bank statement and update your bill status. Thank you for your payment!
              </p>
            </div>
          </div>
        )}

        {/* Paper Invoice Container */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-8 space-y-6">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeSettings.businessName}
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mt-1">{activeSettings.address}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                <span>Phone: {activeSettings.phone}</span>
                {activeSettings.gstin && <span>GSTIN: {activeSettings.gstin}</span>}
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg w-full sm:w-auto border sm:border-0 border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice / Receipt</div>
              <div className="font-mono text-lg sm:text-xl font-black text-slate-800">#{currentOrder.orderNumber}</div>
              <div className="text-xs text-slate-500 mt-1">Series: {currentOrder.orderSeries || `*${currentOrder.orderNumber}-1*`}</div>
              <div className="text-xs text-slate-500">Branch: {currentOrder.branchCode || 'TE02'}</div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Customer Details</span>
              <div className="font-black text-slate-800 text-sm">{currentOrder.customerName}</div>
              <div className="text-slate-600 font-mono">Mobile: {currentOrder.customerMobile}</div>
              {currentOrder.customerAddress && (
                <div className="text-slate-500 leading-relaxed">{currentOrder.customerAddress}</div>
              )}
              {currentOrder.customerPlaceOfSupply && (
                <div className="text-slate-500 font-medium">Place of Supply: {currentOrder.customerPlaceOfSupply}</div>
              )}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Order Schedule</span>
              <div className="text-slate-700">
                <span className="text-slate-500">Booked Date: </span>
                <strong className="text-slate-800">{currentOrder.orderDate}</strong>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-500">Due Delivery Date: </span>
                <strong className="text-emerald-700 font-bold">{currentOrder.dueDate}</strong>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-500">Order Status: </span>
                <span className="inline-block bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  {currentOrder.status}
                </span>
              </div>
            </div>
          </div>

          {/* Garments Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Garments & Services</h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentOrder.items || []).map((item, idx) => {
                    const unitPrice = Number((item as any).unitPrice ?? item.basePrice ?? (item.totalItemPrice ? (item.totalItemPrice / (item.quantity || 1)) : 0)) || 0;
                    const totalPrice = Number(item.totalItemPrice ?? (unitPrice * (item.quantity || 1))) || 0;
                    const serviceName = item.serviceName || (item as any).serviceType || (item.serviceCode === 'DC' ? 'Dry Cleaning' : item.serviceCode) || 'Dry Cleaning';
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {item.garmentName}
                          {item.color && <span className="ml-2 text-[10px] font-normal text-slate-500">({item.color})</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{serviceName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity || 1}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹{totalPrice.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 space-y-1.5 max-w-sm">
              <div className="font-semibold text-slate-700">Payment & Inspection Terms:</div>
              <p className="leading-relaxed">
                We will inform you in case the order is updated after detailed in-store inspection. Please retain this receipt for garment handover.
              </p>
              <div className="text-[11px] text-slate-400 italic pt-1">
                Amount in words: {numberToIndianWords(Math.round(currentOrder.netAmount || 0))} Only
              </div>
            </div>

            {/* Calculations Card */}
            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Items Gross:</span>
                <span className="font-mono">₹{(currentOrder.grossAmount ?? 0).toFixed(2)}</span>
              </div>

              {currentOrder.deliveryCharge && currentOrder.deliveryCharge > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-bold">+₹{(currentOrder.deliveryCharge ?? 0).toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.surchargeAmount && currentOrder.surchargeAmount > 0 ? (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Surcharge ({currentOrder.surchargeType?.replace(/_/g, ' ')}):</span>
                  <span className="font-mono font-bold">+₹{(currentOrder.surchargeAmount ?? 0).toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.discountAmount && currentOrder.discountAmount > 0 ? (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount ({currentOrder.discountPercent}%):</span>
                  <span className="font-mono font-bold">-₹{(currentOrder.discountAmount ?? 0).toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">₹{(currentOrder.roundOff ?? 0).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-300 pt-2">
                <span>Net Total:</span>
                <span className="font-mono text-base text-slate-900 font-black">₹{(currentOrder.netAmount ?? 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span className="font-mono font-bold text-emerald-700">₹{(currentOrder.advancePaid ?? 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-rose-700 font-black text-sm sm:text-base border-t-2 border-slate-300 pt-2">
                <span>Balance Due:</span>
                <span className="font-mono text-lg font-black text-rose-600">₹{(currentOrder.balanceDue ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ON-PAGE UPI PAYMENT SCANNER SECTION */}
          {currentOrder.balanceDue > 0 && (
            <div id="upi-payment-section" className="pt-6 border-t-2 border-emerald-200">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl border-2 border-emerald-300 p-4 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-700" />
                      <h2 className="font-black text-slate-900 text-base sm:text-lg">Scan & Pay via UPI</h2>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pay instantly with Google Pay, PhonePe, Paytm, BHIM, or any banking app
                    </p>
                  </div>
                  <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-mono font-black text-sm shadow-xs">
                    Payable: ₹{currentOrder.balanceDue.toFixed(2)}
                  </div>
                </div>

                {/* Direct Mobile Pay CTA */}
                <div>
                  <a
                    href={effectiveUpiUri}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-99 text-white font-black py-3.5 px-4 rounded-xl shadow-md transition text-sm cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>⚡ Pay via UPI App (Tap to Open GPay / PhonePe / Paytm)</span>
                  </a>
                  <p className="text-center text-[11px] text-slate-500 mt-1">
                    On mobile, tap above to open your UPI payment app directly with exact amount prefilled.
                  </p>
                </div>

                {/* Scanner & UPI Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                  {/* Left: QR Code */}
                  <div className="flex flex-col items-center justify-center p-3 text-center space-y-3">
                    <div className="bg-white p-2.5 rounded-xl border-2 border-slate-300 shadow-sm inline-block">
                      <img
                        src={dynamicQrUrl || activeSettings.paymentQrUrl || '/payment-qr.jpg'}
                        alt="Scan UPI QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUpiLink}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
                      >
                        {copiedUpiLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpiLink ? 'Link Copied!' : 'Copy Pay Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Pritpal's UPI Details & Instructions */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Official Store Payee Details:
                      </div>
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {effectivePayeeName}
                      </div>
                      <div className="text-xs text-slate-600">
                        Business: <span className="font-semibold">{activeSettings.businessName}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Bank: <span className="font-semibold">HDFC Bank</span>
                      </div>

                      {/* UPI ID with One-Click Copy */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Pritpal's UPI ID:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={effectiveUpiId}
                            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-slate-800 select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                              copiedUpiId 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                          >
                            {copiedUpiId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUpiId ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit UPI Reference / UTR Section */}
                    <form onSubmit={handleSubmitUtr} className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paid? Enter UPI UTR / Transaction ID:</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={utrNumberInput}
                          onChange={(e) => setUtrNumberInput(e.target.value)}
                          placeholder="e.g. 423456789012"
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingUtr || !utrNumberInput.trim()}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingUtr ? 'Saving...' : 'Submit'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Enter the 12-digit reference number from Google Pay, PhonePe, or Paytm receipt to notify store manager Pritpal Singh for instant verification.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                printThermalBookingReceipt(currentOrder, activeSettings);
                showToast('Thermal receipt sent to printer.', 'success');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Thermal Receipt</span>
            </button>

            {currentOrder.balanceDue > 0 && (
              <button
                onClick={handleOpenPaymentFlow}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay Balance (₹{(currentOrder.balanceDue ?? 0).toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* UPI PAYMENT & SCANNER MODAL POPUP */}
      {isPayNowModalOpen && currentOrder.balanceDue > 0 && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-slate-300 space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">UPI Payment & Scanner</h3>
                  <p className="text-[11px] text-slate-500">To: {effectivePayeeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayNowModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payable Amount Highlight */}
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-emerald-950 block">Order #{currentOrder.orderNumber} Due:</span>
                <span className="text-[11px] text-emerald-700">Customer: {currentOrder.customerName}</span>
              </div>
              <span className="font-mono text-2xl font-black text-emerald-800">
                ₹{(currentOrder.balanceDue ?? 0).toFixed(2)}
              </span>
            </div>

            {/* Direct Mobile Pay Button */}
            <div>
              <a
                href={effectiveUpiUri}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition text-xs sm:text-sm active:scale-98 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>⚡ Open UPI App (GPay / PhonePe / Paytm)</span>
              </a>
              <div className="text-center text-[10px] text-slate-500 mt-1">
                Tapping opens your phone's UPI app with ₹{(currentOrder.balanceDue ?? 0).toFixed(2)} prefilled
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Or Scan QR with Any App
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Large Centered QR Code */}
            <div className="flex flex-col items-center justify-center p-2 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-sm inline-block">
                <img
                  src={dynamicQrUrl || activeSettings.paymentQrUrl || '/payment-qr.jpg'}
                  alt="UPI QR Scanner"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-300 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download QR</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUpiLink}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-300 cursor-pointer"
                >
                  {copiedUpiLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUpiLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Pritpal's UPI ID Box with One-Click Copy */}
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                <span>Payee: <strong>{effectivePayeeName}</strong></span>
                <span>Bank: <strong>HDFC Bank</strong></span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  readOnly
                  value={effectiveUpiId}
                  className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs font-bold text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                    copiedUpiId ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                >
                  {copiedUpiId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpiId ? 'Copied' : 'Copy UPI'}</span>
                </button>
              </div>
            </div>

            {/* UTR Reference Input Form */}
            <form onSubmit={handleSubmitUtr} className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Completed payment? Submit 12-digit UPI UTR Ref No:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={utrNumberInput}
                  onChange={(e) => setUtrNumberInput(e.target.value)}
                  placeholder="e.g. 423456789012"
                  className="flex-1 p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingUtr || !utrNumberInput.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  {isSubmittingUtr ? 'Saving...' : 'Submit'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Store manager Pritpal Singh will verify the credit in the bank statement and update your bill.
              </p>
            </form>

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPayNowModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
