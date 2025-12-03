import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface FloatingBadgeProps {
  children: ReactNode;
  delay?: number;
}

export function FloatingBadge({ children, delay = 0 }: FloatingBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: [0, -5, 0],
      }}
      transition={{
        opacity: { duration: 0.3, delay },
        y: {
          duration: 2,
          delay,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function PulseBadge({ children, color = '#1DB954' }: { children: ReactNode; color?: string }) {
  return (
    <div className="relative inline-flex">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
      {children}
    </div>
  );
}

export function ShakeBadge({ children, trigger }: { children: ReactNode; trigger: boolean }) {
  return (
    <motion.div
      animate={trigger ? {
        rotate: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}
