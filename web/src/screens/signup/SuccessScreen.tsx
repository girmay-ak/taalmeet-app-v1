import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SuccessScreenProps {
  onComplete: () => void;
}

export function SuccessScreen({ onComplete }: SuccessScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F0F0F]">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 w-32 h-32 bg-gradient-primary rounded-full -m-8"
            />
            
            {/* Inner circle */}
            <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="text-6xl">🎉</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to
          </h1>
          <h2 className="text-4xl font-bold text-gradient-primary mb-4">
            TaalMeet!
          </h2>
          <p className="text-lg text-[#9CA3AF] leading-relaxed max-w-sm">
            Your profile is ready! Let's find your first language partner.
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-8 w-full max-w-sm"
        >
          {[
            { icon: '🗺️', text: 'Discover partners nearby' },
            { icon: '💬', text: 'Chat instantly' },
            { icon: '⭐', text: 'Build connections' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3 bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 pb-8 space-y-3 safe-bottom"
      >
        <button
          onClick={onComplete}
          className="w-full py-4 bg-gradient-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          Discover Partners
        </button>
        
        <button
          onClick={onComplete}
          className="w-full text-[#9CA3AF] hover:text-white transition-colors"
        >
          Complete Profile Later
        </button>
      </motion.div>
    </div>
  );
}
