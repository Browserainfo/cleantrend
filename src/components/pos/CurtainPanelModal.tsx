import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Minus, Check, Calculator, Info } from 'lucide-react';

export interface CurtainPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    quantity: number;
    totalPanels: number;
    pricePerPanel: number;
  }) => void;
  garmentName: string;
  serviceName: string;
  defaultPricePerPanel: number;
  initialQuantity?: number;
  initialTotalPanels?: number;
  isEditingExisting?: boolean;
}

export const CurtainPanelModal: React.FC<CurtainPanelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  garmentName,
  serviceName,
  defaultPricePerPanel,
  initialQuantity = 1,
  initialTotalPanels,
  isEditingExisting = false
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);
  const [totalPanels, setTotalPanels] = useState<number>(() => {
    if (initialTotalPanels !== undefined && initialTotalPanels > 0) return initialTotalPanels;
    return initialQuantity || 1;
  });
  const [pricePerPanel, setPricePerPanel] = useState<number>(defaultPricePerPanel || 100);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const q = Math.max(1, initialQuantity || 1);
      setQuantity(q);
      setTotalPanels(initialTotalPanels !== undefined && initialTotalPanels > 0 ? initialTotalPanels : q);
      setPricePerPanel(defaultPricePerPanel !== undefined ? defaultPricePerPanel : 100);
    }
  }, [isOpen, initialQuantity, initialTotalPanels, defaultPricePerPanel]);

  if (!isOpen) return null;

  // Calculation: Total Panels × Price per Panel
  const safeQty = Math.max(1, quantity);
  const safePanels = Math.max(1, totalPanels);
  const safePrice = Math.max(0, pricePerPanel);
  const totalPrice = safePanels * safePrice;

  const panelPresets = [1, 2, 4, 6, 8, 10, 15, 20];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onConfirm({
      quantity: safeQty,
      totalPanels: safePanels,
      pricePerPanel: safePrice
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Curtain Total Panel Counting</h3>
              <p className="text-[11px] text-slate-300">
                {garmentName} • <span className="text-sky-300 font-semibold">{serviceName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          
          {/* Explanation Alert */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-indigo-950">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11.5px] leading-relaxed">
              Enter <strong>Total Curtains / Pieces</strong> and <strong>Total Panels across all curtains</strong>. The total is calculated as <strong>Total Panels × Price per Panel</strong>.
            </div>
          </div>

          {/* Row 1: Total Curtains / Pieces */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Curtains / Pieces
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Physical curtain count</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition"
                  title="Decrease pieces"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantity}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setQuantity(cleaned === '' ? 1 : Math.max(1, parseInt(cleaned, 10)));
                  }}
                  className="w-14 text-center font-mono font-black text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition"
                  title="Increase pieces"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Piece{quantity !== 1 ? 's' : ''} (Piece: {quantity})
              </span>
            </div>
          </div>

          {/* Row 2: Total Panels across all curtains */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Total Panels Across All Curtains
              </label>
              <span className="text-[10px] text-indigo-700 font-bold">Total panel count</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {panelPresets.map((preset) => {
                const isSelected = totalPanels === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTotalPanels(preset)}
                    className={`py-1.5 px-2 rounded-md font-bold text-xs transition border flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct numeric input for Total Panels */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setTotalPanels(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition"
                  title="Decrease panels"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totalPanels}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setTotalPanels(cleaned === '' ? 1 : Math.max(1, parseInt(cleaned, 10)));
                  }}
                  className="w-16 text-center font-mono font-black text-sm text-indigo-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTotalPanels(prev => prev + 1)}
                  className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition"
                  title="Increase panels"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-bold text-indigo-700">
                Total Panels: {totalPanels}
              </span>
            </div>
          </div>

          {/* Row 3: Price per Panel */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Price per Panel
              </label>
              <span className="text-[10px] text-slate-500">Rate charged per panel</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2.5 py-1">
              <span className="text-slate-500 font-bold text-xs">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={pricePerPanel === 0 ? '' : pricePerPanel}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                  setPricePerPanel(cleaned === '' ? 0 : parseFloat(cleaned) || 0);
                }}
                className="w-18 font-mono font-bold text-xs text-slate-900 outline-none text-right"
                placeholder="50"
              />
              <span className="text-[10px] text-slate-400 font-medium">/panel</span>
            </div>
          </div>

          {/* Formula & Live Calculation Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-emerald-950">
            <div className="flex items-center justify-between text-xs font-bold border-b border-emerald-200/80 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                <span>Total Panels Pricing Method</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono">
                {totalPanels} Panels × ₹{pricePerPanel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Displayed In Order</div>
                <div className="font-bold text-slate-900 mt-0.5 text-xs">
                  Piece: <span className="font-black text-indigo-700 text-sm font-mono">{quantity}</span>
                  <span className="mx-1.5 text-slate-300">|</span>
                  Panel: <span className="font-black text-indigo-700 text-sm font-mono">{totalPanels}</span>
                </div>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60 text-right">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Line Price</div>
                <div className="font-mono font-black text-emerald-800 text-base mt-0.5">
                  ₹{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="text-[10.5px] text-emerald-800/80 italic pt-0.5">
              Example: {quantity} curtain{quantity !== 1 ? 's' : ''}, {totalPanels} total panels, ₹{pricePerPanel} per panel = ₹{totalPrice.toFixed(0)} total.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition active:scale-[0.99]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isEditingExisting ? 'Update Curtain' : 'Add Curtain'} (Piece: {quantity} • Panel: {totalPanels} • ₹{totalPrice.toFixed(0)})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
