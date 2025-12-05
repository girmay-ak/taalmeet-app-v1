import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupFlow } from './screens/signup/SignupFlow';
import { HomeScreenDesktop } from './screens/HomeScreenDesktop';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { DiscoverScreenDesktop } from './screens/DiscoverScreenDesktop';
import { MessagesScreen } from './screens/MessagesScreen';
import { MessagesScreenDesktop } from './screens/MessagesScreenDesktop';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PartnerProfileScreen } from './screens/PartnerProfileScreen';
import { MapScreen } from './screens/MapScreen';
import { EnhancedMapScreen } from './screens/EnhancedMapScreen';
import { ConnectionsScreen } from './screens/ConnectionsScreen';
import { AvailableScreen } from './screens/AvailableScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LanguagePreferencesScreen } from './screens/LanguagePreferencesScreen';
import { PrivacySafetyScreen } from './screens/PrivacySafetyScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';
import { mockConversations } from './data/mockData';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface ScreenConfig {
  name: string;
  component: React.ReactNode;
  description: string;
  category: 'Auth' | 'Main' | 'Social' | 'Settings' | 'Maps';
  isMobile?: boolean;
}

export default function ScreenshotGallery() {
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  const mockNavigate = () => {};
  const mockNavigateBack = () => {};

  const screens: ScreenConfig[] = [
    // Auth Screens
    {
      name: 'Splash Screen',
      component: <SplashScreen onFinish={() => {}} />,
      description: 'App launch animation',
      category: 'Auth',
      isMobile: true
    },
    {
      name: 'Login Screen',
      component: <LoginScreen onLogin={() => {}} onNavigateToSignup={() => {}} />,
      description: 'User authentication',
      category: 'Auth',
      isMobile: true
    },
    {
      name: 'Signup Flow',
      component: <SignupFlow onComplete={() => {}} onBack={() => {}} />,
      description: 'Multi-step registration',
      category: 'Auth',
      isMobile: true
    },
    
    // Main Screens - Mobile
    {
      name: 'Home (Mobile)',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <DiscoverScreen 
            onPartnerClick={mockNavigate}
            onNavigateToMap={mockNavigate}
            onNavigateToConnections={mockNavigate}
            onNavigateToAvailable={mockNavigate}
            onNavigateToChat={mockNavigate}
          />
        </div>
      ),
      description: 'Main discovery feed mobile',
      category: 'Main',
      isMobile: true
    },
    {
      name: 'Home (Desktop)',
      component: (
        <HomeScreenDesktop 
          onPartnerClick={mockNavigate}
          onNavigateToMap={mockNavigate}
          onNavigateToConnections={mockNavigate}
          onNavigateToAvailable={mockNavigate}
          onNavigateToChat={mockNavigate}
        />
      ),
      description: 'Dashboard with analytics',
      category: 'Main',
      isMobile: false
    },
    {
      name: 'Discover (Desktop)',
      component: (
        <DiscoverScreenDesktop 
          onPartnerClick={mockNavigate}
          onNavigateToMap={mockNavigate}
          onNavigateToConnections={mockNavigate}
          onNavigateToAvailable={mockNavigate}
          onNavigateToChat={mockNavigate}
        />
      ),
      description: 'Partner discovery with split view',
      category: 'Main',
      isMobile: false
    },
    
    // Social Screens
    {
      name: 'Messages (Mobile)',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <MessagesScreen conversations={mockConversations} onConversationClick={mockNavigate} />
        </div>
      ),
      description: 'Conversations list',
      category: 'Social',
      isMobile: true
    },
    {
      name: 'Messages (Desktop)',
      component: (
        <MessagesScreenDesktop 
          conversations={mockConversations} 
          onConversationClick={mockNavigate}
          selectedConversationId={mockConversations[0]?.id}
          onBack={mockNavigateBack}
        />
      ),
      description: 'Split-view messaging',
      category: 'Social',
      isMobile: false
    },
    {
      name: 'Chat Screen',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <ChatScreen 
            conversation={mockConversations[0]} 
            onBack={mockNavigateBack}
            onProfileClick={mockNavigate}
          />
        </div>
      ),
      description: 'One-on-one chat',
      category: 'Social',
      isMobile: true
    },
    {
      name: 'Connections',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <ConnectionsScreen onBack={mockNavigateBack} onPartnerClick={mockNavigate} />
        </div>
      ),
      description: 'Manage connections',
      category: 'Social',
      isMobile: true
    },
    {
      name: 'Available Status',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <AvailableScreen onBack={mockNavigateBack} />
        </div>
      ),
      description: 'Set availability',
      category: 'Social',
      isMobile: true
    },
    
    // Profile Screens
    {
      name: 'User Profile',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <ProfileScreen onNavigateToSettings={mockNavigate} onBack={mockNavigateBack} />
        </div>
      ),
      description: 'Your profile',
      category: 'Settings',
      isMobile: true
    },
    {
      name: 'Partner Profile',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <PartnerProfileScreen 
            partnerId="1"
            onBack={mockNavigateBack}
            onMessage={mockNavigate}
          />
        </div>
      ),
      description: 'View partner details',
      category: 'Social',
      isMobile: true
    },
    
    // Settings Screens
    {
      name: 'Settings',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <SettingsScreen 
            onBack={mockNavigateBack}
            onNavigateToLanguagePreferences={mockNavigate}
            onNavigateToPrivacy={mockNavigate}
            onNavigateToHelp={mockNavigate}
          />
        </div>
      ),
      description: 'App settings',
      category: 'Settings',
      isMobile: true
    },
    {
      name: 'Language Preferences',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <LanguagePreferencesScreen onBack={mockNavigateBack} />
        </div>
      ),
      description: 'Manage languages',
      category: 'Settings',
      isMobile: true
    },
    {
      name: 'Privacy & Safety',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <PrivacySafetyScreen onBack={mockNavigateBack} />
        </div>
      ),
      description: 'Privacy controls',
      category: 'Settings',
      isMobile: true
    },
    {
      name: 'Help & Support',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <HelpSupportScreen onBack={mockNavigateBack} />
        </div>
      ),
      description: 'Get help',
      category: 'Settings',
      isMobile: true
    },
    
    // Map Screens
    {
      name: 'Basic Map',
      component: (
        <div className="w-[393px] h-[852px] mx-auto relative overflow-hidden">
          <MapScreen onBack={mockNavigateBack} onPartnerClick={mockNavigate} />
        </div>
      ),
      description: 'Map view',
      category: 'Maps',
      isMobile: true
    },
    {
      name: 'Enhanced Map',
      component: (
        <EnhancedMapScreen onBack={mockNavigateBack} onPartnerClick={mockNavigate} />
      ),
      description: 'Advanced map features',
      category: 'Maps',
      isMobile: false
    },
  ];

  const categories = ['All', 'Auth', 'Main', 'Social', 'Settings', 'Maps'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredScreens = screens.filter(screen => {
    const categoryMatch = activeCategory === 'All' || screen.category === activeCategory;
    const viewMatch = viewMode === 'mobile' ? screen.isMobile !== false : screen.isMobile === false;
    return categoryMatch;
  });

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 border-b" style={{ 
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  TaalMeet Screenshot Gallery
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {filteredScreens.length} screens available - Click any screen to view full size
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <button
                  onClick={() => setViewMode('mobile')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: viewMode === 'mobile' ? 'var(--color-primary)' : 'transparent',
                    color: viewMode === 'mobile' ? '#FFFFFF' : 'var(--color-text-muted)'
                  }}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="font-medium">Mobile</span>
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: viewMode === 'desktop' ? 'var(--color-primary)' : 'transparent',
                    color: viewMode === 'desktop' ? '#FFFFFF' : 'var(--color-text-muted)'
                  }}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium">Desktop</span>
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium"
                  style={{
                    backgroundColor: activeCategory === category ? 'var(--color-primary)' : 'var(--color-background)',
                    color: activeCategory === category ? '#FFFFFF' : 'var(--color-text-muted)'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Screen Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreens.map((screen, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
                onClick={() => setSelectedScreen(screen.name)}
              >
                {/* Preview */}
                <div className="aspect-[9/19] overflow-hidden relative bg-black/5">
                  <div className="scale-[0.4] origin-top-left w-[250%] h-[250%]">
                    {screen.component}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                      View Full Size
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {screen.name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-md whitespace-nowrap" style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF'
                    }}>
                      {screen.category}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {screen.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Screen Modal */}
        {selectedScreen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedScreen(null)}
          >
            <div className="relative max-w-7xl w-full h-full flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-card)' }}>
                <div>
                  <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                    {selectedScreen}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Press ESC to close or click outside
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScreen(null);
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'var(--color-text)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Screen Preview */}
              <div 
                className="flex-1 overflow-auto rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {screens.find(s => s.name === selectedScreen)?.component}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="p-6 rounded-2xl border" style={{ 
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)'
          }}>
            <h3 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              📸 How to Take Screenshots
            </h3>
            <ol className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <li><strong>1.</strong> Click on any screen card to view it in full size</li>
              <li><strong>2.</strong> Use your system screenshot tool:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• <strong>Mac:</strong> Cmd + Shift + 4 (then select area)</li>
                  <li>• <strong>Windows:</strong> Windows + Shift + S</li>
                  <li>• <strong>Browser:</strong> Use your browser's screenshot extension</li>
                </ul>
              </li>
              <li><strong>3.</strong> Toggle between Mobile and Desktop views using the buttons above</li>
              <li><strong>4.</strong> Use category filters to organize your screenshots</li>
              <li><strong>5.</strong> For React Native, capture mobile screens at 393x852 (iPhone 14 Pro size)</li>
            </ol>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
