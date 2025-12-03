import { motion } from 'motion/react';

interface AnimatedGradientProps {
  className?: string;
}

export function AnimatedGradient({ className = '' }: AnimatedGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(29, 185, 84, 0.15) 0%, transparent 50%)'
        }}
        animate={{
          x: ['0%', '100%', '0%'],
          y: ['0%', '100%', '0%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 100% 100%, rgba(95, 179, 179, 0.15) 0%, transparent 50%)'
        }}
        animate={{
          x: ['100%', '0%', '100%'],
          y: ['100%', '0%', '100%']
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}
