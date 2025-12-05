import { Home, Map, MessageCircle, User, Clock } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages?: number;
}

export function BottomNav({ currentTab, onTabChange, unreadMessages = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'discover', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Maps' },
    { id: 'available', icon: Clock, label: 'Available' },
    { id: 'messages', icon: MessageCircle, label: 'Chat', badge: unreadMessages },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t safe-bottom z-50" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95"
            >
              <div className="relative">
                {isActive ? (
                  <div className="relative">
                    {/* Active background circle */}
                    <div className="absolute -inset-2 bg-gradient-primary rounded-full opacity-20" />
                    <Icon 
                      className="w-6 h-6 transition-colors relative z-10" 
                      style={{ 
                        color: '#1DB954'
                      }}
                    />
                  </div>
                ) : (
                  <Icon className="w-6 h-6 text-[#9CA3AF] transition-colors" />
                )}
                
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1DB954] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              
              <span 
                className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-[#1DB954]' : 'text-[#9CA3AF]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}