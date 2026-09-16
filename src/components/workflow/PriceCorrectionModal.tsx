import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Send, 
  X, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { OrderGarmentItem } from '../../types';

export const PriceCorrectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetGarment?: OrderGarmentItem | null;
}> = ({ isOpen, onClose, targetGarment }) => {
  const { 
    selectedOrder, 
    orders, 
    currentUser, 
    currentRole, 
    priceCorrectionRequests, 
    requestPriceCorrection, 
    reviewPriceCorrection, 
    showToast 
  } = useApp();

  const order = selectedOrder || orders[0];
  const garment = targetGarment || order.items[0];

  const [selectedBarcode, setSelectedBarcode] = useState<string>(garment?.barcode || order.items[0]?.barcode || '');
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [reason, setReason] = useState<string>('Garment is Heavy Designer Silk with Zari Work requiring specialized delicate handling');

  if (!isOpen) return null;

  const isManager = currentRole === 'MANAGER';
  const isAdmin = currentRole === 'ADMIN';

  const activeGarment = order.items.find(i => i.barcode === selectedBarcode) || order.items[0];

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrice = parseFloat(proposedPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      showToast('Please enter a valid proposed price.', 'warning');
      return;
    }

    if (!reason.trim()) {
      showToast('Please state a clear reason for the price correction.', 'warning');
      return;
    }

    const res = requestPriceCorrection(order.id, activeGarment.barcode, newPrice, reason);
    if (res.success) {
      setProposedPrice('');
      onClose();
    }
  };

  const pendingRequests = priceCorrectionRequests.filter(r => r.orderId === order.id || r.status === 'PENDING');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Price Correction & Financial Authorization Queue</span>
                <span className="bg-amber-900/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-600/60">
                  Anti-Fraud Dual Control
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Managers propose price changes; Admin inspects and authorizes financial updates.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* SECTION 1: MANAGER INITIATION FORM */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Submit Price Correction Request (Manager Workflow)</span>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Garment Item:</label>
                  <select
                    value={selectedBarcode}
                    onChange={(e) => setSelectedBarcode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium text-slate-900 bg-white"
                  >
                    {order.items.map(item => (
                      <option key={item.barcode} value={item.barcode}>
                        {item.barcode} - {item.garmentName} (Current: Rs. {item.totalItemPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed New Price (Rs.):</label>
                  <input
                    type="number"
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder={`Current: ${activeGarment?.totalItemPrice || 0}`}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Reason / Justification:</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Heavy embroidery, extra dry clean chemical needed, stained silk..."
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 italic">
                  Initiated by <strong>{currentUser.name}</strong> ({currentRole})
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Admin Approval</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: ADMIN APPROVAL QUEUE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pending Price Correction Review Queue ({pendingRequests.length})</span>
              </div>
              
              {isAdmin && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Admin Authorization Active
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded border border-dashed border-slate-300">
                No pending price correction requests in the queue.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingRequests.map(req => (
                  <div 
                    key={req.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 transition ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-white border-amber-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {req.garmentBarcode}
                        </span>
                        <strong className="text-slate-900 text-sm">{req.garmentName}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">(Order #{req.orderNumber})</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-200 text-emerald-900'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Price Comparison */}
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[11px]">Current Price:</span>
                        <div className="font-mono font-bold text-slate-700">Rs. {req.currentPrice.toFixed(2)}</div>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-slate-400" />

                      <div>
                        <span className="text-slate-500 text-[11px]">Requested Price:</span>
                        <div className="font-mono font-extrabold text-emerald-700">Rs. {req.proposedPrice.toFixed(2)}</div>
                      </div>

                      <div className="ml-auto text-right text-[11px] text-slate-500">
                        <div>By: <strong className="text-slate-700">{req.requestedByName}</strong></div>
                        <div>{req.requestedAt}</div>
                      </div>
                    </div>

                    <div className="text-slate-600 text-[11px] italic">
                      <strong>Reason:</strong> "{req.reason}"
                    </div>

                    {/* Admin Action Buttons */}
                    {req.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => reviewPriceCorrection(req.id, false, 'Rejected by Admin after cloth review.')}
                              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-bold text-xs flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Request</span>
                            </button>
                            <button
                              onClick={() => reviewPriceCorrection(req.id, true)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve & Update Price</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Admin authorization...</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
