import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarDays,
  Smartphone, 
  Banknote, 
  CreditCard, 
  X, 
  Clock, 
  User, 
  Receipt,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export interface EnrichedPayment {
  id: string;
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerMobile: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | string;
  channel: 'COUNTER' | 'ONLINE_PORTAL' | string;
  referenceId?: string;
  timestamp: string;
  collectedBy: string;
  notes?: string;
}

interface PaymentCalendarViewProps {
  payments: EnrichedPayment[];
}

export const PaymentCalendarView: React.FC<PaymentCalendarViewProps> = ({ payments }) => {
  // Navigation state - default to current month (or September 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Safe date key extraction (YYYY-MM-DD)
  const getDateKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getPaymentDateKey = (timestamp: string): string => {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      return getDateKey(d);
    } catch {
      return '';
    }
  };

  // Group payments by date key
  const paymentsByDate: Record<string, EnrichedPayment[]> = {};
  payments.forEach(p => {
    const key = getPaymentDateKey(p.timestamp);
    if (key) {
      if (!paymentsByDate[key]) {
        paymentsByDate[key] = [];
      }
      paymentsByDate[key].push(p);
    }
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monthly aggregated totals
  let monthTotal = 0;
  let monthUPI = 0;
  let monthCash = 0;
  let monthBank = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = getDateKey(new Date(year, month, day));
    const dayList = paymentsByDate[key] || [];
    dayList.forEach(p => {
      monthTotal += p.amount;
      if (p.paymentMethod === 'UPI') monthUPI += p.amount;
      else if (p.paymentMethod === 'CASH') monthCash += p.amount;
      else monthBank += p.amount; // NET_BANKING, CARD, etc.
    });
  }

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayKey = getDateKey(new Date());

  // Selected date details
  const selectedPayments = selectedDateKey ? (paymentsByDate[selectedDateKey] || []) : [];
  const selectedDayTotal = selectedPayments.reduce((sum, p) => sum + p.amount, 0);
  const selectedDayUPI = selectedPayments.filter(p => p.paymentMethod === 'UPI').reduce((sum, p) => sum + p.amount, 0);
  const selectedDayCash = selectedPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0);
  const selectedDayBank = selectedPayments.filter(p => p.paymentMethod !== 'UPI' && p.paymentMethod !== 'CASH').reduce((sum, p) => sum + p.amount, 0);

  const formatSelectedDateTitle = (dateKey: string) => {
    try {
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateKey;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Calendar Header & Month Navigation */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Payment Collection Calendar</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                {monthName}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Click any date to inspect customer collections, order numbers, and payment breakdown.
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-2xs p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-md transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-md transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Aggregate Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-100/70 border-b border-slate-200 text-xs">
        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">Month Total</div>
          <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
            ₹{monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-sky-200 bg-sky-50/40 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-sky-700 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <span>UPI Total</span>
          </div>
          <div className="text-base font-extrabold font-mono text-sky-800 mt-0.5">
            ₹{monthUPI.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1">
            <Banknote className="w-3 h-3" />
            <span>Cash Total</span>
          </div>
          <div className="text-base font-extrabold font-mono text-emerald-800 mt-0.5">
            ₹{monthCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-purple-200 bg-purple-50/40 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-purple-700 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Bank Transfer</span>
          </div>
          <div className="text-base font-extrabold font-mono text-purple-800 mt-0.5">
            ₹{monthBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Calendar Weekday Names */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center font-bold text-[11px] text-slate-600 py-2">
        <span className="text-rose-600">Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span className="text-sky-700">Sat</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px]">
        {/* Empty padding cells for start day */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-start-${i}`} className="bg-slate-50/50 min-h-[95px] p-2 select-none" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateObj = new Date(year, month, dayNum);
          const dateKey = getDateKey(dateObj);
          const isToday = dateKey === todayKey;
          const dayPayments = paymentsByDate[dateKey] || [];
          const hasPayments = dayPayments.length > 0;

          // Day specific breakdown
          const dayTotal = dayPayments.reduce((sum, p) => sum + p.amount, 0);
          const dayUPI = dayPayments.filter(p => p.paymentMethod === 'UPI').reduce((sum, p) => sum + p.amount, 0);
          const dayCash = dayPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0);
          const dayBank = dayPayments.filter(p => p.paymentMethod !== 'UPI' && p.paymentMethod !== 'CASH').reduce((sum, p) => sum + p.amount, 0);

          return (
            <div
              key={dateKey}
              onClick={() => {
                if (hasPayments) {
                  setSelectedDateKey(dateKey);
                }
              }}
              className={`min-h-[105px] p-2 flex flex-col justify-between transition relative ${
                hasPayments 
                  ? 'bg-white hover:bg-sky-50/70 hover:ring-2 hover:ring-sky-500 hover:z-10 cursor-pointer shadow-2xs' 
                  : 'bg-white/85 text-slate-400'
              } ${isToday ? 'bg-amber-50/50' : ''}`}
            >
              {/* Date Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday
                      ? 'bg-sky-600 text-white shadow-2xs font-extrabold'
                      : hasPayments
                      ? 'text-slate-900 bg-slate-100'
                      : 'text-slate-400'
                  }`}
                >
                  {dayNum}
                </span>

                {hasPayments && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {dayPayments.length} {dayPayments.length === 1 ? 'pay' : 'pays'}
                  </span>
                )}
              </div>

              {/* Day Amounts Breakdown */}
              {hasPayments ? (
                <div className="mt-1 space-y-0.5 text-[11px] leading-tight">
                  <div className="font-extrabold text-slate-900 font-mono text-xs flex items-center justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-[10px] text-slate-500 font-sans font-bold">Total:</span>
                    <span className="text-emerald-700">₹{dayTotal.toFixed(0)}</span>
                  </div>

                  {dayUPI > 0 && (
                    <div className="flex items-center justify-between text-sky-800 font-mono font-medium text-[10px]">
                      <span className="text-slate-500 font-sans">UPI:</span>
                      <span>₹{dayUPI.toFixed(0)}</span>
                    </div>
                  )}

                  {dayCash > 0 && (
                    <div className="flex items-center justify-between text-emerald-800 font-mono font-medium text-[10px]">
                      <span className="text-slate-500 font-sans">Cash:</span>
                      <span>₹{dayCash.toFixed(0)}</span>
                    </div>
                  )}

                  {dayBank > 0 && (
                    <div className="flex items-center justify-between text-purple-800 font-mono font-medium text-[10px]">
                      <span className="text-slate-500 font-sans">Bank:</span>
                      <span>₹{dayBank.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-auto text-[10px] text-slate-300 italic text-center">
                  No collection
                </div>
              )}
            </div>
          );
        })}

        {/* Empty padding cells for end of month grid */}
        {Array.from({ length: (7 - ((startDayOfWeek + daysInMonth) % 7)) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-slate-50/50 min-h-[95px] p-2 select-none" />
        ))}
      </div>

      {/* Date Detail Modal */}
      {selectedDateKey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Collections on {formatSelectedDateTitle(selectedDateKey)}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Detailed audit list of all payments received on this date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDateKey(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Day Summary Strip */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-500">Day Total</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">
                  ₹{selectedDayTotal.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-sky-200 bg-sky-50/30 shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-sky-700">UPI</div>
                <div className="text-base font-extrabold font-mono text-sky-800 mt-0.5">
                  ₹{selectedDayUPI.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-emerald-700">Cash</div>
                <div className="text-base font-extrabold font-mono text-emerald-800 mt-0.5">
                  ₹{selectedDayCash.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-200 bg-purple-50/30 shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-purple-700">Bank Transfer</div>
                <div className="text-base font-extrabold font-mono text-purple-800 mt-0.5">
                  ₹{selectedDayBank.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Modal Payments Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Order #</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Collected By</th>
                    <th className="p-2.5">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPayments.map(p => {
                    const timeStr = (() => {
                      try {
                        const d = new Date(p.timestamp);
                        return isNaN(d.getTime()) ? 'Counter' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch {
                        return 'Counter';
                      }
                    })();

                    const methodBadgeColor = (() => {
                      if (p.paymentMethod === 'UPI') return 'bg-sky-100 text-sky-800 border-sky-300';
                      if (p.paymentMethod === 'CASH') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      return 'bg-purple-100 text-purple-800 border-purple-300';
                    })();

                    const methodDisplay = (() => {
                      if (p.paymentMethod === 'NET_BANKING' || p.paymentMethod === 'CARD') return 'Bank Transfer';
                      return p.paymentMethod;
                    })();

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">
                          {timeStr}
                        </td>
                        <td className="p-2.5 font-bold font-mono text-sky-700">
                          #{p.orderNumber}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{p.customerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.customerMobile}</div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 text-sm">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${methodBadgeColor}`}>
                            {methodDisplay}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium">
                          {p.collectedBy || 'Front Counter'}
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {p.referenceId || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDateKey(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs transition cursor-pointer"
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
