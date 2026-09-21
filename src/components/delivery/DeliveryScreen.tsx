import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scan, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Send, 
  FileText, 
  Mail, 
  MessageSquare, 
  Info, 
  Save, 
  Printer, 
  User, 
  Undo2, 
  AlertTriangle,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle,
  ExternalLink,
  PhoneCall,
  Edit2,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { OrderGarmentItem, PaymentTransaction } from '../../types';

export const DeliveryScreen: React.FC = () => {
  const { 
    selectedOrder, 
    orders, 
    setActiveOrderId,
    completeDelivery, 
    recordGarmentReturn, 
    resendPaymentLink,
    sendManualSMS,
    sendManualEmail,
    setThermalReceiptModalOpen,
    setQRTagPreviewModalOpen,
    setSignatureModalOpen,
    setCustomerPortalOpen,
    openQRPickupModal,
    currentRole,
    currentUser,
    businessSettings,
    showToast
  } = useApp();

  const order = selectedOrder || orders[0];

  // Selected garments for delivery (default to all items selected as shown in Screenshot 14)
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>(() => {
    return order.items.map(i => i.barcode);
  });

  // Keep selected barcodes in sync when active order changes
  React.useEffect(() => {
    setSelectedBarcodes(order.items.map(i => i.barcode));
    setDeliveryNotes(order.deliveryNotes || '');
  }, [order.id]);

  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>(order.deliveryNotes || '');
  const [showBanner, setShowBanner] = useState<boolean>(true);
  
  // Modals for delivery screen
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [returnGarmentBarcode, setReturnGarmentBarcode] = useState<string>('');
  const [returnReason, setReturnReason] = useState<string>('Stain still visible after wash');

  const [isPaymentDeliverModalOpen, setIsPaymentDeliverModalOpen] = useState<boolean>(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('CASH');
  const [differenceOption, setDifferenceOption] = useState<'WAIVE' | 'CARRY_FORWARD' | null>(null);

  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState<boolean>(false);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState<boolean>(false);

  // Counters
  const totalCount = order.items.length;
  const deliveredCount = order.items.filter(i => i.status === 'DELIVERED').length;
  const selectedCount = selectedBarcodes.length;

  // Toggle single garment selection
  const toggleGarment = (barcode: string) => {
    if (selectedBarcodes.includes(barcode)) {
      setSelectedBarcodes(selectedBarcodes.filter(b => b !== barcode));
    } else {
      setSelectedBarcodes([...selectedBarcodes, barcode]);
    }
  };

  // Toggle master select all
  const toggleSelectAll = () => {
    if (selectedBarcodes.length === order.items.length) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(order.items.map(i => i.barcode));
    }
  };

  // Handle scanning barcode
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim();
    // Match against items
    const matched = order.items.find(i => 
      i.barcode.toLowerCase() === query.toLowerCase() || 
      i.barcode.replace(/-/g, '') === query.replace(/-/g, '')
    );

    if (matched) {
      if (!selectedBarcodes.includes(matched.barcode)) {
        setSelectedBarcodes(prev => [...prev, matched.barcode]);
        showToast(`Scanned and selected garment: ${matched.garmentName} (${matched.barcode})`, 'success');
      } else {
        showToast(`Garment ${matched.barcode} already in delivery selection.`, 'info');
      }
    } else {
      showToast(`No garment found in order #${order.orderNumber} matching barcode "${query}".`, 'warning');
    }
    setBarcodeInput('');
  };

  // Compute amount due for selected garments
  const selectedItems = order.items.filter(i => selectedBarcodes.includes(i.barcode));
  const totalItemPieces = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) || totalCount || 1;
  const selectedItemPieces = selectedItems.reduce((acc, item) => acc + (item.quantity || 1), 0) || selectedCount;

  // When order is fully paid, collection amount is 0.00
  // When all items are selected for delivery, collection amount is order.balanceDue
  // When partially selected, amount is proportional share of the unpaid balanceDue (capped at balanceDue)
  const calculatedCollectionAmount = order.balanceDue <= 0
    ? 0
    : (selectedCount === totalCount || selectedItemPieces >= totalItemPieces)
    ? Number(order.balanceDue.toFixed(2))
    : Number(Math.min(order.balanceDue, (selectedItemPieces / totalItemPieces) * order.balanceDue).toFixed(2));

  // Handle Accept Payment and Deliver
  const handleOpenPaymentAndDeliver = () => {
    if (selectedBarcodes.length === 0) {
      showToast('Please select at least one garment for delivery.', 'warning');
      return;
    }
    setPaymentAmountInput(calculatedCollectionAmount.toFixed(2));
    setDifferenceOption(null);
    setIsPaymentDeliverModalOpen(true);
  };

  const handleConfirmPaymentAndDeliver = () => {
    const amt = parseFloat(paymentAmountInput) || 0;
    const diff = Number((order.balanceDue - amt).toFixed(2));
    const effectiveAction = (amt > 0 && diff > 0) ? (differenceOption || undefined) : undefined;
    const effectiveAmount = effectiveAction ? diff : undefined;

    completeDelivery(
      order.id, 
      selectedBarcodes, 
      order.customerSignature, 
      amt, 
      paymentMethod,
      effectiveAction,
      effectiveAmount
    );
    setIsPaymentDeliverModalOpen(false);
    setDifferenceOption(null);
  };

  const handleOpenReturnModal = () => {
    if (order.items.length > 0) {
      setReturnGarmentBarcode(order.items[0].barcode);
      setIsReturnModalOpen(true);
    }
  };

  const handleConfirmReturn = () => {
    if (!returnGarmentBarcode) return;
    recordGarmentReturn(order.id, returnGarmentBarcode, returnReason);
    setIsReturnModalOpen(false);
  };

  // Garment visual icons helper
  const getGarmentIconColor = (category: string, name: string) => {
    if (name.includes('T SHIRT') || name.includes('Shirt')) return 'text-cyan-500 bg-cyan-100 border-cyan-300';
    if (name.includes('JEANS') || name.includes('Pants')) return 'text-blue-600 bg-blue-100 border-blue-300';
    if (name.includes('JACKET')) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (name.includes('SAREE') || name.includes('Dress')) return 'text-rose-600 bg-rose-100 border-rose-300';
    return 'text-slate-600 bg-slate-100 border-slate-300';
  };

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-h-screen text-slate-800">
      {/* Top Notification Banner matching Screenshot 14 */}
      {showBanner && (
        <div className="bg-sky-100 border-b border-sky-200 px-4 py-2 text-sky-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div 
            onClick={() => {
              // Navigate to pending pickup order and open customer details
              const pendingOrder = orders.find(o => o.status !== 'DELIVERED') || order;
              setActiveOrderId(pendingOrder.id);
              setIsCustomerDetailsModalOpen(true);
              showToast(`Loaded pending pick up request for ${pendingOrder.customerName} (Order #${pendingOrder.orderNumber}). Pickup Date: ${pendingOrder.pickupDate || 'Today'}.`, 'info');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping"></span>
            <span>
              You have{' '}
              <strong className="text-sky-950 underline group-hover:text-sky-700 transition">
                {orders.filter(o => o.status !== 'DELIVERED').length} pending pick up requests.
              </strong>
              <span className="ml-2 text-[11px] text-sky-700 font-normal bg-sky-200/60 px-1.5 py-0.5 rounded">
                Click to view customer & order details
              </span>
            </span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-sky-600 hover:text-sky-900 font-bold text-sm px-1.5"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Delivery Layout: Left Garment Table & Controls (70%) + Right Payment & Summary Panel (30%) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL - GARMENT TABLE & BARCODE CONTROLS */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-300">
          {/* Top Barcode Scan & Counters Bar (Screenshot 14 A) */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
            {/* Barcode / QR Scan Field */}
            <form onSubmit={handleBarcodeScan} className="flex-1 min-w-[260px] flex items-center">
              <div className="relative w-full flex items-center">
                <div className="absolute left-2.5 text-slate-400">
                  <Scan className="w-4 h-4" />
                </div>
                <input
                  id="barcode-scan-input"
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Select cloth by barcode (e.g. 4-1-2)"
                  className="w-full pl-9 pr-20 py-1.5 text-xs bg-white border border-slate-300 rounded shadow-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-mono font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold rounded"
                >
                  Scan
                </button>
              </div>
            </form>

            {/* Total Counter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded border border-slate-300">
              <span className="text-xs text-slate-500 font-medium">Total</span>
              <span className="text-xs font-bold text-slate-800 px-1.5 py-0.5 bg-white rounded shadow-xs font-mono">{totalCount}</span>
            </div>

            {/* Dedicated QR Scan Pickup Workflow Trigger */}
            <button
              type="button"
              id="btn-open-dedicated-qr-pickup"
              onClick={() => openQRPickupModal(barcodeInput || '4-1-2')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1.5 transition"
              title="Open dedicated full-screen QR scan handover & pickup counter screen"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Dedicated QR Pickup Counter</span>
            </button>

            {/* Delivered Counter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded border border-slate-300">
              <span className="text-xs text-slate-500 font-medium">Delivered</span>
              <span className="text-xs font-bold text-emerald-700 px-1.5 py-0.5 bg-white rounded shadow-xs font-mono">{deliveredCount}</span>
            </div>

            {/* Selected Counter (Dynamic: 4 in SC14, 2 in SC15) */}
            <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded border border-sky-300">
              <span className="text-xs text-sky-700 font-semibold">Selected</span>
              <span className="text-xs font-bold text-sky-700 px-1.5 py-0.5 bg-white rounded shadow-xs font-mono">{selectedCount}</span>
            </div>
          </div>

          {/* Garment Delivery Table (Screenshot 14 B & C) */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-500 text-white font-semibold uppercase text-[11px] tracking-wider border-b border-slate-400 sticky top-0 z-10">
                  <th className="p-2.5 w-10 text-center">
                    <button 
                      onClick={toggleSelectAll}
                      className="text-white hover:text-sky-200 transition"
                      title="Select / Deselect all garments"
                    >
                      {selectedBarcodes.length === order.items.length ? (
                        <CheckSquare className="w-4 h-4 text-sky-300" />
                      ) : (
                        <Square className="w-4 h-4 opacity-70" />
                      )}
                    </button>
                  </th>
                  <th className="p-2.5">Garment Details</th>
                  <th className="p-2.5 text-center">Barcode</th>
                  <th className="p-2.5">Service</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5">Ready On</th>
                  <th className="p-2.5">Delivered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item) => {
                  const isSelected = selectedBarcodes.includes(item.barcode);
                  const isJacket = item.garmentName.includes('JACKET');
                  const isDelivered = item.status === 'DELIVERED';

                  // Row highlight: Screenshot 14 shows yellow highlight on Men-JACKET row
                  let rowBg = 'bg-white hover:bg-slate-50';
                  if (isJacket) {
                    rowBg = 'bg-amber-50/80 hover:bg-amber-100/80 border-l-4 border-l-amber-400';
                  } else if (isSelected) {
                    rowBg = 'bg-sky-50/40 hover:bg-sky-100/50';
                  }

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${rowBg}`}
                      onClick={() => toggleGarment(item.barcode)}
                    >
                      {/* Checkbox */}
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => toggleGarment(item.barcode)}
                          className="text-slate-600 hover:text-sky-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Garment Details: Icon + Name + Care Remarks */}
                      <td className="p-2.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {/* Garment Image / Icon */}
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs border shadow-2xs ${getGarmentIconColor(item.category, item.garmentName)}`}>
                            {item.garmentName.includes('T SHIRT') && '👕'}
                            {item.garmentName.includes('JEANS') && '👖'}
                            {item.garmentName.includes('JACKET') && '🧥'}
                            {item.garmentName.includes('SAREE') && '🥻'}
                            {!['T SHIRT', 'JEANS', 'JACKET', 'SAREE'].some(k => item.garmentName.includes(k)) && '👔'}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-800 text-xs">
                              {item.garmentName}
                            </div>
                            
                            {/* In-line Care Remark e.g. "On Hanger" or Brand "Bernshaw" */}
                            {item.remarks && item.remarks.length > 0 && (
                              <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                                <span>{item.remarks.join(', ')}</span>
                              </div>
                            )}
                            {item.brand && (
                              <div className="text-[10px] text-indigo-600 font-medium">
                                Brand: {item.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Barcode (e.g. 4-1-2) */}
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {item.barcode}
                        </span>
                      </td>

                      {/* Service (Dry Cleaning, Starch, Steam Press, Alteration) */}
                      <td className="p-2.5 text-slate-700 text-xs font-medium">
                        <div className="leading-snug font-semibold">
                          {item.serviceName}
                        </div>
                        {item.pressingMethod && (
                          <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            item.pressingMethod === 'Steam Press'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : item.pressingMethod === 'Iron Press'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : 'bg-indigo-50 text-indigo-900 border-indigo-300'
                          }`}>
                            {item.pressingMethod}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-2.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          item.status === 'DELIVERED' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.status === 'READY'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : item.status === 'RETURNED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Ready On: Timestamp + Staff Attribution */}
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        <div>{item.readyOn || '27-Nov-25 2:58 PM'}</div>
                        <div className="text-slate-400 text-[10px] font-mono">{item.readyBy || 'manan'}</div>
                      </td>

                      {/* Delivered On */}
                      <td className="p-2.5 text-slate-700 text-[11px] font-medium">
                        {item.deliveredOn ? (
                          <div className="text-emerald-700 font-semibold">
                            <div>{item.deliveredOn}</div>
                            <div className="text-[10px] text-slate-400">{item.deliveredBy || 'manan'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar (Screenshot 14 F) */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Packaging Details */}
              <button
                id="btn-packaging-details"
                onClick={() => setIsPackagingModalOpen(true)}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                Packaging Details
              </button>

              {/* Delivery Without Ticket */}
              <button
                id="btn-deliver-no-ticket"
                onClick={() => {
                  completeDelivery(order.id, selectedBarcodes);
                  showToast('Order delivered digitally without ticket printing.', 'success');
                }}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                Delivery Without Ticket
              </button>

              {/* Notes Input Field with save icon */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-0.5">
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Notes . . ."
                  className="text-xs text-slate-800 placeholder-slate-400 outline-none w-28 sm:w-36 py-0.5"
                />
                <button 
                  onClick={() => showToast('Delivery note saved to order record.', 'success')}
                  className="text-slate-400 hover:text-slate-700" 
                  title="Save delivery notes"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SMS Notify */}
              <button
                id="btn-sms-notify"
                onClick={() => {
                  sendManualSMS(order.customerMobile, `Dear ${order.customerName}, your garments are ready for pickup at ${businessSettings.branchName}.`);
                }}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                SMS Notify
              </button>

              {/* Email Notify */}
              <button
                id="btn-email-notify"
                onClick={() => {
                  sendManualEmail(order.customerMobile + '@mail.com', 'Order Ready & Handover Status', 'All garments inspected.');
                }}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                Email Notify
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Print Current Status */}
              <button
                id="btn-print-status"
                onClick={() => setThermalReceiptModalOpen(true)}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                Print Current Status
              </button>

              {/* Customer Details */}
              <button
                id="btn-customer-details"
                onClick={() => setIsCustomerDetailsModalOpen(true)}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition"
              >
                Customer Details
              </button>

              {/* Return Garment (Pink / Salmon button) */}
              <button
                id="btn-return-garment"
                onClick={handleOpenReturnModal}
                className="px-3 py-1.5 bg-rose-300 hover:bg-rose-400 text-rose-950 text-xs font-bold rounded border border-rose-400 shadow-2xs transition flex items-center gap-1"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Return Garment</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - ORDER SUMMARY & DELIVERY ACTIONS (Screenshots 14 D/E & 15) */}
        <div className="w-full lg:w-80 xl:w-96 bg-slate-600 text-white flex flex-col p-4 shadow-inner">
          {/* Order Quick Selector */}
          <div className="mb-3 pb-2 border-b border-slate-500/50">
            <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">
              Select Active Order ({orders.length} total)
            </label>
            <select
              value={order.id}
              onChange={(e) => setActiveOrderId(e.target.value)}
              className="w-full bg-slate-700 text-white text-xs p-1.5 rounded border border-slate-500 font-semibold outline-none focus:ring-1 focus:ring-sky-400"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.orderNumber} - {o.customerName} ({o.status} • ₹{o.netAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Header: Order Number + Date (Screenshot 14 D) */}
          <div className="flex items-center justify-between border-b border-slate-500/70 pb-3 mb-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-1">
              <span>#</span>
              <span>{order.orderNumber}</span>
            </h1>
            <div className="text-sm font-semibold text-slate-200">
              {order.orderDate.split(' ')[0]} {order.orderDate.split(' ')[1]} {order.orderDate.split(' ')[2]}
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div className="space-y-1 text-xs text-slate-200 pb-3 border-b border-slate-500/60 mb-3">
            <div className="font-bold text-sm text-white capitalize">{order.customerName}</div>
            <div className="text-slate-300">{order.customerAddress}</div>
            <div className="font-mono text-slate-300">{order.customerMobile}</div>
            
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300">Due Date</span>
              <span className="font-bold text-white">{order.dueDate}</span>
            </div>

            {/* Last Visit Pill */}
            <div className="mt-2 text-center">
              <span className="inline-block bg-slate-700/90 text-slate-200 text-[11px] font-medium px-4 py-1 rounded-md shadow-xs border border-slate-500/50">
                Last Visit <strong className="text-white">0 Day ago</strong>
              </span>
            </div>
          </div>

          {/* DYNAMIC FINANCIAL SECTION: Full Summary (SC14) vs Partial Selection (SC15) */}
          {selectedCount === totalCount ? (
            /* Screenshot 14: Full Financial Summary */
            <div className="space-y-2 py-2 text-xs flex-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Gross</span>
                <span className="font-mono font-semibold text-sm text-white">{order.grossAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-200 font-bold border-t border-slate-500/50 pt-1">
                <span>Net</span>
                <span className="font-mono text-base text-white">{order.netAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>- Paid</span>
                <span className="font-mono font-semibold text-sm text-white">
                  {(order.advancePaid + order.payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-white font-extrabold text-sm border-t border-slate-500 pt-1.5">
                <span className="text-slate-100">Balance Due</span>
                <span className="font-mono text-xl text-emerald-300 tracking-tight">
                  {order.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            /* Screenshot 15: Partial Selection Mode */
            <div className="space-y-3 py-2 text-xs flex-1 bg-slate-700/50 p-3 rounded-lg border border-slate-500/60">
              <div className="text-center font-bold text-slate-200 pb-1 border-b border-slate-500/50">
                {order.orderDate || new Date().toLocaleDateString('en-GB')}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center py-1">
                <div className="bg-slate-800/80 p-2 rounded border border-slate-600">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Garment Selected</div>
                  <div className="text-lg font-extrabold text-sky-300 font-mono">{selectedCount}</div>
                </div>
                
                <div className="bg-slate-800/80 p-2 rounded border border-slate-600">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Current Due</div>
                  <div className={`text-lg font-extrabold font-mono ${order.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {order.balanceDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Amount input field */}
              <div className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded border border-slate-600">
                <span className="text-xs font-semibold text-slate-300">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmountInput !== '' ? paymentAmountInput : calculatedCollectionAmount.toFixed(2)}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-24 text-right bg-white text-slate-900 font-mono font-bold text-sm px-2 py-0.5 rounded shadow-inner outline-none"
                />
              </div>

              <div className="text-[10px] text-slate-300 leading-tight">
                {selectedCount === totalCount
                  ? 'All garments selected for handover.'
                  : `Partial delivery calculated for ${selectedCount} of ${totalCount} garments.`}
              </div>
            </div>
          )}

          {/* Action Buttons (Screenshot 14 E & 15) */}
          <div className="space-y-2 pt-3 border-t border-slate-500/70 mt-auto">
            {/* Resend Payment Link Button */}
            <button
              id="btn-resend-payment-link"
              onClick={() => resendPaymentLink(order.id)}
              className="w-full py-2 bg-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Resend Payment Link</span>
            </button>

            {/* Get Signature Button (Blue) */}
            <button
              id="btn-get-signature"
              onClick={() => setSignatureModalOpen(true)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Get Signature</span>
            </button>

            {/* Accept Payment and Deliver Button (Dark/Primary) */}
            <button
              id="btn-accept-payment-deliver"
              onClick={handleOpenPaymentAndDeliver}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-sm font-extrabold rounded shadow-md transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Accept Payment and Deliver</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: RETURN GARMENT MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Return Garment / Defect Workflow</span>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Garment to Return:</label>
                <select
                  value={returnGarmentBarcode}
                  onChange={(e) => setReturnGarmentBarcode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800 bg-slate-50"
                >
                  {order.items.map(i => (
                    <option key={i.barcode} value={i.barcode}>
                      {i.barcode} - {i.garmentName} ({i.serviceName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return Reason / Complaint:</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded text-slate-800"
                  placeholder="Describe reason (e.g. Stain not removed, pressing creased, button repair)..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px]">
                <strong>Audit Record:</strong> This will initiate a workshop re-clean ticket and log the returned garment under customer complaint tracking.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
              >
                Confirm Return & Re-clean
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ACCEPT PAYMENT & DELIVER MODAL */}
      {isPaymentDeliverModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Payment Settlement & Handover</span>
              </div>
              <button onClick={() => setIsPaymentDeliverModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Order #{order.orderNumber} - {order.customerName}</div>
                  <div className="text-slate-500">Delivering {selectedBarcodes.length} of {order.items.length} garments</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Balance Due</div>
                  <div className={`text-lg font-bold font-mono ${order.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    Rs. {order.balanceDue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Collection Amount (Rs.):</label>
                  {order.balanceDue <= 0 ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Paid in Full • No Due
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Remaining Due: Rs. {order.balanceDue.toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmountInput}
                  onChange={(e) => {
                    setPaymentAmountInput(e.target.value);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded font-mono font-bold text-base text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* PAYMENT DIFFERENCE OPTIONS: Adjust/Waive vs Carry Forward */}
              {(() => {
                const currentPaymentAmt = parseFloat(paymentAmountInput) || 0;
                const paymentDifference = Number((order.balanceDue - currentPaymentAmt).toFixed(2));
                if (currentPaymentAmt <= 0 || paymentDifference <= 0) return null;

                return (
                  <div className="p-3 bg-amber-50/90 rounded-lg border border-amber-200 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Payment Difference: ₹{paymentDifference.toFixed(2)}</span>
                      </div>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Bill ₹{order.balanceDue.toFixed(2)} • Paying ₹{currentPaymentAmt.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[11px] text-amber-800">
                      Payment is less than the bill. Choose how to handle the ₹{paymentDifference.toFixed(2)} difference:
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="btn-diff-waive-delivery"
                        onClick={() => setDifferenceOption(differenceOption === 'WAIVE' ? null : 'WAIVE')}
                        className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                          differenceOption === 'WAIVE'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>Adjust/Waive ₹{paymentDifference.toFixed(2)}</span>
                          {differenceOption === 'WAIVE' && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-[10px] mt-1 leading-snug ${differenceOption === 'WAIVE' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Close difference and mark order settled
                        </span>
                      </button>

                      <button
                        type="button"
                        id="btn-diff-carry-forward-delivery"
                        onClick={() => setDifferenceOption(differenceOption === 'CARRY_FORWARD' ? null : 'CARRY_FORWARD')}
                        className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                          differenceOption === 'CARRY_FORWARD'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>Carry Forward ₹{paymentDifference.toFixed(2)}</span>
                          {differenceOption === 'CARRY_FORWARD' && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-[10px] mt-1 leading-snug ${differenceOption === 'CARRY_FORWARD' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Save ₹{paymentDifference.toFixed(2)} against customer as adjustment balance
                        </span>
                      </button>
                    </div>

                    {differenceOption === 'WAIVE' && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-100/70 p-2 rounded border border-emerald-300 font-medium">
                        ✓ ₹{paymentDifference.toFixed(2)} will be adjusted/waived. Order #{order.orderNumber} will be marked fully settled.
                      </div>
                    )}
                    {differenceOption === 'CARRY_FORWARD' && (
                      <div className="text-[11px] text-blue-800 bg-blue-100/70 p-2 rounded border border-blue-300 font-medium">
                        ✓ ₹{paymentDifference.toFixed(2)} will be saved to {order.customerName}'s adjustment balance and can be applied on their next order. Order #{order.orderNumber} will be marked settled.
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'CARD', 'NET_BANKING', 'WALLET'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`p-2 rounded font-semibold text-xs border text-center transition ${
                        paymentMethod === mode 
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                <strong>Automated Triggers:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Dispatches WhatsApp WA-003 (Payment Confirmation) with current balance Rs. 0</li>
                  <li>Dispatches WhatsApp WA-004 (Order Feedback Request)</li>
                  <li>Updates customer last visit timestamp to "0 Day ago"</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsPaymentDeliverModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delivery-final"
                onClick={handleConfirmPaymentAndDeliver}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Payment & Handover</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PACKAGING DETAILS MODAL */}
      {isPackagingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Packaging Details & Garment Preparation</h3>
              <button onClick={() => setIsPackagingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Garments:</span>
                  <span className="font-bold">{order.totalPieces} Pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hanger Garments:</span>
                  <span className="font-bold text-emerald-700">1 (Men Jacket on Hanger)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Folded & Poly Packed:</span>
                  <span className="font-bold text-sky-700">3 (T-Shirt, Jeans, Saree)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Starch Applied:</span>
                  <span className="font-bold text-purple-700">Women Saree (Crisp)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsPackagingModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CUSTOMER DETAILS MODAL */}
      {isCustomerDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border border-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Customer Profile & CRM Stats</h3>
              <button onClick={() => setIsCustomerDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="text-sm font-bold text-slate-900 capitalize">{order.customerName}</div>
                <div className="text-slate-600">Mobile: {order.customerMobile}</div>
                <div className="text-slate-600">Address: {order.customerAddress}</div>
                <div className="text-slate-600">Place of Supply: {order.customerPlaceOfSupply}</div>
                <div className="text-slate-600">Last Visit: 0 Day ago</div>
                <div className="text-slate-600">Lifetime Orders: 4 orders</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsCustomerDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
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
