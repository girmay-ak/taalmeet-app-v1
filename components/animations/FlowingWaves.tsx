import { motion } from 'motion/react';

export function FlowingWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0A4D3C 0%, #0F0F0F 50%, #1A1A1A 100%)'
        }}
      />

      {/* Flowing Wave Pattern 1 - Top */}
      <motion.svg
        className="absolute top-0 left-0 w-full h-full opacity-30"
        viewBox="0 0 393 852"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        <motion.path
          d="M-50 100 Q 100 50, 200 100 T 450 100"
          stroke="#1DB954"
          strokeWidth="1.5"
          fill="none"
          animate={{
            d: [
              "M-50 100 Q 100 50, 200 100 T 450 100",
              "M-50 120 Q 100 80, 200 120 T 450 120",
              "M-50 100 Q 100 50, 200 100 T 450 100"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M-50 120 Q 100 70, 200 120 T 450 120"
          stroke="#1ED760"
          strokeWidth="1.5"
          fill="none"
          animate={{
            d: [
              "M-50 120 Q 100 70, 200 120 T 450 120",
              "M-50 100 Q 100 50, 200 100 T 450 100",
              "M-50 120 Q 100 70, 200 120 T 450 120"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.svg>

      {/* Curved Lines Pattern */}
      {Array.from({ length: 30 }).map((_, i) => {
        const delay = i * 0.05;
        const offset = i * 15;
        const rotation = (i * 12) % 360;
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              width: '300%',
              height: '300%',
              transformOrigin: 'center center'
            }}
            initial={{ rotate: rotation, opacity: 0 }}
            animate={{ 
              rotate: rotation + 360,
              opacity: [0, 0.15, 0]
            }}
            transition={{
              rotate: {
                duration: 40 + i * 2,
                repeat: Infinity,
                ease: 'linear'
              },
              opacity: {
                duration: 3,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 5
              }
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 1000"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <path
                d={`M ${200 + offset} 500 Q ${400 + offset} ${300 + offset}, ${600 + offset} 500`}
                stroke={i % 3 === 0 ? '#1DB954' : i % 3 === 1 ? '#5FB3B3' : '#1ED760'}
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        );
      })}

      {/* Geometric Flowing Pattern - Left */}
      <motion.div
        className="absolute left-0 top-1/4 w-64 h-64"
        style={{
          background: 'radial-gradient(circle, rgba(29, 185, 84, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          x: [-50, 50, -50],
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Geometric Flowing Pattern - Right */}
      <motion.div
        className="absolute right-0 top-1/2 w-64 h-64"
        style={{
          background: 'radial-gradient(circle, rgba(95, 179, 179, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          x: [50, -50, 50],
          y: [0, -100, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Wave Lines - Bottom */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full h-64"
        viewBox="0 0 393 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.path
            key={i}
            d={`M0 ${200 - i * 10} Q ${98} ${180 - i * 10}, ${196} ${200 - i * 10} T 393 ${200 - i * 10}`}
            stroke={i % 2 === 0 ? '#1DB954' : '#5FB3B3'}
            strokeWidth="1"
            opacity={0.2 - i * 0.01}
            animate={{
              d: [
                `M0 ${200 - i * 10} Q ${98} ${180 - i * 10}, ${196} ${200 - i * 10} T 393 ${200 - i * 10}`,
                `M0 ${200 - i * 10} Q ${98} ${220 - i * 10}, ${196} ${200 - i * 10} T 393 ${200 - i * 10}`,
                `M0 ${200 - i * 10} Q ${98} ${180 - i * 10}, ${196} ${200 - i * 10} T 393 ${200 - i * 10}`
              ]
            }}
            transition={{
              duration: 5 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1
            }}
          />
        ))}
      </motion.svg>

      {/* Diagonal Lines Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="diagonal-lines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="20" stroke="#1DB954" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
      </svg>

      {/* Center Hexagon Glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, transparent 60%)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}
