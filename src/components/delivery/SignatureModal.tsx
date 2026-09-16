import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Edit3, 
  RotateCcw, 
  CheckCircle, 
  X, 
  ShieldCheck, 
  PenTool, 
  Sparkles 
} from 'lucide-react';

export const SignatureModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    selectedOrder, 
    orders, 
    completeDelivery, 
    currentUser, 
    showToast 
  } = useApp();

  const order = selectedOrder || orders[0];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      showToast('Please sign on the canvas to confirm handover.', 'warning');
      return;
    }

    const signatureDataUrl = canvas.toDataURL('image/png');
    completeDelivery(order.id, order.items.map(i => i.barcode), signatureDataUrl);
    showToast(`Customer signature recorded for Order #${order.orderNumber}. Handover closed.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <PenTool className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Customer Digital Handover Signature</h3>
              <p className="text-[11px] text-slate-400">Order #{order.orderNumber} • Customer: {order.customerName}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body & Signature Canvas */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-slate-700">
            <span>Handover Verification:</span>
            <strong className="text-slate-900 font-bold">{order.items.length} Garments Ready</strong>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-600 font-semibold mb-1">
              <span>Sign in the box below:</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-rose-600 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>
            </div>

            {/* Canvas */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={440}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair touch-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Digital proof of physical handover stored in order audit ledger.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-signature"
            onClick={handleSaveSignature}
            disabled={!hasSignature}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Signature & Complete Handover</span>
          </button>
        </div>
      </div>
    </div>
  );
};
