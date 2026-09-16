import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scan, 
  QrCode, 
  CheckCircle, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  X, 
  Printer, 
  CreditCard, 
  Banknote, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Package, 
  FileText, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  Search,
  AlertCircle,
  BadgeAlert
} from 'lucide-react';
import { Order, OrderGarmentItem, PaymentTransaction } from '../../types';
import { printHandoverDeliverySlip, printThermalBookingReceipt } from '../../utils/printUtils';

export const QRPickupScanModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    orders, 
    completeDelivery, 
    recordPayment,
    currentUser, 
    businessSettings, 
    showToast,
    setThermalReceiptModalOpen,
    qrPickupInitialQuery,
    setQrPickupInitialQuery,
    lookupOrderByQR,
    sendWhatsAppNotification
  } = useApp();

  const [scanInput, setScanInput] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [matchedGarment, setMatchedGarment] = useState<OrderGarmentItem | null>(null);
  const [lookupFeedback, setLookupFeedback] = useState<{ type: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);
  
  // Selected garment barcodes for handover (default to all items)
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  
  // Payment settlement state
  const [collectedAmount, setCollectedAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('UPI');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [differenceOption, setDifferenceOption] = useState<'WAIVE' | 'CARRY_FORWARD' | null>(null);
  
  // Workflow step state: 'SCAN' | 'REVIEW' | 'CONFIRM_DIALOG' | 'SUCCESS'
  const [workflowStep, setWorkflowStep] = useState<'SCAN' | 'REVIEW' | 'CONFIRM_DIALOG' | 'SUCCESS'>('SCAN');
  
  // Success state metadata
  const [completedHandover, setCompletedHandover] = useState<{
    orderNumber: number;
    customerName: string;
    customerMobile: string;
    totalPieces: number;
    collectedAmt: number;
    timestamp: string;
    staffName: string;
    receiptUrl?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or handle pre-filled queries
  useEffect(() => {
    if (isOpen) {
      const initialQuery = qrPickupInitialQuery || '4-1-2'; // Default to Order 4 sample item for immediate testing
      setScanInput(initialQuery);
      handlePerformLookup(initialQuery);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 150);
    } else {
      // Reset state on close
      setScanInput('');
      setActiveOrder(null);
      setMatchedGarment(null);
      setLookupFeedback(null);
      setWorkflowStep('SCAN');
      setCompletedHandover(null);
      setQrPickupInitialQuery('');
    }
  }, [isOpen, qrPickupInitialQuery]);

  if (!isOpen) return null;

  // Handle Lookup & QR Verification
  const handlePerformLookup = (query: string) => {
    if (!query.trim()) {
      setLookupFeedback({ type: 'warning', message: 'Please scan or enter a garment barcode, QR code or Order number.' });
      return;
    }

    const result = lookupOrderByQR(query);

    if (result.found && result.order) {
      const ord = result.order;
      setActiveOrder(ord);
      setMatchedGarment(result.garment || null);
      
      // Auto-select all items of this order for handover
      setSelectedBarcodes(ord.items.map(i => i.barcode));
      
      // Auto-set collection amount to balance due if any
      setCollectedAmount(ord.balanceDue > 0 ? ord.balanceDue.toString() : '0');

      if (ord.status === 'DELIVERED') {
        setLookupFeedback({
          type: 'error',
          message: `ORDER ALREADY PICKED UP: Order #${ord.orderNumber} was picked up on ${ord.pickedUpAt || ord.pickupDate || 'earlier date'} by ${ord.pickedUpBy || ord.createdBy}.`
        });
      } else {
        setLookupFeedback({
          type: 'success',
          message: result.message || `Order #${ord.orderNumber} loaded successfully for customer ${ord.customerName}.`
        });
      }
      setWorkflowStep('REVIEW');
    } else {
      setActiveOrder(null);
      setMatchedGarment(null);
      setLookupFeedback({
        type: 'error',
        message: result.message || `No active dry cleaning order found matching scanned code "${query}".`
      });
      setWorkflowStep('SCAN');
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformLookup(scanInput);
  };

  // Toggle single garment selection
  const toggleGarment = (barcode: string) => {
    if (selectedBarcodes.includes(barcode)) {
      setSelectedBarcodes(selectedBarcodes.filter(b => b !== barcode));
    } else {
      setSelectedBarcodes([...selectedBarcodes, barcode]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (!activeOrder) return;
    if (selectedBarcodes.length === activeOrder.items.length) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(activeOrder.items.map(i => i.barcode));
    }
  };

  // Handle opening the Confirm Dialog (Requirement 8)
  const handleInitiatePickup = () => {
    if (!activeOrder) return;

    if (activeOrder.status === 'DELIVERED') {
      showToast(`Order #${activeOrder.orderNumber} was already picked up. Duplicate pickup is blocked.`, 'error');
      return;
    }

    if (selectedBarcodes.length === 0) {
      showToast('Please select at least one garment for handover.', 'warning');
      return;
    }

    setWorkflowStep('CONFIRM_DIALOG');
  };

  // Handle final confirmed pickup execution (Requirement 9)
  const handleConfirmPickupExecution = () => {
    if (!activeOrder) return;

    const amt = parseFloat(collectedAmount) || 0;
    const diff = Number((activeOrder.balanceDue - amt).toFixed(2));
    const effectiveAction = (amt > 0 && diff > 0) ? (differenceOption || undefined) : undefined;
    const effectiveAmount = effectiveAction ? diff : undefined;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().slice(-2)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const staffName = `${currentUser.name} (${currentUser.role})`;

    // Complete delivery in global app context & state
    const result = completeDelivery(
      activeOrder.id, 
      selectedBarcodes, 
      activeOrder.customerSignature, 
      amt, 
      paymentMethod,
      effectiveAction,
      effectiveAmount
    );

    // Record completed handover metadata for success screen (Requirement 10)
    setCompletedHandover({
      orderNumber: activeOrder.orderNumber,
      customerName: activeOrder.customerName,
      customerMobile: activeOrder.customerMobile,
      totalPieces: selectedBarcodes.length,
      collectedAmt: amt,
      timestamp: formattedDate,
      staffName,
      receiptUrl: activeOrder.receiptUrl
    });

    setWorkflowStep('SUCCESS');
    showToast(`Pickup completed successfully for Order #${activeOrder.orderNumber} (${activeOrder.customerName})!`, 'success');
  };

  // Reset to scan next order
  const handleScanNext = () => {
    setScanInput('');
    setActiveOrder(null);
    setMatchedGarment(null);
    setLookupFeedback(null);
    setWorkflowStep('SCAN');
    setCompletedHandover(null);
    setSelectedBarcodes([]);
    setCollectedAmount('0');
    setDifferenceOption(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Compute payment status tag
  const getPaymentStatusBadge = (order: Order) => {
    if (order.balanceDue <= 0) {
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-full flex items-center gap-1 shadow-2xs">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>PAID</span>
        </span>
      );
    }
    const totalPaid = order.advancePaid + order.payments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid > 0 && order.balanceDue > 0) {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full flex items-center gap-1 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>PARTIALLY PAID</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs rounded-full flex items-center gap-1 shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        <span>PAYMENT DUE</span>
      </span>
    );
  };

  const isAlreadyDelivered = activeOrder?.status === 'DELIVERED';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* TOP COUNTER HEADER */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  QR Scan Pickup & Customer Delivery Counter
                </h2>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-500/30">
                  Live Scanner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scan garment QR / receipt barcode to verify order status, settle balance, and confirm physical handover.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SCAN / SEARCH INPUT BAR (Always visible at top of modal) */}
        <div className="p-3.5 bg-slate-100 border-b border-slate-200">
          <form onSubmit={handleScanSubmit} className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[280px]">
              <Scan className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                ref={inputRef}
                id="qr-scan-modal-input"
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan garment QR code, type barcode (e.g. 4-1-2) or Order # (e.g. 4)..."
                className="w-full pl-9 pr-24 py-2 text-xs bg-white border-2 border-sky-500/70 rounded-lg shadow-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-600 outline-none font-mono font-bold text-slate-900"
              />
              <button
                type="submit"
                id="btn-scan-lookup-execute"
                className="absolute right-1.5 top-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-md shadow-xs transition"
              >
                Scan / Find
              </button>
            </div>

            {/* Quick Demo Scan Chips for instant testing */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="text-slate-500 font-semibold">Test Scan:</span>
              <button
                type="button"
                onClick={() => {
                  setScanInput('4-1-2');
                  handlePerformLookup('4-1-2');
                }}
                className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 rounded font-mono font-semibold shadow-2xs"
                title="Scan Order 4 Garment (Ready with Balance Due)"
              >
                QR: 4-1-2 (T-Shirt)
              </button>

              <button
                type="button"
                onClick={() => {
                  setScanInput('4-3-2');
                  handlePerformLookup('4-3-2');
                }}
                className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 rounded font-mono font-semibold shadow-2xs"
                title="Scan Order 4 Jacket on Hanger"
              >
                QR: 4-3-2 (Jacket)
              </button>

              <button
                type="button"
                onClick={() => {
                  setScanInput('2-1-2');
                  handlePerformLookup('2-1-2');
                }}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-mono font-semibold shadow-2xs"
                title="Scan Order 2 Garment (Already Picked Up Test)"
              >
                QR: 2-1-2 (Delivered Order)
              </button>

              <button
                type="button"
                onClick={() => {
                  setScanInput('4');
                  handlePerformLookup('4');
                }}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold shadow-2xs"
              >
                Order #4
              </button>
            </div>
          </form>

          {/* Feedback banner */}
          {lookupFeedback && (
            <div className={`mt-2 p-2 rounded text-xs font-medium flex items-center justify-between border ${
              lookupFeedback.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              lookupFeedback.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              lookupFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              'bg-sky-50 border-sky-200 text-sky-800'
            }`}>
              <div className="flex items-center gap-2">
                {lookupFeedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                {lookupFeedback.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                {lookupFeedback.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                <span>{lookupFeedback.message}</span>
              </div>

              {matchedGarment && (
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-[11px]">
                  Scanned: {matchedGarment.barcode} ({matchedGarment.garmentName})
                </span>
              )}
            </div>
          )}
        </div>

        {/* BODY CONTENT BASED ON WORKFLOW STEP */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* VIEW: SUCCESS SCREEN (Requirement 10) */}
          {workflowStep === 'SUCCESS' && completedHandover && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 animate-bounce">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Pickup Completed Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Garments have been officially handed over to customer and inventory updated.
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Order / Receipt Number:</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    #{completedHandover.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900 capitalize text-sm">
                    {completedHandover.customerName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Customer Mobile:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {completedHandover.customerMobile}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Delivered Garments:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {completedHandover.totalPieces} Pieces
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Settled:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {completedHandover.collectedAmt.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Handed Over At:</span>
                  <span className="font-semibold text-slate-700">{completedHandover.timestamp}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Counter Operator:</span>
                  <span className="font-semibold text-sky-800">{completedHandover.staffName}</span>
                </div>
              </div>

              {/* Next Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3 w-full">
                <button
                  id="btn-print-handover-slip"
                  onClick={() => {
                    if (completedHandover) {
                      printHandoverDeliverySlip(completedHandover, businessSettings);
                      showToast(`Sent Customer Pickup Handover Slip for Order #${completedHandover.orderNumber} to printer dialog.`, 'success');
                    } else if (activeOrder) {
                      printThermalBookingReceipt(activeOrder, businessSettings);
                      showToast(`Sent Handover Receipt for Order #${activeOrder.orderNumber} to printer dialog.`, 'success');
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>Print Handover Receipt</span>
                </button>

                <button
                  id="btn-scan-next-order"
                  onClick={handleScanNext}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition"
                >
                  <Scan className="w-4 h-4" />
                  <span>Scan Next Order</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* VIEW: ORDER DETAILS & VERIFICATION (Requirements 3, 4, 5, 6, 7, 11) */}
          {(workflowStep === 'REVIEW' || workflowStep === 'CONFIRM_DIALOG') && activeOrder && (
            <div className="space-y-5">
              
              {/* REQUIREMENT 11: ALREADY PICKED UP ALERT BANNER */}
              {isAlreadyDelivered && (
                <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl text-rose-950 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-sm text-rose-800">
                    <BadgeAlert className="w-5 h-5 text-rose-600" />
                    <span>ORDER ALREADY PICKED UP</span>
                  </div>
                  <p className="text-xs text-rose-900">
                    This order was previously marked as <strong>DELIVERED</strong>. To prevent accidental duplicate handover, another pickup cannot be created.
                  </p>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Original Pickup Date: </span>
                      <strong className="text-slate-900">{activeOrder.pickedUpAt || activeOrder.pickupDate || '24-Nov-25 5:30 PM'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Delivered By: </span>
                      <strong className="text-slate-900">{activeOrder.pickedUpBy || activeOrder.createdBy || 'Rajesh Sharma (Store Manager)'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* REQUIREMENT 3: 9 CORE METRICS DISPLAY */}
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md border border-slate-800">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Order / Receipt:</span>
                    <span className="text-xl font-extrabold text-white font-mono">
                      #{activeOrder.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({activeOrder.orderSeries || '*4-2*'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* REQUIREMENT 5: Clear Payment Status Badge */}
                    {getPaymentStatusBadge(activeOrder)}

                    {/* Order Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                      activeOrder.status === 'DELIVERED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : activeOrder.status === 'READY'
                        ? 'bg-sky-950 text-sky-300 border-sky-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}>
                      {activeOrder.status}
                    </span>
                  </div>
                </div>

                {/* Grid with remaining core attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  {/* Customer Name */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Customer Name</div>
                    <div className="font-bold text-slate-100 text-sm capitalize truncate flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{activeOrder.customerName}</span>
                    </div>
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Customer Phone</div>
                    <div className="font-bold text-slate-200 font-mono flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{activeOrder.customerMobile}</span>
                    </div>
                  </div>

                  {/* Garment Count */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Garment Count</div>
                    <div className="font-extrabold text-white text-sm font-mono flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{activeOrder.totalPieces} Pieces</span>
                    </div>
                  </div>

                  {/* Ready Date */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Ready Date</div>
                    <div className="font-bold text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{activeOrder.dueDate || '27 Nov 2025'}</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      Rs. {activeOrder.netAmount.toFixed(2)}
                    </div>
                  </div>

                  {/* Paid Amount */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Paid Amount</div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      Rs. {(activeOrder.advancePaid + activeOrder.payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className="pt-2 border-t border-slate-800 sm:col-span-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Balance Due</div>
                    <div className={`font-mono font-black text-base ${
                      activeOrder.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      Rs. {activeOrder.balanceDue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* REQUIREMENT 4: GARMENTS / ITEMS TABLE */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Package className="w-4 h-4 text-sky-600" />
                    <span>Garments in this Order ({activeOrder.items.length} Total)</span>
                  </div>

                  <button
                    onClick={toggleSelectAll}
                    disabled={isAlreadyDelivered}
                    className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {selectedBarcodes.length === activeOrder.items.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                        <span>All Selected ({selectedBarcodes.length})</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        <span>Select All ({selectedBarcodes.length}/{activeOrder.items.length})</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 w-10 text-center"></th>
                        <th className="p-2.5">Garment Details</th>
                        <th className="p-2.5 text-center font-mono">Barcode</th>
                        <th className="p-2.5">Service</th>
                        <th className="p-2.5 text-right">Price</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOrder.items.map((item) => {
                        const isSelected = selectedBarcodes.includes(item.barcode);
                        const isScannedMatch = matchedGarment?.barcode === item.barcode;

                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => !isAlreadyDelivered && toggleGarment(item.barcode)}
                            className={`transition-colors ${
                              isScannedMatch 
                                ? 'bg-sky-50/90 font-medium' 
                                : isSelected 
                                ? 'bg-slate-50/80' 
                                : 'hover:bg-slate-50'
                            } ${isAlreadyDelivered ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                          >
                            <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isAlreadyDelivered}
                                onChange={() => toggleGarment(item.barcode)}
                                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{item.garmentName}</span>
                                {isScannedMatch && (
                                  <span className="bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                                    Scanned Item
                                  </span>
                                )}
                              </div>
                              {(item.remarks?.length || item.brand) && (
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.remarks && item.remarks.join(', ')} {item.brand && `• Brand: ${item.brand}`}
                                </div>
                              )}
                            </td>

                            <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                              <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                                {item.barcode}
                              </span>
                            </td>

                            <td className="p-2.5 text-slate-700 font-medium">{item.serviceName}</td>

                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                              Rs. {(item.totalItemPrice * item.quantity).toFixed(2)}
                            </td>

                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.status === 'READY'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REQUIREMENT 6: PAYMENT SETTLEMENT SECTION (IF BALANCE IS DUE) */}
              {!isAlreadyDelivered && activeOrder.balanceDue > 0 && (
                <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Remaining Balance Settlement</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-amber-800">Current Due: </span>
                      <strong className="text-sm font-mono text-rose-700 font-extrabold">
                        Rs. {activeOrder.balanceDue.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Collection Amount Field */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Collection Amount (Rs.):</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={collectedAmount}
                          onChange={(e) => setCollectedAmount(e.target.value)}
                          className="w-full p-2 pl-3 border border-slate-300 rounded-lg font-mono font-bold text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setCollectedAmount(activeOrder.balanceDue.toString())}
                          className="absolute right-1.5 top-1 px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] rounded"
                        >
                          Full Settle
                        </button>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Payment Method:</label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['UPI', 'CASH', 'CARD', 'WALLET'] as const).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setPaymentMethod(mode)}
                            className={`py-1.5 px-1 rounded-md text-[11px] font-bold border transition text-center ${
                              paymentMethod === mode
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Difference Option when payment is less than balance due */}
                  {(() => {
                    const enteredAmt = parseFloat(collectedAmount) || 0;
                    const diff = Math.max(0, Number((activeOrder.balanceDue - enteredAmt).toFixed(2)));
                    if (enteredAmt > 0 && diff > 0) {
                      return (
                        <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-2.5 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 font-bold text-amber-950">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Payment Difference: ₹{diff.toFixed(2)}</span>
                            </div>
                            <span className="text-[11px] text-amber-800 font-medium">
                              Bill ₹{activeOrder.balanceDue.toFixed(2)} • Paying ₹{enteredAmt.toFixed(2)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              id="btn-qr-waive-difference"
                              onClick={() => setDifferenceOption(differenceOption === 'WAIVE' ? null : 'WAIVE')}
                              className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                                differenceOption === 'WAIVE'
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                                  : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs">
                                <span>Adjust/Waive ₹{diff.toFixed(2)}</span>
                                {differenceOption === 'WAIVE' && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-[10px] mt-0.5 ${differenceOption === 'WAIVE' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                Close difference & mark settled
                              </span>
                            </button>

                            <button
                              type="button"
                              id="btn-qr-carry-forward-difference"
                              onClick={() => setDifferenceOption(differenceOption === 'CARRY_FORWARD' ? null : 'CARRY_FORWARD')}
                              className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                                differenceOption === 'CARRY_FORWARD'
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                                  : 'bg-white text-slate-800 border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-xs">
                                <span>Carry Forward ₹{diff.toFixed(2)}</span>
                                {differenceOption === 'CARRY_FORWARD' && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-[10px] mt-0.5 ${differenceOption === 'CARRY_FORWARD' ? 'text-blue-100' : 'text-slate-500'}`}>
                                Save ₹{diff.toFixed(2)} as customer balance
                              </span>
                            </button>
                          </div>

                          {differenceOption === 'WAIVE' && (
                            <div className="text-[11px] text-emerald-800 bg-emerald-100 p-1.5 rounded border border-emerald-300 font-medium">
                              ✓ ₹{diff.toFixed(2)} will be adjusted/waived. Order will be marked fully settled.
                            </div>
                          )}
                          {differenceOption === 'CARRY_FORWARD' && (
                            <div className="text-[11px] text-blue-800 bg-blue-100 p-1.5 rounded border border-blue-300 font-medium">
                              ✓ ₹{diff.toFixed(2)} will be saved to {activeOrder.customerName}'s adjustment balance and can be applied on their next order.
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <p className="text-[11px] text-amber-900 italic">
                    Note: Recording this payment will automatically issue a WhatsApp WA-003 receipt to {activeOrder.customerName}.
                  </p>
                </div>
              )}

              {/* REQUIREMENT 8: CONFIRM PICKUP DIALOG (BEFORE COMPLETING) */}
              {workflowStep === 'CONFIRM_DIALOG' && (
                <div className="bg-slate-900 text-white p-5 rounded-xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">Confirm Pickup & Handover</h4>
                      <p className="text-xs text-slate-300">
                        Are you sure you want to hand over this order to the customer?
                      </p>
                    </div>
                  </div>

                  {/* Summary of Handover */}
                  <div className="bg-slate-800/90 rounded-lg p-3 text-xs space-y-1.5 border border-slate-700 text-slate-200">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <strong className="text-white font-mono">#{activeOrder.orderNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <strong className="text-white capitalize">{activeOrder.customerName} ({activeOrder.customerMobile})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Garments Handing Over:</span>
                      <strong className="text-emerald-400 font-mono">{selectedBarcodes.length} of {activeOrder.items.length} Pieces</strong>
                    </div>
                    {parseFloat(collectedAmount) > 0 && (
                      <div className="flex justify-between">
                        <span>Payment Collected Now:</span>
                        <strong className="text-emerald-300 font-mono">Rs. {parseFloat(collectedAmount).toFixed(2)} ({paymentMethod})</strong>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-slate-700 text-[11px] text-slate-400">
                      <span>Counter Staff:</span>
                      <span>{currentUser.name} ({currentUser.role})</span>
                    </div>
                  </div>

                  {/* Buttons in Confirmation Box */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setWorkflowStep('REVIEW')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="btn-confirm-pickup-final-yes"
                      onClick={handleConfirmPickupExecution}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md flex items-center gap-2 transition"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Yes, Confirm Handover</span>
                    </button>
                  </div>
                </div>
              )}

              {/* REQUIREMENT 7: CLEAR "COMPLETE PICKUP" BUTTON (When in review mode) */}
              {workflowStep === 'REVIEW' && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    {/* If order already delivered, provide print option instead */}
                    {isAlreadyDelivered ? (
                      <button
                        onClick={() => {
                          printThermalBookingReceipt(activeOrder, businessSettings);
                          showToast(`Sent Handover Copy for Order #${activeOrder.orderNumber} to printer dialog.`, 'success');
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4 text-slate-300" />
                        <span>Print Handover Copy</span>
                      </button>
                    ) : (
                      <button
                        id="btn-complete-pickup-trigger"
                        onClick={handleInitiatePickup}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-lg shadow-lg flex items-center gap-2 transition"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-200" />
                        <span>Complete Pickup ({selectedBarcodes.length} Garments)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: SCAN PROMPT / EMPTY STATE (If no order selected yet) */}
          {workflowStep === 'SCAN' && !activeOrder && (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <Scan className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Ready to Scan at the Counter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Scan customer garment QR tags or enter Order #4 in the search bar above to begin the pickup settlement and handover process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
