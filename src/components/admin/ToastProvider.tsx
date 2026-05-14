import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => {
            let Icon = CheckCircle2;
            let bgColor = 'bg-[#111114]';
            let borderColor = 'border-[#FFD000]/30';
            let iconColor = 'text-[#FFD000]';

            if (toast.type === 'error') {
               Icon = XCircle;
               borderColor = 'border-red-500/30';
               iconColor = 'text-red-500';
            } else if (toast.type === 'warning') {
               Icon = AlertCircle;
               borderColor = 'border-orange-500/30';
               iconColor = 'text-orange-500';
            } else if (toast.type === 'info') {
               Icon = Info;
               borderColor = 'border-blue-500/30';
               iconColor = 'text-blue-500';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${bgColor} ${borderColor}`}
              >
                 <div className="flex items-center gap-3">
                    <Icon size={20} className={iconColor} />
                    <span className="text-sm font-bold text-[#F4F4F2]">{toast.message}</span>
                 </div>
                 <button onClick={() => removeToast(toast.id)} className="text-[#6F7175] hover:text-white transition-colors">
                    <X size={16} />
                 </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
