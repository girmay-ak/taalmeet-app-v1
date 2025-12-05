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
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.aside 
      className="hidden lg:flex flex-col h-screen border-r sticky top-0 relative"
      style={{ 
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
      animate={{ 
        width: isCollapsed ? '80px' : '260px' 
      }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
        mass: 0.8
      }}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 z-50 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all group overflow-hidden"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 8px 20px rgba(29, 185, 84, 0.3)'
        }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Animated gradient background on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #5FB3B3 100%)'
          }}
        />
        
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10"
        >
          <ChevronRight 
            className="w-4 h-4 group-hover:text-white transition-colors" 
            style={{ color: 'var(--color-text)' }}
          />
        </motion.div>
      </motion.button>

      {/* Logo & User Section */}
      <div 
        className="border-b overflow-hidden" 
        style={{ 
          borderColor: 'var(--color-border)',
          padding: isCollapsed ? '20px 16px' : '24px'
        }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <TaalMeetLogo size={40} />
                </div>
                <h1 className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--color-text)' }}>TaalMeet</h1>
              </div>

              {/* User Profile Card */}
              <button 
                onClick={() => onTabChange('profile')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-all active:scale-95"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                }}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#F59E0B] to-[#FCD34D] rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--color-card)' }}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{userName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>View profile</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <TaalMeetLogo size={40} />
              </div>
              
              <button 
                onClick={() => onTabChange('profile')}
                className="relative group"
              >
                <img 
                  src={userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover transition-transform hover:scale-110 active:scale-95"
                />
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#F59E0B] to-[#FCD34D] rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--color-card)' }}>
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onTabChange(item.id)}
                className="relative w-full flex items-center rounded-xl transition-all active:scale-95 overflow-hidden"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                  padding: isCollapsed ? '12px 0' : '12px 16px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? '0' : '12px'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
                
                <Icon 
                  className="w-5 h-5 relative z-10 flex-shrink-0" 
                  style={{ color: isActive ? '#FFFFFF' : 'inherit' }} 
                />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium relative z-10 whitespace-nowrap" 
                      style={{ color: isActive ? '#FFFFFF' : 'inherit' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {item.badge && item.badge > 0 && !isCollapsed && (
                  <span className="ml-auto relative z-10 bg-[#EF4444] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                
                {item.badge && item.badge > 0 && isCollapsed && (
                  <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center z-20">
                    {item.badge > 9 ? '9' : item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 bg-[#EF4444] text-white text-xs font-semibold rounded-full px-2 py-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div 
        className="p-4 space-y-2 border-t" 
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="relative group">
          <button
            onClick={onSettings}
            className="w-full flex items-center rounded-xl transition-all active:scale-95"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              padding: isCollapsed ? '12px 0' : '12px 16px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px'
            }}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50"
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <span className="text-sm font-medium">Settings</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}