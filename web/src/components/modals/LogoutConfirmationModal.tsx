import { LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmationModal({ isOpen, onClose, onConfirm }: LogoutConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] w-full max-w-sm rounded-3xl overflow-hidden border border-[#2A2A2A]"
          >
            {/* Icon */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#EF4444]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-[#EF4444]" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Log Out?</h2>
              <p className="text-[#9CA3AF]">
                Are you sure you want to log out? You'll need to log back in to continue using TaalMeet.
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#2A2A2A] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#2A2A2A] text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-[#EF4444] text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}