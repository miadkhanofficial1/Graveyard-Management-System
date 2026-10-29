import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastNotification } from '../../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  // Limit visible toasts to maximum 2 at a time
  const visibleToasts = toasts.slice(-2);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => {
          const type = toast.type || 'info';

          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          };

          const borderMap = {
            success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-[0_8px_32px_rgba(16,185,129,0.2)]',
            warning: 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100 shadow-[0_8px_32px_rgba(245,158,11,0.2)]',
            error: 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100 shadow-[0_8px_32px_rgba(244,63,94,0.2)]',
            info: 'border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100 shadow-[0_8px_32px_rgba(14,165,233,0.2)]',
          };

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl flex items-start gap-3 bg-white/80 dark:bg-slate-900/80 ${borderMap[type]}`}
            >
              {iconMap[type]}
              <div className="flex-1 min-w-0 pr-1">
                <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
                <p className="text-[11px] opacity-85 mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shrink-0 cursor-pointer"
                title="Dismiss notification"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
