import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowDownRight, 
  CheckCircle, 
  Search, 
  Filter, 
  Receipt, 
  MessageSquare, 
  Clock, 
  User, 
  ExternalLink,
  ShieldCheck,
  Plus,
  CalendarDays,
  List,
  AlertCircle,
  Check
} from 'lucide-react';
import { PaymentTransaction } from '../../types';
import { PaymentCalendarView } from './PaymentCalendarView';

export const AccountScreen: React.FC = () => {
  const { 
    orders, 
    recordPayment, 
    showToast, 
    setCustomerPortalOpen, 
    setWhatsAppSimulatorOpen,
    currentUser,
    currentRole 
  } = useApp();

  const [viewMode, setViewMode] = useState<'TABLE' | 'CALENDAR'>('TABLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('ALL');

  // Quick Pay Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders.find(o => o.balanceDue > 0)?.id || orders[0]?.id || '');
  const [collectAmount, setCollectAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('UPI');
  const [referenceId, setReferenceId] = useState<string>('');
  const [differenceOption, setDifferenceOption] = useState<'WAIVE' | 'CARRY_FORWARD' | null>(null);

  // Calculate Overall Financial Totals (Without GST)
  const totalGross = orders.reduce((sum, o) => sum + o.grossAmount, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalNet = orders.reduce((sum, o) => sum + o.netAmount, 0);
  const totalPaid = orders.reduce((sum, o) => sum + (o.netAmount - o.balanceDue), 0);
  const totalBalance = orders.reduce((sum, o) => sum + o.balanceDue, 0);

  // Flatten all payment transactions
  const allPayments = orders.flatMap(order => 
    order.payments.map(p => ({
      ...p,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerMobile: order.customerMobile
    }))
  );

  // Filter transactions
  const filteredPayments = allPayments.filter(p => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toString().includes(searchQuery) ||
      (p.referenceId && p.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMode = filterMode === 'ALL' || p.paymentMethod === filterMode;
    return matchesSearch && matchesMode;
  });

  // Calculate Today's Ledger by Mode
  const cashCollected = allPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0);
  const upiCollected = allPayments.filter(p => p.paymentMethod === 'UPI').reduce((sum, p) => sum + p.amount, 0);
  const cardCollected = allPayments.filter(p => p.paymentMethod === 'CARD').reduce((sum, p) => sum + p.amount, 0);
  const netBankingCollected = allPayments.filter(p => p.paymentMethod === 'NET_BANKING').reduce((sum, p) => sum + p.amount, 0);

  const selectedOrderForPayment = orders.find(o => o.id === selectedOrderId) || orders[0];

  const handleOpenCollectForOrder = (orderId: string, defaultAmount: number) => {
    setSelectedOrderId(orderId);
    setCollectAmount(defaultAmount.toString());
    setDifferenceOption(null);
    setIsCollectModalOpen(true);
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(collectAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid collection amount.', 'warning');
      return;
    }

    const order = orders.find(o => o.id === selectedOrderId);
    const balanceDue = order?.balanceDue || 0;
    const diff = Number((balanceDue - amt).toFixed(2));
    const effectiveAction = (amt > 0 && diff > 0) ? (differenceOption || undefined) : undefined;
    const effectiveAmount = effectiveAction ? diff : undefined;

    recordPayment(
      selectedOrderId, 
      amt, 
      paymentMethod, 
      'COUNTER', 
      referenceId || `COUNTER-${Date.now().toString().slice(-4)}`,
      effectiveAction,
      effectiveAmount
    );
    setIsCollectModalOpen(false);
    setCollectAmount('');
    setReferenceId('');
    setDifferenceOption(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Account, Payments & Cash Drawer</h1>
            <p className="text-xs text-slate-500">
              Financial summary: Gross, Discount, Net, Paid, Balance, and Settlement Ledger.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-sky-600" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CALENDAR'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calendar View</span>
            </button>
          </div>

          <button
            onClick={() => {
              const pending = orders.find(o => o.balanceDue > 0);
              if (pending) {
                handleOpenCollectForOrder(pending.id, pending.balanceDue);
              } else {
                setIsCollectModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Payment</span>
          </button>
        </div>
      </div>

      {/* Main Account View */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Financial Summary Strip (Without GST) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Gross</div>
            <div className="text-lg font-bold text-slate-900 mt-1 font-mono">₹{totalGross.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-rose-600 uppercase">Discount Granted</div>
            <div className="text-lg font-bold text-rose-700 mt-1 font-mono">₹{totalDiscount.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-900 uppercase">Net Revenue</div>
            <div className="text-lg font-extrabold text-sky-950 mt-1 font-mono">₹{totalNet.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Total Paid</div>
            <div className="text-lg font-bold text-emerald-700 mt-1 font-mono">₹{totalPaid.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 shadow-xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-rose-800 uppercase">Balance Due</div>
            <div className="text-lg font-bold text-rose-700 mt-1 font-mono">₹{totalBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* Daily Cash Drawer Breakdown by Payment Channel */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Counter Cash Drawer & Channel Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <div>
                <div className="text-emerald-900 font-bold flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>Cash Drawer</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Physical Counter Cash</div>
              </div>
              <div className="text-right font-mono font-bold text-sm text-emerald-950">
                ₹{cashCollected.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/60 flex items-center justify-between">
              <div>
                <div className="text-sky-900 font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-700" />
                  <span>UPI / QR Code</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Direct Instant Pay</div>
              </div>
              <div className="text-right font-mono font-bold text-sm text-sky-950">
                ₹{upiCollected.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/60 flex items-center justify-between">
              <div>
                <div className="text-purple-900 font-bold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-700" />
                  <span>Credit / Debit Card</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">POS Card Machine</div>
              </div>
              <div className="text-right font-mono font-bold text-sm text-purple-950">
                ₹{cardCollected.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-700" />
                  <span>Bank Transfer / Online</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Net Banking & Portal</div>
              </div>
              <div className="text-right font-mono font-bold text-sm text-slate-950">
                ₹{netBankingCollected.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* CONDITIONAL: CALENDAR VIEW vs TABLE VIEW */}
        {viewMode === 'CALENDAR' ? (
          <PaymentCalendarView payments={allPayments} />
        ) : (
          <>
            {/* Pending Customer Balances Requiring Collection */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Pending Customer Balances Awaiting Settlement</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {orders.filter(o => o.balanceDue > 0).length} Orders with Outstanding Dues
                </span>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5">Order #</th>
                      <th className="p-2.5">Customer Name & Phone</th>
                      <th className="p-2.5">Order Net</th>
                      <th className="p-2.5">Paid So Far</th>
                      <th className="p-2.5">Balance Due</th>
                      <th className="p-2.5">Order Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.filter(o => o.balanceDue > 0).map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-bold font-mono text-sky-700">#{o.orderNumber}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{o.customerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{o.customerMobile}</div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">₹{o.netAmount.toFixed(2)}</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-bold">
                          ₹{(o.netAmount - o.balanceDue).toFixed(2)}
                        </td>
                        <td className="p-2.5 font-mono text-rose-700 font-bold text-sm">
                          ₹{o.balanceDue.toFixed(2)}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleOpenCollectForOrder(o.id, o.balanceDue)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] shadow-2xs transition cursor-pointer"
                          >
                            Collect ₹{o.balanceDue.toFixed(0)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction History Ledger */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span>Immutable Payment Ledger & Audit Trail ({filteredPayments.length})</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search transaction, order, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500 w-52"
                  />

                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700"
                  >
                    <option value="ALL">All Modes</option>
                    <option value="CASH">Cash Only</option>
                    <option value="UPI">UPI Only</option>
                    <option value="CARD">Card Only</option>
                    <option value="NET_BANKING">Bank Transfer / Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Order #</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Amount Paid</th>
                      <th className="p-2.5">Payment Method</th>
                      <th className="p-2.5">Collected By</th>
                      <th className="p-2.5">Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {new Date(p.timestamp).toLocaleDateString('en-GB')} {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5 font-bold font-mono text-sky-700">#{p.orderNumber}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{p.customerName}</div>
                          <div className="text-[10px] text-slate-500">{p.customerMobile}</div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 text-sm">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {p.paymentMethod === 'NET_BANKING' || p.paymentMethod === 'CARD' ? 'Bank Transfer' : p.paymentMethod}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium">{p.collectedBy}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{p.referenceId || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Collect Payment Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Collect Customer Payment</h3>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Customer Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const target = orders.find(o => o.id === e.target.value);
                    if (target) setCollectAmount(target.balanceDue.toString());
                  }}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900 outline-none"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} - {o.customerName} (Bal: ₹{o.balanceDue.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded font-mono font-bold text-emerald-800 text-base outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
                />
              </div>

              {/* Payment difference options when payment < bill/balance */}
              {(() => {
                const amt = parseFloat(collectAmount) || 0;
                const bal = selectedOrderForPayment?.balanceDue || 0;
                const diff = Math.max(0, Number((bal - amt).toFixed(2)));
                if (amt > 0 && diff > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Payment Difference: ₹{diff.toFixed(2)}</span>
                        </div>
                        <span className="text-[11px] text-amber-800 font-medium">
                          Bill ₹{bal.toFixed(2)} • Paying ₹{amt.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="btn-account-waive-difference"
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
                          id="btn-account-carry-forward-difference"
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
                            Save ₹{diff.toFixed(2)} to customer balance
                          </span>
                        </button>
                      </div>

                      {differenceOption === 'WAIVE' && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-100/80 p-1.5 rounded border border-emerald-300 font-medium">
                          ✓ ₹{diff.toFixed(2)} will be adjusted/waived. Order will be marked fully settled.
                        </div>
                      )}
                      {differenceOption === 'CARRY_FORWARD' && (
                        <div className="text-[11px] text-blue-800 bg-blue-100/80 p-1.5 rounded border border-blue-300 font-medium">
                          ✓ ₹{diff.toFixed(2)} will be saved to {selectedOrderForPayment.customerName}'s adjustment balance and can be applied on their next order.
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Mode</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['UPI', 'CASH', 'CARD', 'NET_BANKING'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-1.5 rounded text-[11px] font-bold border transition ${
                        paymentMethod === mode
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {mode.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Transaction / Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9283748293 / POS-4402"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Payment & Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
