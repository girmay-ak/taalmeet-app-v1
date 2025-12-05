import { X, MessageCircle, MapPin, Sparkles, Heart, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Partner } from '../data/mockData';

interface MatchFoundPopupProps {
  partner: Partner | null;
  onClose: () => void;
  onNavigateToChat?: (partnerId: string) => void;
}

export function MatchFoundPopup({ 
  partner,
  onClose, 
  onNavigateToChat
}: MatchFoundPopupProps) {
  
  if (!partner) return null;

  // Current user data
  const currentUser = {
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    languages: ['Spanish', 'English']
  };

  // Confetti particles
  const confettiColors = ['#1DB954', '#1ED760', '#5FB3B3', '#E91E8C', '#FFD700', '#FF6B6B'];
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -20,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.3
  }));

  const handleMessage = () => {
    onClose();
    if (onNavigateToChat) {
      onNavigateToChat(partner.id);
    }
  };

  const handleViewProfile = () => {
    onClose();
    // Profile will be handled by parent
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        {/* Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`,
                rotate: particle.rotation,
                opacity: 0
              }}
              animate={{ 
                y: '120vh',
                rotate: particle.rotation + 360,
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 2.5,
                delay: particle.delay,
                ease: 'easeOut'
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-[360px] relative"
        >
          {/* Title with Animation */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ED760] mb-3"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Match Found!</h1>
            <p className="text-sm text-[#9CA3AF]">
              Someone nearby wants to practice {partner.languages.learning}
            </p>
          </motion.div>

          {/* Profile Cards with Hearts in Center */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center gap-4">
              {/* Current User Card */}
              <motion.div
                initial={{ x: -100, rotate: -15, opacity: 0 }}
                animate={{ x: 0, rotate: -5, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                className="relative"
              >
                <div className="w-32 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  <img 
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white">
                  <p className="text-xs font-semibold text-[#0F0F0F] whitespace-nowrap">You</p>
                </div>
                {/* Language Flag - What you're learning */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border-2 border-[#1DB954]"
                >
                  🇪🇸
                </motion.div>
              </motion.div>

              {/* Animated Language Exchange Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.6,
                  type: 'spring',
                  damping: 10,
                  stiffness: 200
                }}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                {/* Greeting in partner's language */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="px-2 py-1 rounded-lg bg-[#1DB954] shadow-lg"
                >
                  <p className="text-xs font-bold text-white whitespace-nowrap">¡Hola!</p>
                </motion.div>
                
                {/* Exchange Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#5FB3B3] flex items-center justify-center shadow-lg"
                >
                  <Languages className="w-5 h-5 text-white" />
                </motion.div>

                {/* Greeting in your language */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="px-2 py-1 rounded-lg bg-[#5FB3B3] shadow-lg"
                >
                  <p className="text-xs font-bold text-white whitespace-nowrap">Hello!</p>
                </motion.div>
              </motion.div>

              {/* Matched Partner Card */}
              <motion.div
                initial={{ x: 100, rotate: 15, opacity: 0 }}
                animate={{ x: 0, rotate: 5, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                className="relative"
              >
                <div className="w-32 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  <img 
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white">
                  <p className="text-xs font-semibold text-[#0F0F0F] whitespace-nowrap">
                    {partner.name.split(' ')[0]}
                  </p>
                </div>
                {/* Language Flag - What they're learning */}
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border-2 border-[#5FB3B3]"
                >
                  🇳🇱
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Match Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6"
          >
            <div className="space-y-3">
              {/* Distance */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#1DB954]" />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Distance</p>
                  <p className="text-sm font-semibold text-white">
                    {partner.distance} km away • {partner.location}
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5FB3B3]/20 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-[#5FB3B3]" />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Languages</p>
                  <p className="text-sm font-semibold text-white">
                    Learning {partner.languages.learning} • Speaks {partner.languages.native}
                  </p>
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E91E8C]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#E91E8C]" />
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Match Score</p>
                  <p className="text-sm font-semibold text-white">{partner.matchScore}% compatible</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleMessage}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/30"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleViewProfile}
              className="w-full py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold active:scale-95 transition-transform"
            >
              View Full Profile
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-3 text-sm text-[#9CA3AF] hover:text-white transition-colors"
            >
              Maybe Later
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#1DB954]/20 to-transparent rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}