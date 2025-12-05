import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './screens/LandingPage';
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
import { NotificationsScreen } from './screens/NotificationsScreen';
import { mockConversations } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import ScreenshotGallery from './ScreenshotGallery';

type Screen = 
  | 'landing'
  | 'splash'
  | 'login'
  | 'signup'
  | 'home' 
  | 'discover' 
  | 'map' 
  | 'available'
  | 'messages' 
  | 'connections' 
  | 'profile'
  | 'chat'
  | 'partner-profile'
  | 'settings'
  | 'language-preferences'
  | 'privacy-safety'
  | 'help-support'
  | 'notifications'
  | 'screenshot-gallery';

export default function App() {
  // Check URL for screenshot mode
  const isScreenshotMode = window.location.search.includes('screenshots') || window.location.hash.includes('screenshots');
  
  if (isScreenshotMode) {
    return <ScreenshotGallery />;
  }

  const [showSplash, setShowSplash] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [screenHistory, setScreenHistory] = useState<Screen[]>(['landing']);

  // Calculate unread messages count
  const unreadCount = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Navigate to a screen
  const navigateTo = (screen: Screen) => {
    setScreenHistory([...screenHistory, currentScreen]);
    setCurrentScreen(screen);
  };

  // Navigate back
  const navigateBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setCurrentScreen(previousScreen);
      setScreenHistory(screenHistory.slice(0, -1));
    }
  };

  // Handle partner profile view
  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    navigateTo('partner-profile');
  };

  // Handle conversation click
  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    navigateTo('chat');
  };

  // Handle message from partner profile
  const handleMessageFromProfile = () => {
    setSelectedConversationId('2'); // Default to Sophie's conversation
    navigateTo('chat');
  };

  // Handle navigate to chat from match popup
  const handleNavigateToChat = (partnerId: string) => {
    // Find or create conversation for this partner
    setSelectedConversationId(partnerId);
    setCurrentScreen('messages'); // Go to messages screen first to show the conversation
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setCurrentScreen(tab as Screen);
    setScreenHistory([]);
  };

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('discover');
  };

  // Handle signup
  const handleSignup = () => {
    setCurrentScreen('signup');
  };

  // Handle signup complete
  const handleSignupComplete = () => {
    setIsAuthenticated(true);
    setCurrentScreen('discover');
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    setScreenHistory([]);
  };

  // Show splash screen
  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  // Show landing page
  if (currentScreen === 'landing') {
    return (
      <ThemeProvider>
        <LandingPage
          onGetStarted={() => setCurrentScreen('signup')}
          onLogin={() => setCurrentScreen('login')}
        />
      </ThemeProvider>
    );
  }

  // Show signup flow
  if (!isAuthenticated && currentScreen === 'signup') {
    return (
      <ThemeProvider>
        <SignupFlow
          onComplete={handleSignupComplete}
          onBackToLogin={handleBackToLogin}
        />
      </ThemeProvider>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated && currentScreen === 'login') {
    return (
      <ThemeProvider>
        <LoginScreen
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </ThemeProvider>
    );
  }

  // Determine if we should show bottom nav
  const showBottomNav = !['chat', 'partner-profile', 'settings', 'language-preferences', 'privacy-safety', 'help-support'].includes(currentScreen);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <ThemeProvider>
      <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Desktop Layout - Sidebar + Content */}
        <div className="flex h-full">
          {/* Sidebar - Desktop Only */}
          {currentScreen !== 'landing' && currentScreen !== 'signup' && currentScreen !== 'login' && (
            <Sidebar 
              activeTab={currentScreen}
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              userAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
              userName="Sarah Chen"
              isPremium={false}
              onSettings={() => setCurrentScreen('settings')}
              unreadMessages={3}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 h-full relative">
            {/* Mobile Container - Only on small screens */}
            <div className="max-w-lg lg:max-w-none mx-auto h-full relative shadow-2xl lg:shadow-none" style={{ backgroundColor: 'var(--color-background)' }}>
              {/* Screen Content */}
              <div className="h-full">
                {currentScreen === 'home' && (
                  <div className="h-full">
                    <HomeScreenDesktop 
                      onPartnerClick={handlePartnerClick}
                      onNavigateToDiscover={() => setCurrentScreen('discover')}
                      onNavigateToMessages={() => setCurrentScreen('messages')}
                    />
                  </div>
                )}

                {currentScreen === 'discover' && (
                  <>
                    {/* Mobile Discover Screen */}
                    <div className="lg:hidden h-full">
                      <DiscoverScreen 
                        onPartnerClick={handlePartnerClick}
                        onNavigateToChat={handleNavigateToChat}
                      />
                    </div>
                    {/* Desktop Discover Screen */}
                    <div className="hidden lg:block h-full">
                      <DiscoverScreenDesktop 
                        onPartnerClick={handlePartnerClick}
                        onNavigateToChat={handleNavigateToChat}
                        onSessionClick={(session) => console.log('Session clicked:', session)}
                      />
                    </div>
                  </>
                )}

                {currentScreen === 'map' && (
                  <EnhancedMapScreen 
                    onPartnerClick={handlePartnerClick}
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'available' && (
                  <AvailableScreen />
                )}

                {currentScreen === 'messages' && (
                  <>
                    {/* Mobile Messages Screen */}
                    <div className="lg:hidden h-full">
                      <MessagesScreen onConversationClick={handleConversationClick} />
                    </div>
                    {/* Desktop Messages Screen */}
                    <div className="hidden lg:block h-full">
                      <MessagesScreenDesktop initialConversationId={selectedConversationId || undefined} />
                    </div>
                  </>
                )}

                {currentScreen === 'connections' && (
                  <ConnectionsScreen onPartnerClick={handlePartnerClick} />
                )}

                {currentScreen === 'profile' && (
                  <ProfileScreen
                    onNavigateToSettings={() => navigateTo('settings')}
                    onNavigateToLanguagePreferences={() => navigateTo('language-preferences')}
                    onNavigateToPrivacy={() => navigateTo('privacy-safety')}
                    onNavigateToHelp={() => navigateTo('help-support')}
                    onLogout={handleLogout}
                  />
                )}

                {currentScreen === 'chat' && selectedConversationId && (
                  <ChatScreen
                    conversationId={selectedConversationId}
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'partner-profile' && selectedPartnerId && (
                  <PartnerProfileScreen
                    partnerId={selectedPartnerId}
                    onBack={navigateBack}
                    onMessage={handleMessageFromProfile}
                  />
                )}

                {currentScreen === 'settings' && (
                  <SettingsScreen
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'language-preferences' && (
                  <LanguagePreferencesScreen
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'privacy-safety' && (
                  <PrivacySafetyScreen
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'help-support' && (
                  <HelpSupportScreen
                    onBack={navigateBack}
                  />
                )}

                {currentScreen === 'notifications' && (
                  <NotificationsScreen
                    onBack={navigateBack}
                  />
                )}
              </div>

              {/* Bottom Navigation */}
              {showBottomNav && (
                <BottomNav
                  currentTab={currentScreen}
                  onTabChange={handleTabChange}
                  unreadMessages={unreadCount}
                />
              )}
            </div>

            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#E91E8C]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5FB3B3]/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}