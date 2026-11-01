import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (title: string, type?: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, type: ToastType = 'info', description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, title, type, description };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border text-sm backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#151C2C]/95 border-[#34D399]/30 text-[#F3F6FC]'
                : toast.type === 'error'
                ? 'bg-[#151C2C]/95 border-[#F87171]/40 text-[#F3F6FC]'
                : 'bg-[#151C2C]/95 border-[#4F8CFF]/30 text-[#F3F6FC]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#34D399]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#F87171]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#4F8CFF]" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{toast.title}</div>
              {toast.description && (
                <div className="text-xs text-[#9AA8BD] mt-0.5 leading-relaxed">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9AA8BD] hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
