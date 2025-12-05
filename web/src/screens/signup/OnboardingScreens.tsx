import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingScreensProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingScreens({ onComplete, onSkip }: OnboardingScreensProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      title: 'Find Language\nPartners Nearby',
      description: 'Connect with native speakers in your area for real conversations',
      emoji: '🗺️',
      gradient: 'from-[#1DB954] to-[#1ED760]'
    },
    {
      title: 'Practice Real\nConversations',
      description: 'Learn by speaking, not just studying. Real people, real practice.',
      emoji: '💬',
      gradient: 'from-[#5FB3B3] to-[#4A9999]'
    },
    {
      title: 'Meet for Coffee\nor Video Chat',
      description: 'Exchange languages in person at a café or online from home',
      emoji: '☕',
      gradient: 'from-[#10B981] to-[#34D399]'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#1DB954]/30 to-[#1ED760]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-br from-[#5FB3B3]/30 to-[#4A9999]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-br from-[#10B981]/30 to-[#34D399]/20 rounded-full blur-3xl"
        />
        
        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 185, 84, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 185, 84, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#1DB954] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Skip Button */}
        <div className="flex justify-end px-6 pt-6 safe-top">
          <button
            onClick={onSkip}
            className="text-[#9CA3AF] hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Skip
          </button>
        </div>

        {/* Slides - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Illustration */}
                <motion.div
                  initial={{ scale: 0.8, rotateZ: -10 }}
                  animate={{ scale: 1, rotateZ: 0 }}
                  transition={{ 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="relative mx-auto mb-8"
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} blur-2xl opacity-50`} />
                  
                  {/* Main Circle */}
                  <div className={`relative w-48 h-48 mx-auto rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl`}>
                    <motion.span 
                      className="text-8xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {slides[currentSlide].emoji}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white mb-4 whitespace-pre-line"
                >
                  {slides[currentSlide].title}
                </motion.h2>

                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#9CA3AF] text-lg leading-relaxed max-w-sm mx-auto"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative group"
            >
              <div className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-gradient-primary'
                  : 'w-2 bg-[#2A2A2A] group-hover:bg-[#3A3A3A]'
              }`} />
            </button>
          ))}
        </div>

        {/* Next Button */}
        <div className="px-6 pb-8 safe-bottom">
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full max-w-md mx-auto block py-4 bg-gradient-primary text-white rounded-xl font-semibold overflow-hidden group"
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
            />
            <span className="relative z-10">
              {currentSlide === slides.length - 1 ? 'Get Started 🚀' : 'Next →'}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}