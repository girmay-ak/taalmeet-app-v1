import { motion } from 'motion/react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export function SkeletonLoader({ width = '100%', height = '20px', className = '', circle = false }: SkeletonLoaderProps) {
  return (
    <div 
      className={`relative overflow-hidden ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ 
        width, 
        height,
        backgroundColor: 'var(--color-border)'
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

export function PartnerCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'var(--color-card)' }}>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonLoader width="64px" height="64px" circle />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="60%" height="20px" />
          <SkeletonLoader width="40%" height="16px" />
        </div>
      </div>
      <SkeletonLoader width="100%" height="60px" className="mb-3" />
      <div className="flex gap-2">
        <SkeletonLoader width="48%" height="36px" />
        <SkeletonLoader width="48%" height="36px" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <SkeletonLoader width="48px" height="48px" circle />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="50%" height="18px" />
        <SkeletonLoader width="70%" height="14px" />
      </div>
      <SkeletonLoader width="40px" height="14px" />
    </div>
  );
}
