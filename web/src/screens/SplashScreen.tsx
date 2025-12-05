import { useEffect } from 'react';
import { TaalMeetLogo } from '../components/TaalMeetLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-[#E91E8C] rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#5FB3B3] rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '0.6s' }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 animate-fade-in">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-subtle-bounce"
          style={{ boxShadow: '0 0 60px rgba(95, 179, 179, 0.4)' }}
        >
          <TaalMeetLogo size={112} />
        </div>
      </div>

      {/* App Name */}
      <div className="text-center mb-2 relative z-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h1 className="text-4xl font-bold text-white mb-2">
          TaalMeet
        </h1>
        <p className="text-[#9CA3AF]">
          Meet. Speak. Connect.
        </p>
      </div>

      {/* Loading indicator */}
      <div className="mt-12 relative z-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-xs text-[#9CA3AF] opacity-50 animate-fade-in" style={{ animationDelay: '1s' }}>
        Version 1.0.0
      </div>
    </div>
  );
}