import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useApp();

  if (!toastMessage) return null;

  const bgColors = {
    success: 'bg-emerald-900/95 border-emerald-500 text-white shadow-emerald-900/20',
    error: 'bg-rose-900/95 border-rose-500 text-white shadow-rose-900/20',
    warning: 'bg-amber-900/95 border-amber-500 text-white shadow-amber-900/20',
    info: 'bg-slate-900/95 border-sky-500 text-white shadow-slate-900/30',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  return (
    <div 
      className="fixed top-14 right-5 z-50 max-w-md animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
      role="alert"
    >
      <div 
        onClick={hideToast}
        className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border shadow-xl backdrop-blur-md cursor-pointer group transition hover:opacity-95 ${bgColors[toastMessage.type]}`}
      >
        <div className="mt-0.5">{icons[toastMessage.type]}</div>
        <div className="text-xs font-medium leading-snug flex-1 pr-1">
          {toastMessage.text}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            hideToast();
          }}
          className="text-white/60 hover:text-white p-0.5 rounded transition shrink-0 ml-1"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = Toast;

