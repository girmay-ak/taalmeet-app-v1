import { Home, Search, MessageCircle, User, LogOut, Settings, Menu, X, HelpCircle, Shield, Sparkles, ChevronRight, Bell, Award, Calendar, ChevronLeft, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TaalMeetLogo } from './TaalMeetLogo';
import { AvailabilityNotifications } from './AvailabilityNotifications';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userAvatar?: string;
  userName?: string;
  isPremium?: boolean;
  onSettings?: () => void;
  unreadMessages?: number;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  userAvatar, 
  userName = 'User',
  isPremium = false,
  onSettings,
  unreadMessages = 0 
}: SidebarProps) {
  const { mode } = useTheme();
  
  // Load collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 5 },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.aside 
      className="hidden lg:flex flex-col h-screen sticky top-0 relative overflow-visible"
      style={{
        backgroundColor: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)'
      }}
      animate={{ 
        width: isCollapsed ? '90px' : '260px' 
      }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
        mass: 0.8
      }}
    >
      {/* Curved Background with Subtle Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Curved wave shape */}
        <svg 
          className="absolute top-0 right-0 h-full w-auto opacity-5" 
          viewBox="0 0 100 800" 
          preserveAspectRatio="none"
          style={{ transform: 'translateX(50%)' }}
        >
          <path 
            d="M 0 0 Q 50 100 0 200 T 0 400 T 0 600 T 0 800 L 100 800 L 100 0 Z" 
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1DB954" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1ED760" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: 'var(--color-primary)',
              opacity: 0.1
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.05, 0.15, 0.05],
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
      <div className="relative z-10 flex flex-col h-full">
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 z-50 w-8 h-8 rounded-full flex items-center justify-center shadow-xl overflow-hidden group"
          style={{
            backgroundColor: 'var(--color-card)',
            borderWidth: '1px',
            borderColor: 'var(--color-border)'
          }}
          whileHover={{ 
            scale: 1.15,
            boxShadow: '0 8px 24px rgba(29, 185, 84, 0.3)'
          }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Gradient background on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'var(--gradient-primary)' }}
          />
          
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <ChevronRight 
              className="w-4 h-4 transition-colors" 
              style={{ color: 'var(--color-text)' }}
            />
          </motion.div>
        </motion.button>

        {/* Logo Section */}
        <div 
          className="px-4 pt-8 pb-6 flex items-center justify-center border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-primary">
                  <TaalMeetLogo size={32} />
                </div>
                <h1 
                  className="text-2xl font-bold" 
                  style={{ color: 'var(--color-text)' }}
                >
                  TaalMeet
                </h1>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-primary"
              >
                <TaalMeetLogo size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items - Centered Icons */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div key={item.id} className="relative group w-full">
                <motion.button
                  onClick={() => onTabChange(item.id)}
                  className="relative w-full flex items-center justify-center rounded-2xl transition-all overflow-hidden border"
                  style={{
                    height: '56px',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-background)',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-primary)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarGlow"
                      className="absolute inset-0 rounded-2xl"
                      style={{ 
                        background: 'var(--gradient-primary)',
                        boxShadow: '0 0 20px rgba(29, 185, 84, 0.3)'
                      }}
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    />
                  )}
                  
                  {/* Hover glow for inactive */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
                      style={{ background: 'var(--gradient-primary)' }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center justify-center gap-3 px-4 w-full">
                    <Icon 
                      className="w-6 h-6 flex-shrink-0" 
                      style={{ 
                        color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                      }} 
                    />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-semibold whitespace-nowrap flex-1 text-left"
                          style={{ color: isActive ? '#FFFFFF' : 'var(--color-text-muted)' }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 bg-[#EF4444] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-20"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  )}
                </motion.button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-2 bg-[#EF4444] text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section - User & Settings */}
        <div 
          className="px-4 pb-8 space-y-3 border-t pt-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Settings Button */}
          <div className="relative group">
            <motion.button
              onClick={onSettings}
              className="w-full flex items-center justify-center rounded-2xl transition-all overflow-hidden border"
              style={{
                height: '56px',
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              whileHover={{ 
                scale: 1.03,
                borderColor: 'var(--color-primary)'
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
                style={{ background: 'var(--gradient-primary)' }}
              />
              
              <div className="relative z-10 flex items-center justify-center gap-3 px-4 w-full">
                <Settings 
                  className="w-6 h-6 flex-shrink-0" 
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-semibold whitespace-nowrap flex-1 text-left"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div 
                className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl border"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  Settings
                </span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.button
                key="expanded-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onTabChange('profile')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all overflow-hidden border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  borderColor: 'var(--color-primary)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                    alt={userName}
                    className="w-12 h-12 rounded-xl object-cover border-2 shadow-lg"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#F59E0B] to-[#FCD34D] rounded-full flex items-center justify-center border-2 shadow-lg" style={{ borderColor: 'var(--color-card)' }}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                    {userName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    View profile
                  </p>
                </div>
              </motion.button>
            ) : (
              <motion.button
                key="collapsed-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onTabChange('profile')}
                className="w-full flex items-center justify-center p-3 rounded-2xl transition-all border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: 'var(--color-primary)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <img 
                    src={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                    alt={userName}
                    className="w-12 h-12 rounded-xl object-cover border-2 shadow-lg"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#F59E0B] to-[#FCD34D] rounded-full flex items-center justify-center border-2 shadow-lg" style={{ borderColor: 'var(--color-card)' }}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}