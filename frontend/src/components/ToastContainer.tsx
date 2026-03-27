"use client";

import { useToastStore } from '@/store/useToastStore';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold max-w-xs animate-slide-in border ${
            toast.type === 'success' ? 'bg-white border-green-200 text-gray-800' :
            toast.type === 'error'   ? 'bg-white border-red-200 text-gray-800' :
                                       'bg-white border-blue-200 text-gray-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
          {toast.type === 'error'   && <AlertCircle  size={18} className="text-red-500 shrink-0" />}
          {toast.type === 'info'    && <AlertCircle  size={18} className="text-blue-500 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => dismiss(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
