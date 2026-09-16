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
  Clock
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
  const { businessSettings: contextSettings, orders: contextOrders, recordPayment: contextRecordPayment, showToast } = useApp();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder || null);
  const [activeSettings, setActiveSettings] = useState<BusinessSettings>(contextSettings);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrder && Boolean(invalidQuery));
  const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);

  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState<boolean>(false);
  const [selectedPayMode, setSelectedPayMode] = useState<PaymentTransaction['paymentMethod']>('UPI');
  const [upiVpa, setUpiVpa] = useState<string>('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');

  // Dynamically generate standards-compliant UPI QR for the current order
  useEffect(() => {
    if (currentOrder) {
      generateOrderUpiQr(currentOrder, activeSettings).then(res => {
        setDynamicQrUrl(res.qrDataUrl);
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

  const handleProcessOnlinePayment = async () => {
    if (!currentOrder) return;
    setIsProcessing(true);

    try {
      // 1. Post payment to backend server database
      const payAmt = currentOrder.balanceDue;
      await fetch(`/api/orders/${encodeURIComponent(currentOrder.id)}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payAmt,
          paymentMethod: selectedPayMode
        })
      });
    } catch (err) {
      console.warn('Server payment sync note:', err);
    }

    // 2. Update local state
    const newAdvance = (currentOrder.advancePaid || 0) + currentOrder.balanceDue;
    setCurrentOrder(prev => prev ? ({
      ...prev,
      advancePaid: newAdvance,
      balanceDue: 0,
      paymentStatus: 'PAID'
    }) : null);

    // 3. Update context state
    contextRecordPayment(currentOrder.id, currentOrder.balanceDue, selectedPayMode, 'ONLINE_PORTAL');

    setIsProcessing(false);
    setIsPayNowModalOpen(false);
    showToast('Payment successful! Balance cleared and invoice marked as paid.', 'success');
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

  // 3. Render Verified Public Invoice
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Brand Banner */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs font-black text-sm">
            C
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{activeSettings.businessName}</span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Customer Bill & Online Payment Gateway</p>
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
              title="Switch to Cleanera POS Terminal"
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
            <span className="font-mono text-xl sm:text-2xl font-black">₹{currentOrder.balanceDue.toFixed(2)}</span>
          </div>

          {currentOrder.balanceDue > 0 ? (
            <button
              id="public-portal-pay-now-btn"
              onClick={() => setIsPayNowModalOpen(true)}
              className="bg-[#78b300] hover:bg-[#86c400] active:scale-98 text-white font-black text-xs sm:text-sm px-5 py-2 rounded-lg shadow-sm border border-white/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Pay Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border border-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Paid in Full</span>
            </span>
          )}
        </div>

        {/* INVOICE CARD */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Header: Logo, Company info, Order Number & Dates */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                <img
                  src={activeSettings.logoUrl}
                  alt="Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
                  {activeSettings.businessName}
                </h1>
                <p className="text-slate-600 font-semibold text-xs mt-0.5">{activeSettings.branchName}</p>
                <p className="text-slate-500 text-[11px] leading-tight mt-0.5">{activeSettings.address}</p>
                <p className="text-slate-700 font-semibold text-[11px] mt-0.5">Ph: {activeSettings.phone}</p>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1 sm:border-l sm:border-slate-200 sm:pl-6 shrink-0">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Invoice / Receipt</div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">#{currentOrder.orderNumber}</div>
              <div className="text-[11px] text-slate-500 font-medium">Booked: {currentOrder.orderDate}</div>
              <div className="text-[12px] font-extrabold text-slate-800 bg-sky-50 text-sky-900 px-2.5 py-1 rounded-md inline-block border border-sky-200">
                Due: {currentOrder.dueDate}
              </div>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Billed To</div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base capitalize">{currentOrder.customerName}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentOrder.customerAddress || 'Address on file'}</span>
              </div>
              <div className="text-slate-700 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile: {currentOrder.customerMobile}</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <div>Place of Supply: <strong className="text-slate-800">{currentOrder.customerPlaceOfSupply || 'Uttar Pradesh'}</strong></div>
              <div>Branch Series: <strong className="font-mono text-slate-800">{currentOrder.orderSeries}</strong></div>
              <div>Order Type: <strong className="text-slate-800 font-bold">{currentOrder.orderType === 'PER_WEIGHT' ? 'Weight Laundry' : 'Per Piece Processing'}</strong></div>
              {currentOrder.workshopNotes && (
                <div className="text-indigo-700 font-medium italic max-w-xs">Note: {currentOrder.workshopNotes}</div>
              )}
            </div>
          </div>

          {/* Garments Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Garment & Service Details</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {currentOrder.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-center font-mono text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="p-3 space-y-1">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.garmentName}</div>
                      <div className="text-slate-600 text-xs flex items-center gap-2">
                        <span className="font-medium text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 text-[11px]">
                          {item.serviceName}
                        </span>
                        {item.pressingMethod && (
                          <span className="text-[11px] text-slate-500">[{item.pressingMethod}]</span>
                        )}
                      </div>

                      {/* Remarks / Defect notes */}
                      {item.remarks && item.remarks.length > 0 && (
                        <div className="text-slate-500 italic text-[11px] flex flex-wrap gap-1">
                          {item.remarks.map((r, i) => (
                            <span key={i} className="text-slate-600">• {r}</span>
                          ))}
                        </div>
                      )}

                      {item.brand && (
                        <div className="text-indigo-600 text-[11px] font-semibold">
                          Brand: {item.brand}
                        </div>
                      )}

                      {/* Add-on Sub Services */}
                      {item.subServices && item.subServices.length > 0 && (
                        <div className="text-[11px] text-purple-700 flex flex-wrap items-center gap-1.5 pt-0.5">
                          {item.subServices.map(s => (
                            <span key={s.code} className="bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-medium">
                              {s.name} (+₹{s.price})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700">{item.quantity || 1}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {item.totalItemPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Terms */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-6">
            {/* Terms and Disclaimer Box */}
            <div className="text-xs text-slate-600 max-w-sm space-y-2.5">
              <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                Terms & Garment Inspection Notice
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {activeSettings.receiptFooterMessage}
              </p>
              <div className="text-slate-700 font-medium text-xs">
                Total Garments: <strong className="text-slate-900 font-bold">{currentOrder.totalPieces} Pieces</strong>
              </div>
              {currentOrder.netAmount > 0 && (
                <div className="text-[11px] text-slate-500">
                  Amount in words: <span className="font-semibold text-slate-700 capitalize">{numberToIndianWords(currentOrder.netAmount)}</span>
                </div>
              )}
            </div>

            {/* Price Calculations Box */}
            <div className="w-full sm:w-72 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Total:</span>
                <span className="font-mono font-bold text-slate-800">₹{currentOrder.grossAmount.toFixed(2)}</span>
              </div>

              {currentOrder.deliveryCharge && currentOrder.deliveryCharge > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-bold">+₹{currentOrder.deliveryCharge.toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.surchargeAmount && currentOrder.surchargeAmount > 0 ? (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Surcharge ({currentOrder.surchargeType?.replace(/_/g, ' ')}):</span>
                  <span className="font-mono font-bold">+₹{currentOrder.surchargeAmount.toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.discountAmount && currentOrder.discountAmount > 0 ? (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount ({currentOrder.discountPercent}%):</span>
                  <span className="font-mono font-bold">-₹{currentOrder.discountAmount.toFixed(2)}</span>
                </div>
              ) : null}

              {currentOrder.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">₹{currentOrder.roundOff.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-300 pt-2">
                <span>Net Total:</span>
                <span className="font-mono text-base text-slate-900 font-black">₹{currentOrder.netAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span className="font-mono font-bold text-emerald-700">₹{currentOrder.advancePaid.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-rose-700 font-black text-sm sm:text-base border-t-2 border-slate-300 pt-2">
                <span>Balance Due:</span>
                <span className="font-mono text-lg font-black text-rose-600">₹{currentOrder.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

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
                onClick={() => setIsPayNowModalOpen(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Balance (₹{currentOrder.balanceDue.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Online Payment Modal */}
      {isPayNowModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Secure Payment Gateway</h3>
              </div>
              <button onClick={() => setIsPayNowModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Order #{currentOrder.orderNumber} Payable:</span>
              <span className="font-mono text-xl font-black text-emerald-700">₹{currentOrder.balanceDue.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Payment Method:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['UPI', 'CARD', 'NET_BANKING'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedPayMode(mode)}
                    className={`p-2.5 rounded-lg font-bold border transition cursor-pointer text-center ${
                      selectedPayMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Details */}
            {selectedPayMode === 'UPI' && (
              <div className="space-y-3 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                    <img
                      src={dynamicQrUrl || activeSettings.paymentQrUrl || '/payment-qr.jpg'}
                      alt="UPI Payment QR Scanner"
                      className="w-28 h-36 object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="font-bold text-slate-900 text-sm">Scan UPI QR to Pay</div>
                    <div className="text-[11px] font-semibold text-emerald-800">
                      {activeSettings.upiPayeeName || 'PRITPAL SINGH'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200 inline-block">
                      UPI ID: {activeSettings.upiId || '9041590866@hdfc'}
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Works with Google Pay, PhonePe, Paytm, BHIM & all UPI apps
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Or Pay via your UPI ID (VPA):</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Card Details */}
            {selectedPayMode === 'CARD' && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Card Number:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Expiry:</label>
                    <input type="text" defaultValue="12/28" className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">CVV:</label>
                    <input type="password" defaultValue="•••" className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPayNowModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-gateway-pay"
                type="button"
                disabled={isProcessing}
                onClick={handleProcessOnlinePayment}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Pay ₹{currentOrder.balanceDue.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
