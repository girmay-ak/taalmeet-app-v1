import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pt-4 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="mb-2 pointer-events-auto w-full max-w-sm"
            >
              <div 
                className={`rounded-xl px-4 py-3 shadow-lg border flex items-center gap-3 ${
                  toast.type === 'success' ? 'bg-[#1DB954] border-[#1ED760]' :
                  toast.type === 'error' ? 'bg-[#EF4444] border-[#F87171]' :
                  'bg-[#5FB3B3] border-[#7FC7C7]'
                }`}
              >
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-white flex-shrink-0" />}
                <p className="flex-1 text-white font-medium text-sm">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
