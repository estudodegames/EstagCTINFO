import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-slate-900/95 text-white border-emerald-500/40'
            : toast.type === 'error'
            ? 'bg-slate-900/95 text-white border-rose-500/40'
            : 'bg-slate-900/95 text-white border-indigo-500/40'
        }`}
      >
        {toast.type === 'success' && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        {toast.type === 'error' && (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        {toast.type === 'info' && (
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 text-xs sm:text-sm font-medium">
          {toast.text}
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
