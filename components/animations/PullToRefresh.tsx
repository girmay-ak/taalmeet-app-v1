import { motion, useMotionValue, useTransform } from 'motion/react';
import { ReactNode, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({ children, onRefresh, threshold = 80 }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, threshold], [0, 360]);
  const opacity = useTransform(y, [0, threshold], [0, 1]);

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    y.set(0);
  };

  return (
    <div className="relative overflow-hidden h-full">
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center pt-4 pb-2"
        style={{ opacity }}
      >
        <motion.div
          style={{ rotate }}
          className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>
      
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: threshold }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
