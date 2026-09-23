import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Printer, 
  X, 
  Smartphone, 
  ArrowRight,
  Sparkles,
  Lock,
  Copy,
  Check,
  Download,
  Send,
  Clock
} from 'lucide-react';
import { printThermalBookingReceipt } from '../../utils/printUtils';
import { generateOrderUpiQr } from '../../utils/upiQrUtils';

export const CustomerPaymentPortal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    selectedOrder, 
    orders, 
    businessSettings, 
    submitOrderUpiRef,
    showToast 
  } = useApp();

  const order = selectedOrder || orders[0];

  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState<boolean>(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [upiPayUri, setUpiPayUri] = useState<string>('');
  const [copiedUpiId, setCopiedUpiId] = useState<boolean>(false);
  const [copiedUpiLink, setCopiedUpiLink] = useState<boolean>(false);
  const [utrNumberInput, setUtrNumberInput] = useState<string>('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [utrSubmitted, setUtrSubmitted] = useState<string | null>(null);

  const effectiveUpiId = businessSettings.upiId || 'smarthub.2988354@hdfcbank';
  const effectivePayeeName = businessSettings.upiPayeeName || 'Trendera Dry Cleaning';

  useEffect(() => {
    if (order && order.balanceDue > 0) {
      generateOrderUpiQr(order, businessSettings).then(res => {
        setDynamicQrUrl(res.qrDataUrl);
        setUpiPayUri(res.upiUri);
      }).catch(err => {
        console.warn('Could not generate dynamic portal QR:', err);
      });
    }
  }, [order, businessSettings]);

  if (!isOpen || !order) return null;

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

  const handleCopyUpiLink = () => {
    const link = upiPayUri || `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectivePayeeName)}&am=${order.balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Trendera Order ${order.orderNumber}`)}`;
    try {
      navigator.clipboard.writeText(link);
      setCopiedUpiLink(true);
      showToast('Copied UPI Payment Link!', 'success');
      setTimeout(() => setCopiedUpiLink(false), 2500);
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const handleDownloadQr = () => {
    const src = dynamicQrUrl || businessSettings.paymentQrUrl || '/payment-qr.jpg';
    const a = document.createElement('a');
    a.href = src;
    a.download = `Trendera-Order-${order.orderNumber}-UPI-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Payment QR Code downloaded.', 'success');
  };

  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUtr = utrNumberInput.trim();
    if (!cleanUtr || cleanUtr.length < 4) {
      showToast('Please enter a valid UPI transaction reference / UTR number.', 'warning');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      submitOrderUpiRef(order.id, cleanUtr);
      setUtrSubmitted(cleanUtr);
      showToast(`UPI Reference #${cleanUtr} submitted. Store manager will verify bank credit.`, 'success');
    } catch (err) {
      console.error('Error submitting UPI ref:', err);
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const effectiveUpiUri = upiPayUri || `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectivePayeeName)}&am=${order.balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Trendera Order ${order.orderNumber}`)}&tr=ORD-${order.orderNumber}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Browser Mock URL Bar */}
        <div className="bg-slate-800 px-4 py-2 text-slate-300 text-xs flex items-center justify-between border-b border-slate-700 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="bg-slate-900 px-3 py-1 rounded text-[11px] font-mono text-slate-300 truncate flex-1 flex items-center gap-1.5 border border-slate-700">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{order.receiptUrl}</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP GREEN NOTIFICATION BAR */}
        <div className="bg-[#5ea500] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
          <div className="font-bold text-sm sm:text-base flex items-center gap-2">
            <span>Current Due Amount :</span>
            <span className="font-mono text-lg font-extrabold">₹{order.balanceDue.toFixed(2)}</span>
          </div>

          {order.balanceDue > 0 ? (
            <button
              onClick={() => setIsPayNowModalOpen(true)}
              className="bg-[#78b300] hover:bg-[#86c400] text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-lg shadow-xs border border-white/40 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay via UPI / Scan QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="bg-emerald-800 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid in Full</span>
            </span>
          )}
        </div>

        {/* UTR Notice if submitted */}
        {(order.submittedUpiRef || utrSubmitted) && order.balanceDue > 0 && (
          <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 flex items-center justify-between text-xs text-sky-900">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>UPI UTR <strong>#{order.submittedUpiRef || utrSubmitted}</strong> submitted for store bank verification.</span>
            </span>
            <span className="font-semibold text-[11px] text-sky-700">Verifying with HDFC Bank</span>
          </div>
        )}

        {/* Main Invoice View Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Header section */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{businessSettings.businessName}</h2>
              <p className="text-xs text-slate-500">{businessSettings.address}</p>
              <p className="text-xs text-slate-500">Phone: {businessSettings.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">TAX INVOICE</span>
              <span className="font-mono text-lg font-bold text-slate-800">#{order.orderNumber}</span>
              <p className="text-xs text-slate-500">Date: {order.orderDate}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Billed To:</span>
              <span className="font-bold text-slate-800 text-sm">{order.customerName}</span>
              <p className="text-slate-600 font-mono">{order.customerMobile}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Delivery Due:</span>
              <span className="font-bold text-emerald-700">{order.dueDate}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2">Garment</th>
                <th className="p-2">Service</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.items || []).map((it, idx) => {
                const itemUnitPrice = Number((it as any).unitPrice ?? it.basePrice ?? ((it.totalItemPrice && it.quantity) ? (it.totalItemPrice / it.quantity) : 0)) || 0;
                const itemTotalPrice = Number(it.totalItemPrice ?? (itemUnitPrice * (it.quantity || 1))) || 0;
                const serviceLabel = it.serviceName || (it as any).serviceType || (it.serviceCode === 'DC' ? 'Dry Cleaning' : it.serviceCode) || 'Dry Clean';
                return (
                  <tr key={idx}>
                    <td className="p-2 font-medium text-slate-800">{it.garmentName}</td>
                    <td className="p-2 text-slate-600">{serviceLabel}</td>
                    <td className="p-2 text-center">{it.quantity || 1}</td>
                    <td className="p-2 text-right font-mono">₹{itemUnitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono font-bold">₹{itemTotalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end pt-3 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Items:</span>
                <span className="font-mono">₹{order.grossAmount.toFixed(2)}</span>
              </div>
              {order.deliveryCharge && order.deliveryCharge > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">+₹{order.deliveryCharge.toFixed(2)}</span>
                </div>
              ) : null}
              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount ({order.discountPercent}%):</span>
                  <span className="font-mono">-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {order.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">₹{order.roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-sm">
                <span>Net Amount:</span>
                <span className="font-mono">₹{order.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span className="font-mono font-bold text-emerald-700">₹{order.advancePaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-rose-600 text-sm border-t border-slate-300 pt-1">
                <span>Balance Due:</span>
                <span className="font-mono">₹{order.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              printThermalBookingReceipt(order, businessSettings);
              showToast('Thermal receipt sent to printer.', 'success');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          {order.balanceDue > 0 && (
            <button
              onClick={() => setIsPayNowModalOpen(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black flex items-center gap-2 cursor-pointer shadow-md"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan & Pay via UPI (₹{order.balanceDue.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>

      {/* UPI PAYMENT MODAL */}
      {isPayNowModalOpen && order.balanceDue > 0 && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-60 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-slate-300 space-y-4">
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
              <button onClick={() => setIsPayNowModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-950">Payable Amount:</span>
              <span className="font-mono text-xl font-black text-emerald-800">₹{order.balanceDue.toFixed(2)}</span>
            </div>

            {/* Direct Mobile Pay */}
            <a
              href={effectiveUpiUri}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>⚡ Open UPI App (GPay / PhonePe / Paytm)</span>
            </a>

            {/* Centered QR */}
            <div className="flex flex-col items-center justify-center p-2 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={dynamicQrUrl || businessSettings.paymentQrUrl || '/payment-qr.jpg'}
                alt="UPI QR Scanner"
                className="w-44 h-44 object-contain bg-white p-2 rounded-xl border border-slate-300 shadow-xs"
              />
              <div className="flex items-center gap-2">
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

            {/* UPI ID Box */}
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>Payee: <strong>{effectivePayeeName}</strong></span>
                <span>Bank: <strong>HDFC Bank</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={effectiveUpiId}
                  className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs font-bold text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    copiedUpiId ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                >
                  {copiedUpiId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUpiId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Submit Reference */}
            <form onSubmit={handleSubmitUtr} className="space-y-1 text-xs">
              <label className="block text-[11px] font-bold text-slate-700">Submit 12-digit UPI UTR / Txn ID:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={utrNumberInput}
                  onChange={(e) => setUtrNumberInput(e.target.value)}
                  placeholder="e.g. 423456789012"
                  className="flex-1 p-2 border border-slate-300 rounded font-mono text-xs bg-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingUtr || !utrNumberInput.trim()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                >
                  Submit
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPayNowModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
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
