import { X, Check, Sparkles, Zap, Users, MessageCircle, MapPin, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '9.99',
    period: '/month',
    savings: null
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '79.99',
    period: '/year',
    savings: 'Save 33%',
    popular: true
  }
];

const features = [
  { icon: Users, text: 'Unlimited matches & connections', color: '#1DB954' },
  { icon: MessageCircle, text: 'Priority message delivery', color: '#5FB3B3' },
  { icon: MapPin, text: 'See who viewed your profile', color: '#E91E8C' },
  { icon: Zap, text: 'Boost your profile visibility', color: '#F59E0B' },
  { icon: Shield, text: 'Advanced privacy controls', color: '#8B5CF6' },
  { icon: Sparkles, text: 'Exclusive premium badge', color: '#1ED760' }
];

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl overflow-hidden"
          >
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-[#E91E8C] via-[#C71976] to-[#9B1560] p-6 pb-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="text-center pt-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Go Premium</h2>
                <p className="text-white/80">
                  Unlock all features and supercharge your language learning
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Plan Selection */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                        selectedPlan === plan.id
                          ? 'border-[#E91E8C] bg-[#E91E8C]/10'
                          : 'border-[#2A2A2A] bg-[#0F0F0F]'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-[#E91E8C] to-[#C71976] rounded-full">
                          <span className="text-xs font-semibold text-white">Most Popular</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm text-[#9CA3AF] mb-1">{plan.name}</p>
                        <div className="mb-1">
                          <span className="text-2xl font-bold text-white">${plan.price}</span>
                          <span className="text-sm text-[#9CA3AF]">{plan.period}</span>
                        </div>
                        {plan.savings && (
                          <p className="text-xs font-semibold text-[#1DB954]">{plan.savings}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-white mb-3">Premium Features</h3>
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <span className="text-white">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleUpgrade}
                className="w-full py-4 bg-gradient-to-r from-[#E91E8C] to-[#C71976] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-[#E91E8C]/30"
              >
                <Sparkles className="w-5 h-5" />
                Upgrade to Premium
              </button>

              {/* Fine Print */}
              <p className="text-xs text-center text-[#9CA3AF] mt-4">
                Cancel anytime. Auto-renews unless canceled.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
