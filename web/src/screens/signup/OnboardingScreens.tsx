import { motion } from 'motion/react';

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
    <div className="fixed inset-0 flex flex-col bg-[#0F0F0F]">
      {/* Skip Button */}
      <div className="flex justify-end px-6 pt-6 safe-top">
        <button
          onClick={onSkip}
          className="text-[#9CA3AF] hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
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
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl`}
            >
              <span className="text-8xl">{slides[currentSlide].emoji}</span>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-4 whitespace-pre-line">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-sm mx-auto">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-gradient-primary'
                : 'w-2 bg-[#2A2A2A]'
            }`}
          />
        ))}
      </div>

      {/* Next Button */}
      <div className="px-6 pb-8 safe-bottom">
        <button
          onClick={handleNext}
          className="w-full py-4 bg-gradient-primary text-white rounded-xl font-semibold active:scale-[0.98] transition-transform"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { AnimatePresence } from 'motion/react';
