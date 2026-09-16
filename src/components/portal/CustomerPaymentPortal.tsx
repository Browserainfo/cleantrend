import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { PaymentTransaction } from '../../types';
import { printThermalBookingReceipt } from '../../utils/printUtils';

export const CustomerPaymentPortal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    selectedOrder, 
    orders, 
    businessSettings, 
    recordPayment, 
    setThermalReceiptModalOpen,
    showToast 
  } = useApp();

  const order = selectedOrder || orders[0];

  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState<boolean>(false);
  const [selectedPayMode, setSelectedPayMode] = useState<PaymentTransaction['paymentMethod']>('UPI');
  const [upiVpa, setUpiVpa] = useState<string>('manan@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(order.balanceDue <= 0);

  if (!isOpen) return null;

  const handleProcessOnlinePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      recordPayment(order.id, order.balanceDue, selectedPayMode, 'ONLINE_PORTAL');
      setPaymentSuccess(true);
      setIsPayNowModalOpen(false);
      showToast('Payment successful! Balance due cleared. WhatsApp confirmation dispatched to customer.', 'success');
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Browser Mock URL Bar matching Screenshot 9 */}
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

          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP GREEN NOTIFICATION BAR (Screenshot 9) */}
        <div className="bg-[#5ea500] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
          <div className="font-bold text-sm sm:text-base flex items-center gap-2">
            <span>Current Due Amount :</span>
            <span className="font-mono text-lg font-extrabold">{order.balanceDue.toFixed(0)}</span>
          </div>

          {order.balanceDue > 0 ? (
            <button
              id="portal-pay-now-btn"
              onClick={() => setIsPayNowModalOpen(true)}
              className="bg-[#78b300] hover:bg-[#86c400] text-white font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded shadow-sm border border-white/40 transition flex items-center gap-1.5"
            >
              <span>Pay Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid in Full</span>
            </span>
          )}
        </div>

        {/* INVOICE CARD BODY (Screenshot 9) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-sm space-y-5 text-slate-800 text-xs">
            {/* Header: Business Logo + Business Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b border-slate-200 pb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shadow-2xs overflow-hidden">
                  <img
                    src={businessSettings.logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">{businessSettings.businessName}</h2>
                  <p className="text-slate-600 font-medium">{businessSettings.branchName}</p>
                  <p className="text-slate-500 italic text-[11px] mt-0.5">{businessSettings.marketingMessage}</p>
                </div>
              </div>

              <div className="text-right space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="text-2xl font-black text-rose-600">#{order.orderNumber}</div>
                <div className="text-[11px] text-slate-500 font-medium">{order.orderDate}</div>
                <div className="text-[11px] text-slate-700 font-bold">Due: {order.dueDate}</div>
              </div>
            </div>

            {/* Customer Details Block */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-500 font-medium">Customer: </span>
                <strong className="text-slate-900 capitalize text-sm">{order.customerName}</strong>
                <div className="text-slate-600">{order.customerAddress} ({order.customerMobile})</div>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div>Place of Supply: <strong className="text-slate-800">{order.customerPlaceOfSupply}</strong></div>
                <div>Branch Series: <strong className="font-mono text-slate-800">{order.orderSeries}</strong></div>
              </div>
            </div>

            {/* Garments Table matching Screenshot 9 */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5">Garment & Service Details</th>
                    <th className="p-2.5 text-right">Price (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{item.garmentName}</div>
                        <div className="text-slate-600 text-[11px]">{item.serviceName}</div>
                        
                        {/* Care remark like "- On Hanger" */}
                        {item.remarks && item.remarks.length > 0 && (
                          <div className="text-slate-500 italic text-[10px]">
                            {item.remarks.map(r => `- ${r}`).join(' ')}
                          </div>
                        )}
                        {item.brand && (
                          <div className="text-indigo-600 text-[10px] font-medium">
                            - {item.brand}
                          </div>
                        )}

                        {/* Stacked sub-services e.g. Starch, Steam press, Alteration */}
                        {item.subServices && item.subServices.length > 0 && (
                          <div className="text-[10px] text-purple-700 flex items-center gap-2 mt-0.5">
                            {item.subServices.map(s => (
                              <span key={s.code} className="bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {s.name} (+Rs. {s.price})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {item.totalItemPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-4">
              <div className="text-[11px] text-slate-500 max-w-sm space-y-1">
                <div className="font-semibold text-slate-700">Terms & Inspection Note:</div>
                <p>{businessSettings.receiptFooterMessage}</p>
                <p>Total Garment Pieces: <strong className="text-slate-800">{order.totalPieces} Pcs</strong></p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Amount:</span>
                  <span className="font-mono font-bold">{order.grossAmount.toFixed(2)}</span>
                </div>
                {order.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Round Off:</span>
                    <span className="font-mono">{order.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1">
                  <span>Net Amount:</span>
                  <span className="font-mono text-sm">{order.netAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Advance Paid:</span>
                  <span className="font-mono">{order.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-extrabold text-sm border-t border-slate-300 pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono text-base">{order.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-200 px-6 py-3 border-t border-slate-300 flex items-center justify-between">
          <button
            onClick={() => {
              printThermalBookingReceipt(order, businessSettings);
              showToast(`Sent thermal receipt for Order #${order.orderNumber} to printer dialog.`, 'success');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Thermal Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
          >
            Close Portal
          </button>
        </div>
      </div>

      {/* ONLINE PAYMENT MODAL */}
      {isPayNowModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Secure Payment Gateway</h3>
              </div>
              <button onClick={() => setIsPayNowModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-medium text-slate-600">Order #{order.orderNumber} Payable:</span>
              <span className="font-mono text-lg font-bold text-emerald-700">Rs. {order.balanceDue.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select Payment Method:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['UPI', 'CARD', 'NET_BANKING'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedPayMode(mode)}
                    className={`p-2 rounded font-bold border transition ${
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
              <div className="space-y-3 p-3 bg-emerald-50/60 rounded border border-emerald-200 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Scan UPI QR or enter VPA</div>
                    <div className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">UPI ID (VPA):</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Card Details */}
            {selectedPayMode === 'CARD' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Card Number:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-0.5">Expiry:</label>
                    <input type="text" defaultValue="12/28" className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-0.5">CVV:</label>
                    <input type="password" defaultValue="•••" className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPayNowModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-gateway-pay"
                type="button"
                disabled={isProcessing}
                onClick={handleProcessOnlinePayment}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing ? (
                  <span>Processing Gateway...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Pay Rs. {order.balanceDue.toFixed(2)}</span>
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
