import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  Home, 
  Edit3, 
  PlusCircle, 
  History, 
  Share2, 
  FolderOpen, 
  X, 
  Lock, 
  QrCode,
  Sparkles,
  ShieldAlert,
  Wifi,
  WifiOff,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { printThermalBookingReceipt } from '../../utils/printUtils';
import { printBridgeService, BridgeStatus } from '../../services/printBridgeService';
import { buildOrderWhatsAppMessage } from '../../services/notificationService';
import { normalizeIndianPhoneNumber } from '../../utils/phoneUtils';

export const ThermalReceiptModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    selectedOrder, 
    orders, 
    customers,
    businessSettings, 
    currentRole, 
    setWhatsAppModalOpen, 
    showToast 
  } = useApp();

  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>(printBridgeService.getStatus());

  useEffect(() => {
    const unsubscribe = printBridgeService.subscribe((status) => {
      setBridgeStatus(status);
    });
    printBridgeService.connect().catch(() => {});
    return unsubscribe;
  }, []);

  const order = selectedOrder || orders[0];

  if (!isOpen || !order) return null;

  const isManager = currentRole === 'MANAGER';
  const customer = customers.find(c => c.id === order.customerId) || {
    id: order.customerId || 'cust-1',
    name: order.customerName,
    mobile: order.customerMobile || '',
    email: '',
    custCode: '',
    address: order.customerAddress || '',
    placeOfSupply: order.customerPlaceOfSupply || ''
  };

  const handlePrint = async () => {
    // 1. Direct hardware print attempt via QZ Tray print daemon (Port 8182)
    if (printBridgeService.isConnected()) {
      const result = await printBridgeService.printThermalReceipt(order, businessSettings);
      if (result.success) {
        showToast(`Sent 80mm booking receipt for Order #${order.orderNumber} directly to thermal printer [${result.printerName}].`, 'success');
        return;
      }
    }

    // 2. High-precision system/browser print fallback
    const success = printThermalBookingReceipt(order, businessSettings);
    if (success) {
      if (!printBridgeService.isConnected()) {
        showToast(`Print Bridge daemon offline (ws://localhost:8182). Opened 80mm thermal system print dialog for Order #${order.orderNumber}.`, 'info');
      } else {
        showToast(`Sent 80mm thermal booking receipt for Order #${order.orderNumber} (${order.customerName}) to printer dialog.`, 'success');
      }
    }
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = (order.customerMobile || customer.mobile || '').trim();
    const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);
    const cleanDigits = normalizedPhone.replace(/\D/g, '');

    if (!cleanDigits || cleanDigits.length < 10) {
      showToast(`Invalid or missing customer mobile number (${rawPhone || 'Not set'}) to open WhatsApp.`, 'error');
      setWhatsAppModalOpen(true);
      return;
    }

    // Generate formatted complete bill message with order details & prices
    const billMessage = buildOrderWhatsAppMessage(order, customer, businessSettings);
    
    // WhatsApp direct click-to-chat URL with phone number and pre-filled invoice message
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(billMessage)}`;

    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      window.location.href = waUrl;
    }

    showToast(`Opening WhatsApp for Order #${order.orderNumber} with recipient +${cleanDigits}...`, 'success');
  };

  const handleEditBooking = () => {
    if (isManager) {
      showToast('ANTI-FRAUD PROTECTION: Manager is strictly forbidden from editing orders or changing financial details.', 'error');
      return;
    }
    showToast('Navigating to Order Editor (Admin Authorized).', 'info');
    onClose();
  };

  const maskPhone = (phone: string) => {
    if (!businessSettings.maskPhoneOnThermalReceipt) return phone;
    if (phone.length <= 4) return phone;
    return '••••••' + phone.slice(-4);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Bar matching Screenshot */}
        <div className="bg-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Print Button */}
            <button
              id="btn-thermal-print"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print (Ctrl+P)</span>
            </button>

            {/* Print Bridge Status Tag */}
            <span className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${
              bridgeStatus === 'CONNECTED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {bridgeStatus === 'CONNECTED' ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>80mm POS: Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Spooler Mode</span>
                </>
              )}
            </span>

            {/* Home Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded flex items-center gap-1.5 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home (Ctrl+H)</span>
            </button>

            {/* Edit Booking Button */}
            {!isManager ? (
              <button
                onClick={handleEditBooking}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Booking</span>
              </button>
            ) : (
              <button
                onClick={handleEditBooking}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 font-semibold rounded flex items-center gap-1.5 cursor-not-allowed border border-slate-700"
                title="Manager cannot edit orders"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Edit (Admin Only)</span>
              </button>
            )}

            {/* Direct WhatsApp Share Button */}
            <button
              id="btn-thermal-whatsapp"
              onClick={handleOpenWhatsApp}
              title={`Open WhatsApp chat with ${order.customerName} (${order.customerMobile})`}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-slate-950 font-bold rounded flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Canvas - items-start & min-h-fit prevents white background clipping */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/70 flex justify-center items-start min-h-0">
          <div className="w-[360px] bg-white text-slate-900 p-5 rounded-lg shadow-2xl border border-slate-300 font-mono text-[11px] leading-tight space-y-3 shrink-0 my-1 sm:my-2">
            {/* Header: Business & Marketing */}
            <div className="text-center space-y-1 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 mx-auto mb-1">
                <img src={businessSettings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain mx-auto" />
              </div>
              <div className="font-black text-sm uppercase tracking-tight">{businessSettings.businessName}</div>
              <div className="text-[10px] text-slate-700">{businessSettings.branchName}</div>
              <div className="text-[9px] text-slate-600">{businessSettings.address}</div>
              <div className="text-[9.5px] text-slate-700 font-semibold">Ph: {businessSettings.phone}</div>
              <div className="text-[9px] text-slate-500 italic pt-1">{businessSettings.marketingMessage}</div>
            </div>

            {/* Order No & Dates */}
            <div className="flex justify-between border-b border-dashed border-slate-400 pb-2 text-[10px]">
              <div>
                <div>Order: <strong className="text-xs font-black">#{order.orderNumber}</strong></div>
                <div>Date: {order.orderDate}</div>
              </div>
              <div className="text-right">
                <div>Due: <strong className="font-bold text-slate-900">{order.dueDate}</strong></div>
                <div>Series: {order.orderSeries}</div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b border-dashed border-slate-400 pb-2 text-[10px] space-y-0.5">
              <div className="font-bold capitalize text-slate-950">Cust: {order.customerName}</div>
              <div>Address: {order.customerAddress}</div>
              <div>Mobile: {maskPhone(order.customerMobile)}</div>
              <div>POS: {order.customerPlaceOfSupply}</div>
            </div>

            {/* Garments Table */}
            <div className="space-y-1.5 border-b border-slate-800 pb-2 text-[10.5px]">
              <div className="flex justify-between font-bold border-b border-slate-300 pb-0.5 text-[9px] uppercase">
                <span>Garment & Service</span>
                <span>Amount</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{idx + 1}. {item.garmentName}</span>
                    <span>{item.totalItemPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-700 pl-3 font-semibold">
                    {item.serviceName} • <span className="text-indigo-900 font-extrabold">{item.pressingMethod || 'Iron Press'}</span>
                  </div>
                  {item.remarks && item.remarks.length > 0 && (
                    <div className="text-[9px] text-slate-500 italic pl-3">
                      Remarks: {item.remarks.map(r => `- ${r}`).join(' ')}
                    </div>
                  )}
                  {item.brand && (
                    <div className="text-[9px] text-indigo-700 pl-3">
                      Brand: {item.brand}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1 text-[10px] border-b border-slate-800 pb-2">
              <div className="flex justify-between text-slate-600">
                <span>Total Pieces / Weight:</span>
                <span className="font-bold">{order.totalPieces} Pcs {order.totalWeightKg ? `(${order.totalWeightKg} kg)` : ''}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span>{order.grossAmount.toFixed(2)}</span>
              </div>
              {order.deliveryCharge && order.deliveryCharge > 0 ? (
                <div className="flex justify-between text-indigo-700 font-semibold">
                  <span>Delivery / Pick&Drop Charge:</span>
                  <span>+{order.deliveryCharge.toFixed(2)}</span>
                </div>
              ) : null}
              {order.surchargeAmount && order.surchargeAmount > 0 ? (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Surcharge ({order.surchargeType}):</span>
                  <span>+{order.surchargeAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount ({order.discountPercent}%):</span>
                  <span>-{order.discountAmount.toFixed(2)}</span>
                </div>
              ) : null}
              {order.roundOff !== 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Round Off:</span>
                  <span>{order.roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-0.5">
                <span>Net Amount:</span>
                <span>Rs. {order.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span>{order.advancePaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-xs text-slate-950 border-t border-slate-800 pt-1">
                <span>Balance Due:</span>
                <span>Rs. {order.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Scannable Barcode & QR footer */}
            <div className="text-center pt-2 space-y-1">
              <div className="flex justify-center">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="text-[9px] font-bold tracking-widest">{order.barcode}</div>
              <div className="text-[8px] text-slate-600 leading-snug pt-1 border-t border-slate-200 mt-1 font-sans">
                {businessSettings.receiptFooterMessage || 'Thank You for choosing Cleanera Dry Cleaning CRM. All garments are carefully inspected before processing. We are not responsible for any article left uncollected after 15 days from the due date. We are not responsible for any damage that may occur during the cleaning process.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

